import React, { useState } from 'react';
import { Form, Input, Button, Alert, Card, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import CompanyDetails from './CompanyDetails';
import { fetchCompanyDetails } from '@/services/company/companyService';

const { Option } = Select;

const AutomaticCompanyForm = ({ onNext }) => {
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
    { value: 'manufacturing', label: t('company_details.sectors.manufacturing') },
    { value: 'energy', label: t('company_details.sectors.energy') },
    { value: 'education', label: t('company_details.sectors.education') },
    { value: 'other', label: t('company_details.sectors.other') }
  ];

  const handleSearch = async (values) => {
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

  const handleConfirm = (values) => {
    onNext({
      ...companyData,
      sector: values.sector
    });
  };

  if (showConfirmation && companyData) {
    return (
      <div className="company-confirmation">
        <Card title={t('company_details.confirmation_title')} className="mb-4">
          <CompanyDetails company={companyData} />
          <Form onFinish={handleConfirm} className="mt-4">
            <Form.Item
              name="sector"
              label={t('company_details.company.sector')}
              rules={[{ required: true, message: t('company_details.sector_required') }]}
            >
              <Select placeholder={t('company_details.select_sector')}>
                {sectors.map(sector => (
                  <Option key={sector.value} value={sector.value}>
                    {sector.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <div className="flex justify-end gap-3">
              <Button onClick={() => {
                setShowConfirmation(false);
                setCompanyData(null);
                form.resetFields();
              }}>
                {t('common.back')}
              </Button>
              <Button type="primary" htmlType="submit">
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
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Form.Item
        name="siren"
        label={t('company_details.company.details.siren')}
        rules={[
          { required: true, message: t('company_details.siren_required') },
          {
            pattern: /^\d{9}$/,
            message: t('company_details.siren_invalid')
          }
        ]}
        normalize={value => value.replace(/\s/g, '')}
      >
        <Input
          placeholder={t('company_details.siren_placeholder')}
          maxLength={9}
          disabled={loading}
        />
      </Form.Item>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-lg mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-blue-700 mb-2">
              {t('company_details.loading.title')}
            </p>
            <p className="text-sm text-blue-600">
              {t('company_details.loading.description')}
            </p>
          </div>
        </div>
      ) : (
        <Form.Item className="flex justify-end">
          <Button type="primary" htmlType="submit">
            {t('common.search')}
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default AutomaticCompanyForm; 