import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Tabs,
  Alert,
  Typography,
  notification,
  Spin,
  Select,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PlusOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { Auth } from 'aws-amplify';
import { useRedirect } from '@/context/redirectContext';

const { Title, Text } = Typography;

const EmailInput = ({
  email,
  role,
  index,
  onEmailChange,
  onRoleChange,
  onRemove,
  t,
}) => (
  <div className="flex items-start gap-2">
    <Form.Item className="flex-1 mb-0">
      <Input
        value={email}
        onChange={e => onEmailChange(index, e.target.value)}
        placeholder={t('invite-email-placeholder')}
        suffix={<UserAddOutlined />}
      />
    </Form.Item>
    <Form.Item className="w-48 mb-0">
      <Select
        value={role}
        onChange={value => onRoleChange(index, value)}
        placeholder={t('role-placeholder')}
      >
        <Select.Option value="ROLE_ADMIN">
          {t('roles.ROLE_ADMIN')}
        </Select.Option>
        <Select.Option value="ROLE_MEMBER">
          {t('roles.ROLE_MEMBER')}
        </Select.Option>
      </Select>
    </Form.Item>
    <Button onClick={() => onRemove(index)} type="text" danger>
      {t('remove-member')}
    </Button>
  </div>
);

const GroupSelection = ({ i18n }) => {
  const { t } = useTranslation('groups', { i18n });
  const navigate = useNavigate();
  const { isCheckingRedirect } = useRedirect();

  // Regrouper les états liés
  const [formState, setFormState] = useState({
    activeTab: 'create',
    groupName: '',
    inviteEmails: [],
    inviteRoles: [],
    pendingInvitations: [],
  });

  const [uiState, setUiState] = useState({
    error: null,
    success: null,
    isLoading: true,
    isRedirecting: false,
  });

  const useAuthHeaders = () => {
    const setupAuthHeaders = async () => {
      const session = await Auth.currentSession();
      const jwtToken = session.getIdToken().getJwtToken();

      axios.defaults.headers.common = {
        Authorization: `Bearer ${jwtToken}`,
        'x-cognito-id': session.getIdToken().payload.sub,
        'x-cognito-email': session.getIdToken().payload.email,
        'x-cognito-name': session.getIdToken().payload.name,
      };

      return true;
    };

    return { setupAuthHeaders };
  };

  const loadPendingInvitations = async () => {
    try {
      setUiState(prevState => ({ ...prevState, isLoading: true }));
      const headersConfigured = await useAuthHeaders().setupAuthHeaders();

      if (!headersConfigured) {
        notification.error({
          message: t('notifications.error.title'),
          description: t('notifications.error.auth_headers'),
          placement: 'topRight',
        });
        throw new Error('Headers non configurés');
      }

      const response = await axios.get('/api/group-invitations/pending');
      setFormState(prevState => ({
        ...prevState,
        pendingInvitations: response.data.invitations,
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        setUiState(prevState => ({ ...prevState, isRedirecting: true }));
        const lang = i18n.language || 'fr';
        await navigate(`/${lang}/auth/signin`, { replace: true });
        return;
      }

      notification.error({
        message: t('notifications.error.title'),
        description: t('notifications.error.load_invitations'),
        placement: 'topRight',
      });
    } finally {
      setUiState(prevState => ({ ...prevState, isLoading: false }));
    }
  };

  useEffect(() => {
    loadPendingInvitations();
  }, []);

  const handleAddEmail = () => {
    setFormState(prevState => ({
      ...prevState,
      inviteEmails: [...prevState.inviteEmails, ''],
      inviteRoles: [...prevState.inviteRoles, 'ROLE_MEMBER'],
    }));
  };

  const handleRemoveEmail = index => {
    const newEmails = formState.inviteEmails.filter((_, i) => i !== index);
    const newRoles = formState.inviteRoles.filter((_, i) => i !== index);
    setFormState(prevState => ({
      ...prevState,
      inviteEmails: newEmails,
      inviteRoles: newRoles,
    }));
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...formState.inviteEmails];
    newEmails[index] = value;
    setFormState(prevState => ({ ...prevState, inviteEmails: newEmails }));
  };

  const handleRoleChange = (index, value) => {
    const newRoles = [...formState.inviteRoles];
    newRoles[index] = value;
    setFormState(prevState => ({ ...prevState, inviteRoles: newRoles }));
  };

  const validateEmail = email => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleCreateGroup = async values => {
    try {
      const validInvitations = formState.inviteEmails
        .map((email, index) => ({
          email: email.trim(),
          role: formState.inviteRoles[index],
        }))
        .filter(inv => inv.email && validateEmail(inv.email));

      setUiState(prevState => ({ ...prevState, isRedirecting: true }));
      await axios.post('/api/user-groups', {
        name: values.name,
        invitations: validInvitations,
      });

      notification.success({
        message: t('notifications.create_success.title'),
        description: t('notifications.create_success.description'),
        placement: 'topRight',
      });

      const currentLang = i18n.language;
      await navigate(`/${currentLang}/dashboard`, { replace: true });
    } catch (error) {
      let errorMessage = t('notifications.create_error.description');
      let errorTitle = t('notifications.create_error.title');

      if (error.response?.data?.error) {
        switch (error.response.data.error) {
          case 'invalid-email':
            errorMessage = t('error.invalid-email');
            break;
          case 'invitation-exists':
            errorMessage = t('error.invitation-exists');
            break;
        }
      }

      notification.error({
        message: errorTitle,
        description: errorMessage,
        placement: 'topRight',
      });

      setUiState(prevState => ({ ...prevState, isRedirecting: false }));
    }
  };

  const handleAcceptInvitation = async token => {
    try {
      setUiState(prevState => ({ ...prevState, isRedirecting: true }));
      await axios.post(`/api/group-invitations/accept/${token}`);
      setUiState(prevState => ({ ...prevState, success: t('join-success') }));
      const currentLang = i18n.language;
      await navigate(`/${currentLang}/dashboard`, { replace: true });
    } catch (error) {
      setUiState(prevState => ({ ...prevState, error: t('join-error') }));
      setUiState(prevState => ({ ...prevState, isRedirecting: false }));
      throw error;
    }
  };

  const handleRefresh = () => {
    loadPendingInvitations();
  };

  const items = [
    {
      key: 'create',
      label: (
        <span className="flex items-center gap-2">
          <PlusOutlined />
          {t('create-new')}
        </span>
      ),
      children: (
        <div className="mt-4 max-w-xl mx-auto">
          <Card className="shadow-lg">
            <Title level={4} className="mb-6">
              {t('create-group-title')}
            </Title>
            <Form onFinish={handleCreateGroup} layout="vertical">
              <Form.Item
                name="name"
                label={t('name')}
                rules={[{ required: true, message: t('name-required') }]}
              >
                <Input placeholder={t('group-name-placeholder')} />
              </Form.Item>

              <Form.Item
                label={t('invite-email')}
                className={formState.inviteEmails.length === 0 ? 'hidden' : ''}
              >
                <div className="space-y-3">
                  {formState.inviteEmails.map((email, index) => (
                    <EmailInput
                      key={index}
                      email={email}
                      role={formState.inviteRoles[index]}
                      index={index}
                      onEmailChange={handleEmailChange}
                      onRoleChange={handleRoleChange}
                      onRemove={handleRemoveEmail}
                      t={t}
                    />
                  ))}
                </div>
              </Form.Item>

              <Button
                type="dashed"
                onClick={handleAddEmail}
                className="w-full mb-4"
                icon={<PlusOutlined />}
              >
                {t('add-member')}
              </Button>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  className="w-full"
                >
                  {t('create')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'join',
      label: (
        <span className="flex items-center gap-2">
          <UserAddOutlined />
          {t('join-existing')}
        </span>
      ),
      children: (
        <div className="mt-4 max-w-xl mx-auto">
          <Card className="shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <Title level={4}>{t('pending-invitations')}</Title>
              <Button onClick={handleRefresh} icon={<ReloadOutlined />}>
                {t('refresh')}
              </Button>
            </div>
            {formState.pendingInvitations.length > 0 ? (
              <div className="space-y-4">
                {formState.pendingInvitations.map(invitation => (
                  <Card
                    key={invitation.token}
                    className="bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong>{invitation.group.name}</Text>
                        <Text className="block text-gray-500">
                          {t('invited-by')}: {invitation.invitedBy.email}
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        onClick={() => handleAcceptInvitation(invitation.token)}
                        icon={<CheckCircleOutlined />}
                      >
                        {t('accept')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t('no-invitations')}
              </div>
            )}
          </Card>
        </div>
      ),
    },
  ];

  if (isCheckingRedirect || uiState.isLoading || uiState.isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {uiState.error && (
        <Alert
          message={uiState.error}
          type="error"
          showIcon
          className="mb-4 max-w-4xl mx-auto"
        />
      )}
      {uiState.success && (
        <Alert
          message={uiState.success}
          type="success"
          showIcon
          className="mb-4 max-w-4xl mx-auto"
        />
      )}
      <div className="flex justify-center">
        <Tabs
          centered
          items={items}
          activeKey={formState.activeTab}
          onChange={key =>
            setFormState(prevState => ({ ...prevState, activeTab: key }))
          }
          className="max-w-4xl w-full"
        />
      </div>
    </div>
  );
};

export default GroupSelection;
