import axios from 'axios';
import { Auth } from 'aws-amplify';

export const fetchInvestments = async (params = {}) => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;

    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      sortField: params.sortField || 'updatedAt',
      sortOrder: params.sortOrder || 'desc',
    };

    // Ajout des filtres
    if (params.sector?.length > 0) {
      queryParams.sector = params.sector.join(',');
    }
    if (params.fundingType?.length > 0) {
      queryParams.fundingType = params.fundingType.join(',');
    }

    const response = await axios.get('/api/investments', { 
      params: queryParams,
      headers: {
        'x-cognito-id': cognitoId
      }
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Ajout de la nouvelle fonction
export const fetchInvestmentById = async (id) => {
  try {
    // S'assurer que l'URL commence par /api
    const response = await axios.get(`/api/investments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erreur détaillée:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}; 