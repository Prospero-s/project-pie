import React, { useState } from 'react';
import { Modal, Form, Input, Button, Select, notification } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const InviteMemberModal = ({ visible, onClose, onSuccess, groupId, user, i18n }) => {
  const { t } = useTranslation('settings', { i18n });
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await axios.post('/api/group-invitations', {
        email: values.email,
        groupId: groupId,
        role: values.role
      }, {
        headers: {
          'x-cognito-id': user?.id,
          'x-cognito-email': user?.email,
          'x-cognito-name': user?.user_metadata?.full_name
        }
      });

      form.resetFields();
      onSuccess();
    } catch (error) {
      if (error.response?.data?.error === 'invitation-exists') {
        notification.error({
          message: t('sections.group.invitation_exists')
        });
      } else {
        notification.error({
          message: t('sections.group.error_inviting'),
          description: error.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={t('sections.group.invite_member')}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {t('sections.group.send_invitation')}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ role: 'ROLE_MEMBER' }}
      >
        <Form.Item
          name="email"
          label={t('sections.group.email')}
          rules={[
            { required: true, message: t('sections.group.email_required') },
            { type: 'email', message: t('sections.group.invalid_email') }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t('sections.group.email_placeholder')}
          />
        </Form.Item>

        <Form.Item
          name="role"
          label={t('sections.group.role')}
          rules={[
            { required: true, message: t('sections.group.role_required') }
          ]}
        >
          <Select>
            <Option value="ROLE_ADMIN">{t('sections.group.roles.admin')}</Option>
            <Option value="ROLE_MEMBER">{t('sections.group.roles.member')}</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InviteMemberModal; 