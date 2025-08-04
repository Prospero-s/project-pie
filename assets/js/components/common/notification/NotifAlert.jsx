import { notification } from 'antd';

export const openNotificationWithIcon = (type, title, message) => {
  notification[type]({
    message: title,
    description: message,
    placement: 'topRight',
    duration: 4,
  });
};
