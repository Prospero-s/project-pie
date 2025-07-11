import { Auth } from 'aws-amplify';
import axios from 'axios';

export const initOResetNotificationSettings = async user => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }
    const response = await axios.post('/api/notification-settings/resets', {
      headers: {
        'x-cognito-id': user?.id,
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const fetchNotificationSettings = async user => {
  try {
    const authSession = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!authSession) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await axios.get('/api/notification-settings/fetch', {
      headers: {
        'x-cognito-id': user?.id,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const changeNotificationSettings = async (user, updatedSettings) => {
  try {
    const authSession = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!authSession) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await axios.put(
      '/api/notification-settings/update',
      {
        updatedSettings: updatedSettings,
      },
      {
        headers: {
          'x-cognito-id': user?.id,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const getTypeNotification = async () => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await axios.get('/api/notifications/getTypes');

    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const sendNotification = async (user, title, message, type, email) => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await axios.post(
      '/api/notifications/send',
      {
        title: title,
        message: message,
        type: type,
        to: email,
      },
      {
        headers: {
          'x-cognito-id': user?.id,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const getNotificationTypeLabel = (type, t) => {
  const typeMap = {
    new_member_joined: t('notification_types.new_member_joined'),
    new_investment_added: t('notification_types.new_investment_added'),
    new_document_uploaded: t('notification_types.new_document_uploaded'),
    group_invitation: t(
      'notification_types.group_invitation',
      'Invitation de groupe',
    ),
    report_reminder: t(
      'notification_types.report_reminder',
      'Rappel de rapport',
    ),
  };

  return typeMap[type] || type;
};

export const fetchNotifications = async user => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await axios.get('/api/notifications/fetch', {
      headers: {
        'x-cognito-id': user?.id,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const markNotificationAsRead = async (user, notificationId) => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await axios.put(
      `/api/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          'x-cognito-id': user?.id,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const markAllNotificationsAsRead = async user => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await axios.put(
      '/api/notifications/read-all',
      {},
      {
        headers: {
          'x-cognito-id': user?.id,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};
