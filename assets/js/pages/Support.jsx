import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/common/breadcrumb/Breadcrumb';
import { Button, Form, Input, message, Alert } from 'antd';
import { Auth } from 'aws-amplify';
import axios from 'axios';

const Support = () => {
  const { t } = useTranslation('support');
  const { TextArea } = Input;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async values => {
    try {
      setLoading(true);
      setError(null);

      // Obtenir les informations d'authentification
      const session = await Auth.currentSession();
      const jwtToken = session.getIdToken().getJwtToken();
      const cognitoId = session.getIdToken().payload.sub;
      const email = session.getIdToken().payload.email;
      const name = session.getIdToken().payload.name;

      console.warn('Sending support request with data:', {
        email,
        name,
        title: values.title,
        description: values.description,
      });

      // Envoyer la demande de support
      const response = await axios.post(
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

      console.warn('Support request response:', response.data);
      message.success(t('success'));
      form.resetFields();
    } catch (error) {
      console.error('Error submitting support request:', error);

      let errorMessage = t('error');
      let errorDetails = null;

      if (error.response) {
        // Erreur HTTP avec réponse du serveur
        console.error(
          'Response error:',
          error.response.status,
          error.response.data,
        );
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMessage;
        errorDetails = `Status: ${error.response.status}`;

        if (error.response.status === 500) {
          errorDetails +=
            ' - Erreur serveur interne. Vérifiez la configuration email.';
        } else if (error.response.status === 401) {
          errorDetails += ' - Problème d&apos;authentification.';
        }
      } else if (error.request) {
        // Erreur réseau
        console.error('Network error:', error.request);
        errorMessage = 'Erreur de connexion au serveur';
        errorDetails = 'Vérifiez votre connexion internet';
      } else {
        // Autre erreur
        console.error('Unknown error:', error.message);
        errorDetails = error.message;
      }

      setError({ message: errorMessage, details: errorDetails });
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = errorInfo => {
    console.error('Form validation failed:', errorInfo);
    message.error(t('validation_error'));
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb pageName={t('title')} />
      <div className="bg-white rounded-lg border border-slate-300 flex flex-col w-full">
        <div className="overflow-x-auto">
          <div className="mx-auto w-full max-w-[600px] p-4">
            {error && (
              <Alert
                message="Erreur lors de l'envoi"
                description={
                  <div>
                    <p>{error.message}</p>
                    {error.details && (
                      <p className="text-sm text-gray-600 mt-2">
                        Détails: {error.details}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      Si le problème persiste, contactez l&apos;administrateur
                      avec ces informations.
                    </p>
                  </div>
                }
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                className="mb-4"
              />
            )}

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
