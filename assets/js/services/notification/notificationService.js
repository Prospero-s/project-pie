import { Auth } from 'aws-amplify';
import axios from 'axios';

export const initOResetNotificationSettings = async () => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }
    const response = await axios.post('/api/notification-settings/resets', {
      headers: {
        'X-Cognito-Id': cognitoId,
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
        'x-cognito-email': user?.email,
        'x-cognito-name': user?.user_metadata?.full_name,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};
