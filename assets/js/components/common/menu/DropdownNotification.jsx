import React, { useEffect, useState } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { fetchNotifications } from '@/services/notification/notificationService';

const DropdownNotification = ({ i18n, user }) => {
  const { t } = useTranslation('menu', { i18n });
  const [isMobile] = useState(window.innerWidth < 640);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countNotifications, setCountNotifications] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchNotifications(user);
        setNotifications(data.notifications);
        setCountNotifications(data.notifications.length);
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const items =
    notifications.length > 0
      ? [
          {
            key: 'notifications_list',
            label: (
              <div className="flex flex-col gap-2 px-2 py-1 lg:px-6 lg:py-4">
                {notifications.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text_gray_900">
                      {t('notifications')}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {t('view_all')}
                    </span>
                  </div>
                )}
                <ul className="flex flex-col gap-4">
                  {notifications.map(notification => (
                    <li
                      key={notification.id}
                      className="flex items-center gap-4 border-b border-stroke px-2 py-1 lg:px-4 lg:py-2 hover:bg-gray-2"
                    >
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <h6 className="text-sm font-medium text_gray_900">
                            {notification.title}
                          </h6>
                          <p className="text-sm text_gray_900">
                            {notification.message}
                          </p>
                          <p className="text-xs">
                            {new Date(
                              notification.created_at.date,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          },
        ]
      : [
          {
            key: 'no_notifications',
            label: (
              <div className="flex items-center justify-center px-2 py-4">
                <p className="text-sm text-gray-500">{t('no_notifications')}</p>
              </div>
            ),
          },
        ];

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      placement={isMobile ? 'bottomLeft' : 'bottom'}
      arrow
    >
      <Badge count={countNotifications} className="cursor-pointer">
        <BellOutlined className="text-2xl lg:text-3xl hover:text-primary transition-colors duration-300" />
      </Badge>
    </Dropdown>
  );
};

export default DropdownNotification;
