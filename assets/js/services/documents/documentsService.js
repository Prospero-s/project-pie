import { Auth } from 'aws-amplify';
import axios from 'axios';

export const fetchDocuments = async () => {
    console.log("Appel API à /api/kpi/getAllKpi");  // Debug
    try {
        const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }
      const response = await axios.get('/api/kpi/getAllKpi',  {
        method: 'GET',
        headers: {
          'X-Cognito-Id': cognitoId
        }
    });
      console.log("Réponse API:", response);  // Debug
      return response.data.data;
    } catch (error) {
      console.error("Erreur API:", error.response || error.message);
      throw error;
    }
  };

export const updateDocument = async (id, data) => {
    return await axios.put(`/api/kpi/updateDocument/${id}`, data);
};


export const deleteDocument = async (id) => {
    try {
        const response = await axios.delete(`/api/kpi/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};