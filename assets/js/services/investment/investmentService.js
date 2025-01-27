import axios from 'axios';

export const fetchInvestments = async (params = {}) => {
  try {
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

    console.log('Paramètres envoyés à l\'API:', queryParams);
    const response = await axios.get('/api/investments', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des investissements:', error);
    throw error;
  }
}; 