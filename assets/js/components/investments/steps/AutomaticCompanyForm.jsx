import React, { useState } from 'react';
import { Form, Input, Button, Alert, Card, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import CompanyDetails from './CompanyDetails';
import { fetchCompanyDetails } from '@/services/company/companyService';

const { Option } = Select;

const AutomaticCompanyForm = ({ onNext, onBack }) => {
  const { t } = useTranslation('investments');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const sectors = [
    { value: 'technology', label: t('company_details.sectors.technology') },
    { value: 'healthcare', label: t('company_details.sectors.healthcare') },
    { value: 'finance', label: t('company_details.sectors.finance') },
    { value: 'retail', label: t('company_details.sectors.retail') },
    {
      value: 'manufacturing',
      label: t('company_details.sectors.manufacturing'),
    },
    { value: 'energy', label: t('company_details.sectors.energy') },
    { value: 'education', label: t('company_details.sectors.education') },
    { value: 'other', label: t('company_details.sectors.other') },
  ];

  const handleSearch = async values => {
    try {
      setLoading(true);
      setError(null);

      const cleanSiren = values.siren.replace(/\s/g, '');
      const data = await fetchCompanyDetails(cleanSiren, t);

      if (data) {
        setCompanyData(data);
        setShowConfirmation(true);
      } else {
        setError(t('company_details.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = values => {
    onNext({
      ...companyData,
      sector: values.sector,
    });
  };

  if (showConfirmation && companyData) {
    return (
      <div className="company-confirmation px-1 sm:px-2">
        <Card
          title={t('company_details.confirmation_title')}
          className="mb-4"
          styles={{
            header: { padding: '12px 16px', fontSize: '16px' },
            body: { padding: '12px 16px' },
          }}
        >
          <CompanyDetails company={companyData} />
          <Form onFinish={handleConfirm} className="mt-4">
            <Form.Item
              name="sector"
              label={t('company_details.company.sector')}
              rules={[
                {
                  required: true,
                  message: t('company_details.sector_required'),
                },
              ]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Select
                placeholder={t('company_details.select_sector')}
                popupMatchSelectWidth={false}
              >
                {sectors.map(sector => (
                  <Option key={sector.value} value={sector.value}>
                    {sector.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
              <Button
                onClick={() => {
                  setShowConfirmation(false);
                  setCompanyData(null);
                  form.resetFields();
                }}
                className="w-full sm:w-auto mb-2 sm:mb-0"
              >
                {t('common.back')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full sm:w-auto"
              >
                {t('common.confirm')}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSearch}
      className="px-1 sm:px-2"
    >
      {error && (
        <Alert message={error} type="error" showIcon className="mb-4" />
      )}

      <Form.Item
        name="siren"
        label={t('company_details.company.details.siren')}
        rules={[
          { required: true, message: t('company_details.siren_required') },
          {
            pattern: /^\d{9}$/,
            message: t('company_details.siren_invalid'),
          },
        ]}
        normalize={value => (value ? value.replace(/\s/g, '') : '')}
        getValueFromEvent={e => {
          const value = e.target.value;
          return value ? value.replace(/\s/g, '') : '';
        }}
      >
        <Input
          placeholder={t('company_details.siren_placeholder')}
          minLength={9}
          maxLength={9}
          disabled={loading}
          onChange={e => {
            const value = e.target.value;
            if (value) {
              const cleanValue = value.replace(/\s/g, '');
              if (cleanValue !== value) {
                form.setFieldsValue({ siren: cleanValue });
              }
            }
          }}
          onPaste={e => {
            const clipboardData = e.clipboardData || window.clipboardData;
            const pastedText = clipboardData.getData('Text');
            if (pastedText) {
              e.preventDefault();
              const cleanValue = pastedText.replace(/\s/g, '');
              form.setFieldsValue({ siren: cleanValue });
            }
          }}
        />
      </Form.Item>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-blue-50 rounded-lg mb-4">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-center">
            <p className="text-base sm:text-lg font-medium text-blue-700 mb-2">
              {t('company_details.loading.title')}
            </p>
            <p className="text-xs sm:text-sm text-blue-600">
              {t('company_details.loading.description')}
            </p>
          </div>
        </div>
      ) : (
        <Form.Item className="flex justify-end gap-3 flex-nowrap sm:flex-nowrap">
          <Button
            className="mx-2"
            onClick={() => {
              setShowConfirmation(false);
              setCompanyData(null);
              onBack();
            }}
          >
            {t('common.back')}
          </Button>
          <Button className="mx-2" type="primary" htmlType="submit">
            {t('common.search')}
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default AutomaticCompanyForm;
