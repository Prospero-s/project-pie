import { Auth } from 'aws-amplify';
import axios from 'axios';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';

// Indicateur pour activer la simulation de données
const USE_SIMULATED_DATA = false;

/**
 * Exécute une requête SQL personnalisée dans la base de données
 * @param {string} query - La requête à exécuter (identifiant interne de la requête côté backend)
 * @param {string} companyId - L'identifiant de l'entreprise 
 * @param {string} queryId - Identifiant de la requête prédéfinie (pour l'UI)
 * @returns {Promise<Array>} - Les résultats de la requête
 */
export const executeCustomQuery = async (query, companyId, queryId = null) => {
  try {
    if (!query) {
      console.error('Query parameter is empty');
      return [];
    }
    
    if (!companyId) {
      console.error('CompanyId parameter is empty');
      return [];
    }
    
    // Mode simulation de données
    if (USE_SIMULATED_DATA) {
      console.log('Mode simulation activé: ', query);
      
      // Simuler différentes réponses en fonction du type de requête
      if (query.toLowerCase().includes('revenue')) {
        return [
          { month: '2023-06', revenue: 520000 },
          { month: '2023-05', revenue: 480000 },
          { month: '2023-04', revenue: 510000 },
          { month: '2023-03', revenue: 450000 },
          { month: '2023-02', revenue: 430000 },
          { month: '2023-01', revenue: 460000 },
          { month: '2022-12', revenue: 490000 },
          { month: '2022-11', revenue: 470000 },
          { month: '2022-10', revenue: 440000 },
          { month: '2022-09', revenue: 420000 },
          { month: '2022-08', revenue: 430000 },
          { month: '2022-07', revenue: 410000 }
        ];
      } else if (query.toLowerCase().includes('sector')) {
        return [
          { sector: 'Technologie', client_count: 45 },
          { sector: 'Santé', client_count: 32 },
          { sector: 'Finance', client_count: 28 },
          { sector: 'Éducation', client_count: 20 },
          { sector: 'Commerce', client_count: 18 },
          { sector: 'Industrie', client_count: 15 }
        ];
      } else if (query.toLowerCase().includes('investment')) {
        return [
          { year: 2023, quarter: 'Q2', investment_value: 1200000 },
          { year: 2023, quarter: 'Q1', investment_value: 950000 },
          { year: 2022, quarter: 'Q4', investment_value: 870000 },
          { year: 2022, quarter: 'Q3', investment_value: 920000 },
          { year: 2022, quarter: 'Q2', investment_value: 780000 },
          { year: 2022, quarter: 'Q1', investment_value: 730000 },
          { year: 2021, quarter: 'Q4', investment_value: 650000 },
          { year: 2021, quarter: 'Q3', investment_value: 580000 }
        ];
      } else if (query.toLowerCase().includes('client')) {
        return [
          { client_name: 'TechCorp Inc.', annual_value: 450000 },
          { client_name: 'MediHealth Systems', annual_value: 380000 },
          { client_name: 'Finance Partners', annual_value: 320000 },
          { client_name: 'EduLearn Global', annual_value: 290000 },
          { client_name: 'RetailPro', annual_value: 270000 },
          { client_name: 'Manufacturing Plus', annual_value: 240000 },
          { client_name: 'Creative Solutions', annual_value: 210000 },
          { client_name: 'DataSmart Analytics', annual_value: 190000 },
          { client_name: 'GreenEco Innovations', annual_value: 180000 },
          { client_name: 'TransportationNow', annual_value: 170000 }
        ];
      } else if (query.toLowerCase().includes('headcount')) {
        return [
          { year: 2023, quarter: 'Q2', headcount: 120 },
          { year: 2023, quarter: 'Q1', headcount: 110 },
          { year: 2022, quarter: 'Q4', headcount: 95 },
          { year: 2022, quarter: 'Q3', headcount: 85 },
          { year: 2022, quarter: 'Q2', headcount: 78 },
          { year: 2022, quarter: 'Q1', headcount: 70 },
          { year: 2021, quarter: 'Q4', headcount: 65 },
          { year: 2021, quarter: 'Q3', headcount: 60 }
        ];
      } else if (query.toLowerCase().includes('arr') || query.toLowerCase().includes('metrics')) {
        return [
          { year: 2023, quarter: 'Q2', arr_value: 5200000 },
          { year: 2023, quarter: 'Q1', arr_value: 4800000 },
          { year: 2022, quarter: 'Q4', arr_value: 4500000 },
          { year: 2022, quarter: 'Q3', arr_value: 4200000 },
          { year: 2022, quarter: 'Q2', arr_value: 3900000 },
          { year: 2022, quarter: 'Q1', arr_value: 3600000 },
          { year: 2021, quarter: 'Q4', arr_value: 3400000 },
          { year: 2021, quarter: 'Q3', arr_value: 3100000 }
        ];
      }
      
      // Réponse par défaut pour les autres requêtes
      return [
        { data_point: 'Métrique 1', value: 250 },
        { data_point: 'Métrique 2', value: 420 },
        { data_point: 'Métrique 3', value: 380 },
        { data_point: 'Métrique 4', value: 310 },
        { data_point: 'Métrique 5', value: 490 }
      ];
    }
    
    // Récupérer les informations d'authentification
    let token;
    let cognitoId;
    
    try {
      // Vérifier la session active et récupérer le token
      const session = await Auth.currentSession();
      if (!session) {
        openNotificationWithIcon('error', 'Erreur d\'authentification', 'Votre session a expiré. Veuillez vous reconnecter.');
        return [];
      }
      
      token = session.getIdToken().getJwtToken();
      
      // Récupérer l'ID Cognito
      const user = await Auth.currentAuthenticatedUser();
      if (!user || !user.username) {
        openNotificationWithIcon('error', 'Erreur d\'authentification', 'Utilisateur non identifié. Veuillez vous reconnecter.');
        return [];
      }
      
      cognitoId = user.username;
      
    } catch (authError) {
      console.error('Authentication error:', authError);
      openNotificationWithIcon('error', 'Erreur d\'authentification', 'Vous devez être connecté pour exécuter des requêtes');
      return [];
    }
    
    // Appel à l'API pour exécuter la requête
    try {
      console.log('Envoi de la requête avec queryId:', query); // Log pour le débogage
      
      const response = await axios.post('/api/query/execute', {
        queryId: query, // Utiliser le nom de la requête comme queryId côté backend
        companyId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-cognito-id': cognitoId
        }
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Vérifier que les résultats sont bien un tableau
      const results = response.data.results;
      if (!results) {
        console.warn('API returned empty results');
        return [];
      }
      
      if (!Array.isArray(results)) {
        console.warn('API did not return an array, got:', typeof results);
        return [];
      }
      
      return results;
    } catch (axiosError) {
      // Gérer les différents types d'erreurs
      if (axiosError.response) {
        // Erreur de réponse du serveur
        const errorMessage = axiosError.response.data?.message || axiosError.response.data?.error || 'Erreur serveur lors de l\'exécution de la requête';
        openNotificationWithIcon('error', 'Erreur de requête', errorMessage);
        throw new Error(errorMessage);
      } else if (axiosError.request) {
        // Pas de réponse du serveur
        const errorMessage = 'Aucune réponse du serveur, veuillez vérifier votre connexion';
        openNotificationWithIcon('error', 'Erreur réseau', errorMessage);
        throw new Error(errorMessage);
      } else {
        // Autre erreur
        const errorMessage = axiosError.message || 'Une erreur est survenue lors de l\'exécution de la requête';
        openNotificationWithIcon('error', 'Erreur', errorMessage);
        throw new Error(errorMessage);
      }
    }
  } catch (error) {
    console.error('Error in executeCustomQuery:', error);
    throw error;
  }
};

/**
 * Récupère la liste des requêtes SQL prédéfinies disponibles
 * @returns {Promise<Array>} - Liste des requêtes prédéfinies
 */
export const getPredefinedQueries = async () => {
  try {
    // Mode simulation de données
    if (USE_SIMULATED_DATA) {
      return [
        { 
          id: '1', 
          name: 'Revenus mensuels', 
          description: 'Affiche les revenus mensuels de l\'entreprise au cours des 12 derniers mois',
          query: 'monthly_revenue'
        },
        { 
          id: '2', 
          name: 'Clients par secteur', 
          description: 'Répartition des clients par secteur d\'activité',
          query: 'clients_by_sector'
        },
        { 
          id: '3', 
          name: 'Croissance ARR', 
          description: 'Évolution de l\'ARR (Annual Recurring Revenue) par trimestre',
          query: 'arr_growth'
        },
        { 
          id: '4', 
          name: 'Top 10 clients', 
          description: 'Liste des 10 plus grands clients par valeur',
          query: 'top_clients'
        },
        { 
          id: '5', 
          name: 'Évolution des effectifs', 
          description: 'Nombre d\'employés par trimestre',
          query: 'headcount'
        },
        { 
          id: '6', 
          name: 'Investissements', 
          description: 'Valeur des investissements par trimestre',
          query: 'quarterly_investments'
        }
      ];
    }
    
    // Récupérer les informations d'authentification
    let token;
    let cognitoId;
    
    try {
      // Vérifier la session active et récupérer le token
      const session = await Auth.currentSession();
      if (!session) {
        openNotificationWithIcon('error', 'Erreur d\'authentification', 'Votre session a expiré. Veuillez vous reconnecter.');
        return [];
      }
      
      token = session.getIdToken().getJwtToken();
      
      // Récupérer l'ID Cognito
      const user = await Auth.currentAuthenticatedUser();
      if (!user || !user.username) {
        openNotificationWithIcon('error', 'Erreur d\'authentification', 'Utilisateur non identifié. Veuillez vous reconnecter.');
        return [];
      }
      
      cognitoId = user.username;
      
    } catch (authError) {
      console.error('Authentication error:', authError);
      openNotificationWithIcon('error', 'Erreur d\'authentification', 'Vous devez être connecté pour exécuter des requêtes');
      return [];
    }
    
    // Appel à l'API pour récupérer les requêtes prédéfinies
    try {
      const response = await axios.get('/api/query/predefined', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-cognito-id': cognitoId
        }
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Vérifier que les requêtes sont bien un tableau
      const queries = response.data.queries;
      if (!queries) {
        console.warn('API returned empty queries list');
        return [];
      }
      
      if (!Array.isArray(queries)) {
        console.warn('API did not return an array, got:', typeof queries);
        return [];
      }
      
      return queries;
    } catch (axiosError) {
      // Gérer les erreurs
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erreur lors de la récupération des requêtes prédéfinies';
      openNotificationWithIcon('error', 'Erreur', errorMessage);
      console.error('Error getting predefined queries:', axiosError);
      
      // En cas d'erreur, retourner un tableau vide
      return [];
    }
  } catch (error) {
    console.error('Error in getPredefinedQueries:', error);
    return []; // Toujours retourner un tableau vide en cas d'erreur
  }
};

/**
 * Récupère l'identifiant Cognito de l'utilisateur connecté
 * @returns {Promise<string>} - L'identifiant Cognito
 */
async function getCognitoId() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    if (!user || !user.username) {
      throw new Error('Utilisateur non authentifié');
    }
    return user.username;
  } catch (error) {
    console.error('Error getting Cognito ID:', error);
    openNotificationWithIcon('error', 'Erreur d\'authentification', 'Vous devez être connecté pour exécuter des requêtes');
    throw new Error('Utilisateur non authentifié');
  }
} 