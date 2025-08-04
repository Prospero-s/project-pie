import React, { useEffect, useState } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notification/notificationService';

const DropdownNotification = ({ i18n, user }) => {
  const { t } = useTranslation('menu', { i18n });
  const [isMobile] = useState(window.innerWidth < 640);
  const [notifications, setNotifications] = useState([]);
  const [countNotifications, setCountNotifications] = useState(null);

  const handleMarkAsRead = async notificationId => {
    try {
      await markNotificationAsRead(user, notificationId);
      // Mettre à jour localement la notification
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read_at: { date: new Date().toISOString() } }
            : notification,
        ),
      );
      // Recalculer le compteur
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read_at: { date: new Date().toISOString() } }
          : notification,
      );
      const unreadCount = updatedNotifications.filter(
        notification => !notification.read_at,
      ).length;
      setCountNotifications(unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user);
      // Marquer toutes les notifications comme lues localement
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          read_at: notification.read_at || { date: new Date().toISOString() },
        })),
      );
      setCountNotifications(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchNotifications(user);
        setNotifications(data.notifications);
        // Compter seulement les notifications non lues
        const unreadCount = data.notifications.filter(
          notification => !notification.read_at,
        ).length;
        setCountNotifications(unreadCount);
      } catch (error) {
        console.error('Error fetching notification settings:', error);
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
              <div className="flex flex-col gap-2 p-4 lg:px-6 lg:py-4">
                {notifications.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text_gray_900">
                      {t('notifications')}
                    </span>
                    <div className="flex gap-2">
                      {countNotifications > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {t('read_all')}
                        </button>
                      )}
                      <span className="text-xs font-medium text-primary">
                        {t('view_all')}
                      </span>
                    </div>
                  </div>
                )}
                <ul className="flex flex-col gap-4">
                  {notifications.map(notification => (
                    <li
                      key={notification.id}
                      className={`flex items-center gap-4 border-b border-stroke px-2 pt-2 pb-4 lg:px-4 hover:bg-gray-2 cursor-pointer ${
                        !notification.read_at ? 'bg-blue-50' : ''
                      }`}
                      onClick={() =>
                        !notification.read_at &&
                        handleMarkAsRead(notification.id)
                      }
                    >
                      <div className="flex flex-1 items-center justify-between">
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h6
                              className={`text-sm font-medium text_gray_900 ${
                                !notification.read_at ? 'font-bold' : ''
                              }`}
                            >
                              {notification.title}
                            </h6>
                          </div>
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

  return (
    <div className="flex items-center gap-4">
      {/* Dropdown notification */}
      <Dropdown
        menu={{ items }}
        trigger={['click']}
        placement={isMobile ? 'bottomLeft' : 'bottom'}
        arrow
        dropdownRender={menuNode => (
          <div className="ring-1 ring-black/5 rounded-md bg-white shadow-md w-80">
            {menuNode}
          </div>
        )}
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 hover:ring-1 hover:ring-black/10 transition-all duration-300 cursor-pointer">
          <Badge count={countNotifications}>
            <BellOutlined className="text-2xl hover:text-primary transition-colors duration-300" />
          </Badge>
        </div>
      </Dropdown>
    </div>
  );
};

export default DropdownNotification;
