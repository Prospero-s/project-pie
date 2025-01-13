import React from 'react';
import { Form, Input, Button, Select } from 'antd';

const { Option } = Select;

const ManualEnterpriseForm = ({ onNext, t }) => {
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

  const onFinish = (values) => {
    onNext({
      denomination: values.denomination.trim(),
      siren: values.siren.replace(/\s/g, ''),
      sector: values.sector,
      formeJuridique: null,
      representants: [],
      adresse: null,
      codeApe: null,
      siret: null,
      updatedAt: null
    });
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="denomination"
        label={t('enterprise_details.enterprise.name')}
        rules={[{ required: true, message: t('enterprise_details.enterprise.name_required') }]}
      >
        <Input placeholder={t('enterprise_details.enterprise.name_placeholder')} />
      </Form.Item>

      <Form.Item
        name="siren"
        label={t('enterprise_details.siren')}
        rules={[{ required: true, message: t('enterprise_details.siren_required') }]}
      >
        <Input placeholder={t('enterprise_details.siren_placeholder')} maxLength={9} />
      </Form.Item>

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

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {t('common.next')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ManualEnterpriseForm; 