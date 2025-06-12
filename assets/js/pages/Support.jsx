import React from 'react';
import Breadcrumb from '@/components/common/breadcrumb/Breadcrumb';
import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

const Support = ({ i18n }) => {
  const { t } = useTranslation('documents', { i18n });
  const { TextArea } = Input;

  const onFinish = values => {
    console.log('Success:', values);
  };
  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb pageName={'Support'} />
      <div className="bg-white rounded-lg border border-slate-300 flex flex-col w-full">
        <div className="overflow-x-auto">
          <div className="mx-auto w-full max-w-[600px] p-4">
            <Form
              name="basic"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="Nom d'utilisateur"
                name="vertical"
                rules={[{ required: true, message: 'Champ requis' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Décrivez le problème rencontré" name="issues">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
