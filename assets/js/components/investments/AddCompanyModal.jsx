import React, { useState, useEffect } from 'react';
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
  const [modalWidth, setModalWidth] = useState(1200);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Fonction pour ajuster la largeur de la modale et détecter les petits écrans
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      // Définir la largeur de la modale à 90% de la largeur de la fenêtre, mais pas plus de 1200px
      setModalWidth(Math.min(windowWidth * 0.9, 1200));
      setIsSmallScreen(windowWidth < 768);
    };

    // Appliquer au chargement et lors du redimensionnement
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const resetState = () => {
    setCurrentStep(0);
    setCreationType(null);
    setCompanyData(null);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const handleFinish = async fundingData => {
    try {
      const completeData = {
        ...companyData,
        fundingType: fundingData.fundingType,
        amountRaised: fundingData.amountRaised,
        currency: fundingData.currency || 'EUR',
        investorId: fundingData.investorId,
      };

      await saveCompany(completeData);
      onAdd({ ...companyData, ...fundingData });
      handleCancel();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const steps = [
    {
      title: t('creation.title'),
      content: (
        <SelectCreationType
          onSelect={setCreationType}
          onNext={() => setCurrentStep(1)}
          t={t}
        />
      ),
    },
    {
      title: t('company_details.title'),
      content:
        creationType === 'automatic' ? (
          <AutomaticCompanyForm
            onNext={data => {
              setCompanyData(data);
              setCurrentStep(2);
            }}
            t={t}
          />
        ) : (
          <ManualCompanyForm
            onNext={data => {
              setCompanyData(data);
              setCurrentStep(2);
            }}
            t={t}
          />
        ),
    },
    {
      title: t('funding.title'),
      content: (
        <FundingDetailsForm
          companyData={companyData}
          onFinish={handleFinish}
          t={t}
        />
      ),
    },
  ];

  return (
    <Modal
      title={t('actions.add_investment')}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={modalWidth}
      centered
      className="add-company-modal"
      styles={{
        body: {
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
          padding: isSmallScreen ? '16px 20px' : '24px 32px',
        },
      }}
    >
      <div className="flex flex-col mt-4">
        <Steps
          current={currentStep}
          items={steps}
          className="mb-6 md:mb-8"
          responsive
          size={isSmallScreen ? 'small' : 'default'}
        />
        <div className="flex-grow px-2 md:px-4">
          {steps[currentStep].content}
        </div>
      </div>
    </Modal>
  );
};

export default AddCompanyModal;
