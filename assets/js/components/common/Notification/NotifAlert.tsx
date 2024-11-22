import { notification } from 'antd';

export const openNotificationWithIcon = (
  type: 'success' | 'info' | 'warning' | 'error',
  message: string,
  description: string,
): void => {
  notification[type]({
    message,
    description,
  });
};
