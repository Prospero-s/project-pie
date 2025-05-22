import axios from 'axios';

const API_URL = '/api/documents';

/**
 * Récupère tous les documents
 * @returns {Promise} Promise contenant la liste des documents
 */
export const fetchDocuments = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
};

/**
 * Supprime un document
 * @param {string} id - Identifiant du document à supprimer
 * @returns {Promise} Promise contenant la réponse de l'API
 */
export const deleteDocument = async id => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    throw error;
  }
};

const documentsService = {
  /**
   * Liste les documents d'une compagnie
   * @param {string} companyId - Identifiant de la compagnie
   * @param {number} year - Année (optionnel)
   * @returns {Promise} Promise contenant la liste des documents
   */
  getDocumentsByCompany: async (companyId, year = null) => {
    let url = `${API_URL}?companyId=${companyId}`;
    if (year) {
      url += `&year=${year}`;
    }
    const response = await axios.get(url);
    return response.data;
  },

  /**
   * Récupère un document par son identifiant
   * @param {string} documentId - Identifiant du document
   * @returns {Promise} Promise contenant le document
   */
  getDocumentById: async documentId => {
    const response = await axios.get(`${API_URL}/${documentId}`);
    return response.data;
  },

  /**
   * Sauvegarde un document et ses KPIs
   * @param {Object} documentData - Données du document
   * @param {string} documentData.companyId - Identifiant de la compagnie
   * @param {string} documentData.pdf - Contenu PDF (base64)
   * @param {string} documentData.periodicity - Périodicité (Q, H, Y)
   * @param {number} documentData.year - Année
   * @param {Object} documentData.kpis - KPIs avec périodes et valeurs
   * @returns {Promise} Promise contenant la réponse de l'API
   */
  saveDocument: async documentData => {
    const response = await axios.post(`${API_URL}/save`, documentData);
    return response.data;
  },

  /**
   * Convertit les données analysées par le PDF Processor
   * en format compatible avec l'API de sauvegarde
   * @param {Object} analyzedData - Données analysées
   * @param {string} pdfBase64 - Contenu PDF en base64
   * @returns {Object} Données formatées pour l'API
   */
  prepareDocumentData: (analyzedData, pdfBase64) => {
    // Vérification des données
    if (!analyzedData || !analyzedData.data || !analyzedData.company) {
      throw new Error('Données analysées incomplètes');
    }

    // Formatage des KPIs
    const kpis = {};
    const numericKpis = analyzedData.data.numeric_kpi || {};
    const textKpis = analyzedData.data.kpi || {};

    console.warn('Données KPI textuelles:', textKpis);
    console.warn('Données KPI numériques:', numericKpis);

    // Combiner les données textuelles et numériques
    Object.keys(textKpis).forEach(kpiName => {
      kpis[kpiName] = {};

      Object.keys(textKpis[kpiName]).forEach(period => {
        const displayValue = textKpis[kpiName][period];
        const numericData =
          numericKpis[kpiName] && numericKpis[kpiName][period]
            ? numericKpis[kpiName][period]
            : { value: 0, unit: '€', is_numeric: false };

        kpis[kpiName][period] = {
          display: displayValue,
          value: numericData.value,
          unit: numericData.unit || '€',
        };
      });
    });

    // Extraire le nom du fichier s'il est disponible dans l'URL du PDF
    let filename = '';
    if (analyzedData.pdfUrl) {
      // Extraire le nom du fichier de l'URL
      const urlParts = analyzedData.pdfUrl.split('/');
      filename = urlParts[urlParts.length - 1];

      // Décodage URL si nécessaire
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
        console.warn('Erreur de décodage du nom de fichier:', e);
      }
    }

    // Construction du document
    return {
      companyId: analyzedData.company.id,
      pdf: pdfBase64,
      periodicity: analyzedData.periodicity || 'Q',
      year: analyzedData.year || new Date().getFullYear(),
      kpis: kpis,
      filename: filename,
    };
  },

  // Ajouter les fonctions exportées nommément pour compatibilité
  fetchDocuments,
  deleteDocument,
};

export default documentsService;
