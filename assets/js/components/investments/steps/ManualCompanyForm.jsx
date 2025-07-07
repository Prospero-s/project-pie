import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import { CheckOutlined, UndoOutlined } from '@ant-design/icons';

const { Option } = Select;

const ManualCompanyForm = ({ onNext, onBack, t }) => {
  const [form] = Form.useForm();
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

  const onFinish = values => {
    onNext({
      denomination: values.denomination.trim(),
      siren: values.siren.replace(/\s/g, ''),
      sector: values.sector,
      businessStructures: null,
      representants: [],
      adresse: null,
      codeApe: null,
      siret: null,
      updatedAt: null,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      className="px-1 sm:px-2"
      onFinish={onFinish}
    >
      <Form.Item
        name="denomination"
        label={t('company_details.company.name')}
        rules={[
          {
            required: true,
            message: t('company_details.company.name_required'),
          },
        ]}
      >
        <Input placeholder={t('company_details.company.name_placeholder')} />
      </Form.Item>

      <Form.Item
        name="siren"
        label={t('company_details.siren')}
        rules={[
          { required: true, message: t('company_details.siren_required') },
          { pattern: /^\d{9}$/, message: t('company_details.siren_invalid') },
        ]}
      >
        <Input
          placeholder={t('company_details.siren_placeholder')}
          maxLength={9}
          inputMode="numeric"
          onPaste={e => {
            const pasted = e.clipboardData.getData('Text') || '';
            const cleaned = pasted.replace(/\D/g, '').slice(0, 9); // Supprime non-chiffres, max 9

            e.preventDefault();
            form.setFieldsValue({ siren: cleaned });
          }}
          onChange={e => {
            const cleaned = e.target.value.replace(/\D/g, '').slice(0, 9);
            form.setFieldsValue({ siren: cleaned });
          }}
        />
      </Form.Item>

      <Form.Item
        name="sector"
        label={t('company_details.company.sector')}
        rules={[
          { required: true, message: t('company_details.sector_required') },
        ]}
      >
        <Select placeholder={t('company_details.select_sector')}>
          {sectors.map(sector => (
            <Option key={sector.value} value={sector.value}>
              {sector.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item className="flex justify-end gap-3 flex-nowrap sm:flex-nowrap">
        <Button icon={<UndoOutlined />} className="mx-2" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button
          icon={<CheckOutlined />}
          className="mx-2"
          type="primary"
          htmlType="submit"
        >
          {t('common.next')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ManualCompanyForm;
