import { Auth } from 'aws-amplify';
import axios from 'axios';

export const initOResetNotifications = async () => {
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
