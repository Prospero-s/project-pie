import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/common/breadcrumb/Breadcrumb';
import { Button, Form, Input, message } from 'antd';
import { Auth } from 'aws-amplify';
import axios from 'axios';

const Support = () => {
  const { t } = useTranslation('support');
  const { TextArea } = Input;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async values => {
    try {
      setLoading(true);

      // Obtenir les informations d'authentification
      const session = await Auth.currentSession();
      const jwtToken = session.getIdToken().getJwtToken();
      const cognitoId = session.getIdToken().payload.sub;
      const email = session.getIdToken().payload.email;
      const name = session.getIdToken().payload.name;

      // Envoyer la demande de support
      await axios.post(
        '/api/support/submit',
        {
          title: values.title,
          description: values.description,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'x-cognito-id': cognitoId,
            'x-cognito-email': email,
            'x-cognito-name': name,
            'Content-Type': 'application/json',
          },
        },
      );

      message.success(t('success'));
      form.resetFields();
    } catch (error) {
      console.error('Error submitting support request:', error);
      message.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = errorInfo => {
    console.error('Failed:', errorInfo);
    message.error(t('validation_error'));
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb pageName={t('title')} />
      <div className="bg-white rounded-lg border border-slate-300 flex flex-col w-full">
        <div className="overflow-x-auto">
          <div className="mx-auto w-full max-w-[600px] p-4">
            <Form
              form={form}
              name="basic"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label={t('title_label')}
                name="title"
                rules={[{ required: true, message: t('title_required') }]}
              >
                <Input placeholder={t('title_placeholder')} />
              </Form.Item>

              <Form.Item
                label={t('describe_issue')}
                name="description"
                rules={[{ required: true, message: t('description_required') }]}
              >
                <TextArea rows={4} placeholder={t('description_placeholder')} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {t('submit')}
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
