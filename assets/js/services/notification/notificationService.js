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

    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const readNotification = async (id, data) => {
  return await axios.put(`/api/kpi/updateDocument/${id}`, data);
};

export const deleteNotification = async id => {
  const response = await axios.delete(`/api/kpi/delete/${id}`);
  return response.data;
};
