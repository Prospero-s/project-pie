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
        'x-cognito-id': cognitoId,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const fetchInvestmentByCompanyIdAndYear = async (id, year) => {
  try {
    const response = await axios.get(`/api/investments/${id}/${year}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const fetchGlobalInvestments = async () => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;

    const response = await axios.get('/api/investments/global', {
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const fetchGlobalFundingInvestments = async () => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;

    const response = await axios.get('/api/investments/global/funding', {
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const fetchGlobalSectorInvestments = async () => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;

    const response = await axios.get('/api/investments/global/sector', {
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const deleteInvestment = async (id) => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;

    const response = await axios.delete(`/api/investments/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};
