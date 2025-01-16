import React, { useState } from 'react';
import { Form, Input, Button, Alert, Card, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import EnterpriseDetails from './EnterpriseDetails';
import { fetchEnterpriseDetails } from '@/services/enterprise/enterpriseService';

const { Option } = Select;

const AutomaticEnterpriseForm = ({ onNext }) => {
  const { t } = useTranslation('investments');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enterpriseData, setEnterpriseData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const sectors = [
    { value: 'technology', label: t('enterprise_details.sectors.technology') },
    { value: 'healthcare', label: t('enterprise_details.sectors.healthcare') },
    { value: 'finance', label: t('enterprise_details.sectors.finance') },
    { value: 'retail', label: t('enterprise_details.sectors.retail') },
    { value: 'manufacturing', label: t('enterprise_details.sectors.manufacturing') },
    { value: 'energy', label: t('enterprise_details.sectors.energy') },
    { value: 'education', label: t('enterprise_details.sectors.education') },
    { value: 'other', label: t('enterprise_details.sectors.other') }
  ];

  const handleSearch = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const cleanSiren = values.siren.replace(/\s/g, '');
      const data = await fetchEnterpriseDetails(cleanSiren, t);
      
      if (data) {
        setEnterpriseData(data);
        setShowConfirmation(true);
      } else {
        setError(t('enterprise_details.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (values) => {
    onNext({
      ...enterpriseData,
      sector: values.sector
    });
  };

  if (showConfirmation && enterpriseData) {
    return (
      <div className="enterprise-confirmation">
        <Card title={t('enterprise_details.confirmation_title')} className="mb-4">
          <EnterpriseDetails enterprise={enterpriseData} />
          <Form onFinish={handleConfirm} className="mt-4">
            <Form.Item
              name="sector"
              label={t('enterprise_details.enterprise.sector')}
              rules={[{ required: true, message: t('enterprise_details.sector_required') }]}
            >
              <Select placeholder={t('enterprise_details.select_sector')}>
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
                setEnterpriseData(null);
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
        label={t('enterprise_details.enterprise.details.siren')}
        rules={[
          { required: true, message: t('enterprise_details.siren_required') },
          {
            pattern: /^\d{9}$/,
            message: t('enterprise_details.siren_invalid')
          }
        ]}
        normalize={value => value.replace(/\s/g, '')}
      >
        <Input
          placeholder={t('enterprise_details.siren_placeholder')}
          maxLength={9}
          disabled={loading}
        />
      </Form.Item>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-lg mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-blue-700 mb-2">
              {t('enterprise_details.loading.title')}
            </p>
            <p className="text-sm text-blue-600">
              {t('enterprise_details.loading.description')}
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

export default AutomaticEnterpriseForm; 