import React from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';

const DropdownNotification = ({ i18n }) => {
  const { t } = useTranslation('menu', { i18n });
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const items = [
    {
      key: '1',
      label: (
        <div className="flex flex-col gap-2 px-2 py-1 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black dark:text-white">
              {t('notifications')}
            </span>
            <span className="text-xs font-medium text-primary">
              {t('view_all')}
            </span>
          </div>
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-4 border-b border-stroke px-2 py-1 lg:px-4 lg:py-2 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <h6 className="text-sm font-medium text-black dark:text-white">
                    {t('notification_title')}
                  </h6>
                  <p className="text-sm">{t('notification_message')}</p>
                  <p className="text-xs">{t('notification_time')}</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <Dropdown 
      menu={{ items }} 
      trigger={['click']} 
      placement={isMobile ? 'bottomLeft' : 'bottom'} 
      arrow
    >
      <Badge count={5} className="cursor-pointer">
        <BellOutlined className="text-2xl lg:text-3xl hover:text-primary transition-colors duration-300" />
      </Badge>
    </Dropdown>
  );
};

export default DropdownNotification;