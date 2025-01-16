import React from 'react';
import { Form, InputNumber, Select, Button } from 'antd';

const FundingDetailsForm = ({ enterpriseData, onFinish, t }) => {
  const [form] = Form.useForm();

  const currencies = [
    { value: 'EUR', label: '€ (EUR)' },
    { value: 'USD', label: '$ (USD)' },
    { value: 'GBP', label: '£ (GBP)' }
  ];

  const fundingTypes = [
    { value: 'seed', label: t('funding.types.seed') },
    { value: 'serieA', label: t('funding.types.serieA') },
    { value: 'serieB', label: t('funding.types.serieB') },
    { value: 'serieC', label: t('funding.types.serieC') },
    { value: 'growth', label: t('funding.types.growth') },
    { value: 'ipo', label: t('funding.types.ipo') }
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        currency: enterpriseData?.devise || 'EUR'
      }}
    >
      <Form.Item
        name="fundingType"
        label={t('funding.type')}
        rules={[{ required: true, message: t('funding.type_required') }]}
      >
        <Select placeholder={t('funding.select_type')}>
          {fundingTypes.map(type => (
            <Select.Option key={type.value} value={type.value}>
              {type.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <div className="flex gap-4">
        <Form.Item
          name="amountRaised"
          label={t('funding.amount')}
          rules={[{ required: true, message: t('funding.amount_required') }]}
          className="flex-1"
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            parser={value => value.replace(/\s/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="currency"
          label={t('funding.currency')}
          rules={[{ required: true, message: t('funding.currency_required') }]}
        >
          <Select style={{ width: 120 }}>
            {currencies.map(currency => (
              <Select.Option key={currency.value} value={currency.value}>
                {currency.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {t('common.finish')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FundingDetailsForm; 