import { Auth } from 'aws-amplify';
import axios from 'axios';

export const fetchDocuments = async () => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }
    const response = await axios.get('/api/kpi/getAllKpi', {
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

export const updateDocument = async (id, data) => {
  return await axios.put(`/api/kpi/updateDocument/${id}`, data);
};

export const deleteDocument = async id => {
  const response = await axios.delete(`/api/kpi/delete/${id}`);
  return response.data;
};
