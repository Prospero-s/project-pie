import React, { useState, useEffect } from 'react';
import { Card, Button, List, Avatar, Tag, Spin, notification, Select } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import InviteMemberModal from '../modals/InviteMemberModal';
import { useTranslation } from 'react-i18next';

const GroupSettings = ({ user, i18n }) => {
  const { t } = useTranslation('settings', { i18n });
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, []);

  const fetchGroupData = async () => {
    try {
      const response = await axios.get('/api/user-groups', {
        headers: {
          'x-cognito-id': user?.id,
          'x-cognito-email': user?.email,
          'x-cognito-name': user?.user_metadata?.full_name
        }
      });
      
      if (response.data.groups && response.data.groups.length > 0) {
        setGroup(response.data.groups[0]);
        const isOwner = response.data.groups[0].owner.email === user?.email;
        setUserRole(isOwner ? 'ROLE_OWNER' : response.data.groups[0].currentUserRole || 'ROLE_MEMBER');
      }
      setLoading(false);
    } catch (error) {
      notification.error({
        message: t('sections.group.error_loading'),
        description: error.message
      });
      setLoading(false);
    }
  };

  const handleInvitationSuccess = () => {
    setIsInviteModalVisible(false);
    notification.success({
      message: t('sections.group.invitation_sent')
    });
    fetchGroupData();
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      setChangingRole(true);
      await axios.put(`/api/user-groups/${group.id}/members/${memberId}/role`, {
        role: newRole
      }, {
        headers: {
          'x-cognito-id': user?.id,
          'x-cognito-email': user?.email,
          'x-cognito-name': user?.user_metadata?.full_name
        }
      });

      notification.success({
        message: t('sections.group.role_updated')
      });
      
      fetchGroupData();
    } catch (error) {
      notification.error({
        message: t('sections.group.error_updating_role'),
        description: error.message
      });
    } finally {
      setChangingRole(false);
    }
  };

  const getRoleLabel = (role) => {
    const roleKey = role?.toLowerCase()?.replace('role_', '') || 'member';
    return t(`sections.group.roles.${roleKey}`);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_OWNER':
        return 'gold';
      case 'ROLE_ADMIN':
        return 'blue';
      default:
        return 'default';
    }
  };

  const renderMemberRole = (member) => {
    if (member.email === group.owner.email) {
      return <Tag color="gold">{getRoleLabel('ROLE_OWNER')}</Tag>;
    }

    if (canManageRoles) {
      return (
        <Select
          value={member.role || 'ROLE_MEMBER'}
          onChange={(newRole) => handleRoleChange(member.id, newRole)}
          disabled={changingRole}
          style={{ width: 140 }}
        >
          <Select.Option value="ROLE_ADMIN">
            {getRoleLabel('ROLE_ADMIN')}
          </Select.Option>
          <Select.Option value="ROLE_MEMBER">
            {getRoleLabel('ROLE_MEMBER')}
          </Select.Option>
        </Select>
      );
    }

    return (
      <Tag color={getRoleColor(member.role || 'ROLE_MEMBER')}>
        {getRoleLabel(member.role || 'ROLE_MEMBER')}
      </Tag>
    );
  };

  if (loading) {
    return <Spin />;
  }

  if (!group) {
    return (
      <Card>
        <div className="text-center py-8">
          <p>{t('sections.group.no_group')}</p>
        </div>
      </Card>
    );
  }

  const canInvite = ['ROLE_OWNER', 'ROLE_ADMIN'].includes(userRole);
  const canManageRoles = userRole === 'ROLE_OWNER';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{group.name}</h2>
        {canInvite && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsInviteModalVisible(true)}
          >
            {t('sections.group.invite_member')}
          </Button>
        )}
      </div>

      <Card title={t('sections.group.members')}>
        <List
          dataSource={group.members}
          renderItem={(member) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={member.email}
              />
              <div className="flex items-center gap-4">
                {renderMemberRole(member)}
              </div>
            </List.Item>
          )}
        />
      </Card>

      <InviteMemberModal
        visible={isInviteModalVisible}
        onClose={() => setIsInviteModalVisible(false)}
        onSuccess={handleInvitationSuccess}
        groupId={group.id}
        user={user}
        i18n={i18n}
      />
    </div>
  );
};

export default GroupSettings; 