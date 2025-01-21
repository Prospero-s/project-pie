import React, { useState } from 'react';
import { Modal, Steps } from 'antd';
import SelectCreationType from './steps/SelectCreationType';
import ManualCompanyForm from './steps/ManualCompanyForm';
import AutomaticCompanyForm from './steps/AutomaticCompanyForm';
import FundingDetailsForm from './steps/FundingDetailsForm';
import { saveCompany } from '@/services/company/companyService';

const AddCompanyModal = ({ visible, onCancel, onAdd, t }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [creationType, setCreationType] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  const resetState = () => {
    setCurrentStep(0);
    setCreationType(null);
    setCompanyData(null);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const handleFinish = async (fundingData) => {
    try {
      // Combine company and funding data
      const completeData = {
        ...companyData,
        fundingType: fundingData.fundingType,
        amountRaised: fundingData.amountRaised,
        currency: fundingData.currency || 'EUR'
      };

      console.log('completeData', completeData);

      // Save to database
      const savedCompany = await saveCompany(completeData);
      
      // Call the original onAdd callback
      onAdd({ ...companyData, ...fundingData });
      
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
      title: t('company_details.title'),
      content: creationType === 'automatic' ? (
        <AutomaticCompanyForm
          onNext={(data) => {
            setCompanyData(data);
            setCurrentStep(2);
          }}
          t={t}
        />
      ) : (
        <ManualCompanyForm
          onNext={(data) => {
            setCompanyData(data);
            setCurrentStep(2);
          }}
          t={t}
        />
      )
    },
    {
      title: t('funding.title'),
      content: <FundingDetailsForm
        companyData={companyData}
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

export default AddCompanyModal; 