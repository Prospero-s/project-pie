import React, { useState } from 'react';
import { Modal, Steps } from 'antd';
import SelectCreationType from './steps/SelectCreationType';
import ManualEnterpriseForm from './steps/ManualEnterpriseForm';
import AutomaticEnterpriseForm from './steps/AutomaticEnterpriseForm';
import FundingDetailsForm from './steps/FundingDetailsForm';
import { saveEnterprise } from '@/services/enterprise/enterpriseService';

const AddEnterpriseModal = ({ visible, onCancel, onAdd, t }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [creationType, setCreationType] = useState(null);
  const [enterpriseData, setEnterpriseData] = useState(null);

  const resetState = () => {
    setCurrentStep(0);
    setCreationType(null);
    setEnterpriseData(null);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const handleFinish = async (fundingData) => {
    try {
      // Combine enterprise and funding data
      const completeData = {
        ...enterpriseData,
        fundingType: fundingData.fundingType,
        amountRaised: fundingData.amountRaised,
        currency: fundingData.currency || 'EUR'
      };

      console.log('completeData', completeData);

      // Save to database
      const savedEnterprise = await saveEnterprise(completeData);
      
      // Call the original onAdd callback
      onAdd({ ...enterpriseData, ...fundingData });
      
      // Close modal
      handleCancel();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // L'erreur sera déjà gérée par le service via les notifications
    }
  };

  const steps = [
    {
      title: t('creation.title'),
      content: <SelectCreationType 
        onSelect={setCreationType} 
        onNext={() => setCurrentStep(1)}
        t={t}
      />
    },
    {
      title: t('enterprise_details.title'),
      content: creationType === 'automatic' ? (
        <AutomaticEnterpriseForm
          onNext={(data) => {
            setEnterpriseData(data);
            setCurrentStep(2);
          }}
          t={t}
        />
      ) : (
        <ManualEnterpriseForm
          onNext={(data) => {
            setEnterpriseData(data);
            setCurrentStep(2);
          }}
          t={t}
        />
      )
    },
    {
      title: t('funding.title'),
      content: <FundingDetailsForm
        enterpriseData={enterpriseData}
        onFinish={handleFinish}
        t={t}
      />
    }
  ];

  return (
    <Modal
      title={t('actions.add_investment')}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      centered
      className="!max-w-[100vw]"
    >
      <div className="flex flex-col">
        <Steps current={currentStep} items={steps} className="mb-8" />
        <div className="flex-grow">
          {steps[currentStep].content}
        </div>
      </div>
    </Modal>
  );
};

export default AddEnterpriseModal; 