import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';
import { Auth } from 'aws-amplify';
import axios from 'axios';

const mapApiDataToCompany = apiData => {
  return {
    denomination: apiData.denomination,
    siren: apiData.siren,
    siret: apiData.siret,
    businessStructures: apiData.businessStructures,
    adresse: {
      pays: apiData.adresse?.pays || 'FRANCE',
      codePostal: apiData.adresse?.codePostal,
      commune: apiData.adresse?.commune,
      streetTypes: apiData.adresse?.streetTypes,
      voie: apiData.adresse?.voie,
      streetNumber: apiData.adresse?.streetNumber,
    },
    codeApe: apiData.codeApe,
    representants: Array.isArray(apiData.representants)
      ? apiData.representants.map(rep => ({
          nom: rep.nom,
          qualite: rep.qualite,
        }))
      : [],
    updatedAt: apiData.updatedAt,
  };
};

export const fetchCompanyDetails = async (siren, t) => {
  try {
    // Première tentative avec l'API principale
    let response = await fetch(`/api/company/${siren}`);
    let apiData;

    // Vérifier d'abord le statut de la réponse
    if (!response.ok) {
      // Si l'API échoue, on force le mode scraping
      response = await fetch(`/api/company/${siren}?mode=scraping`);

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération des données (${response.status})`,
        );
      }
    }

    try {
      apiData = await response.json();
    } catch (parseError) {
      throw new Error(
        `Format de réponse invalide: ${parseError.message} ${parseError.response?.data ? `(${JSON.stringify(parseError.response.data)})` : ''} [Status: ${parseError.response?.status || 'N/A'}]`,
      );
    }

    if (apiData.error) {
      throw new Error(apiData.error);
    }

    // Transformation des données
    const companyData = mapApiDataToCompany(apiData);

    // Vérification des données requises
    const requiredFields = ['denomination', 'siren', 'businessStructures'];
    const missingFields = requiredFields.filter(field => !companyData[field]);

    if (missingFields.length > 0) {
      throw new Error();
    }

    return companyData;
  } catch (error) {
    openNotificationWithIcon(
      'error',
      t('company_details.error_siren.title'),
      `${t('company_details.error_siren.message')} - ${error.message}`,
    );
    return null;
  }
};

export const saveCompany = async companyData => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;
    const email = session.getIdToken().payload.email;
    const name = session.getIdToken().payload.name;
    if (!cognitoId || !email) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await fetch('/api/company/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId,
        'X-Cognito-Email': email,
        'X-Cognito-Name': name,
      },
      body: JSON.stringify({
        siren: companyData.siren,
        denomination: companyData.denomination,
        businessStructures: companyData.businessStructures,
        codeApe: companyData.codeApe,
        siret: companyData.siret,
        adresse: companyData.adresse,
        representants: companyData.representants,
        fundingType: companyData.fundingType,
        amountRaised: companyData.amountRaised,
        currency: companyData.currency || 'EUR',
        sector: companyData.sector,
        investorId: companyData.investorId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la sauvegarde');
    }

    const result = await response.json();

    if (result.success === false) {
      throw new Error(result.error || 'Erreur lors de la sauvegarde');
    }

    openNotificationWithIcon(
      'success',
      'Succès',
      "L'entreprise a été sauvegardée avec succès",
    );
    return result;
  } catch (error) {
    openNotificationWithIcon(
      'error',
      'Erreur',
      error.message ||
        "Une erreur est survenue lors de la sauvegarde de l'entreprise",
    );
    throw error;
  }
};

export const getAllCompanies = async () => {
  const cognitoId = await Auth.currentSession()
    .then(session => session.getIdToken().getJwtToken())
    .catch(() => {
      throw new Error('Utilisateur non authentifié');
    });

  if (!cognitoId) {
    throw new Error('Utilisateur non authentifié');
  }

  try {
    const response = await axios.get('/api/getAllCompanies', {
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Erreur lors de la récupération des entreprises: ${error.message} ${
          error.response.data ? `(${JSON.stringify(error.response.data)})` : ''
        } [Status: ${error.response.status}]`,
      );
    } else if (error.request) {
      throw new Error(
        `Erreur réseau lors de la récupération des entreprises: ${error.message}`,
      );
    } else {
      throw new Error(`Erreur inconnue: ${error.message}`);
    }
  }
};

export const getCompanyDetailsById = async id => {
  try {
    const response = await axios.get(`/api/company/details/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const getCompanyKpis = async id => {
  try {
    const response = await axios.get(`/api/company/${id}/kpis`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des KPI: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const getCompanyKpisByYear = async (id, year) => {
  try {
    const response = await axios.get(`/api/company/${id}/kpis?year=${year}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des KPI pour l'année ${year}: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const getCompanyKpisYears = async id => {
  try {
    const response = await axios.get(`/api/company/${id}/kpis/years`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des années disponibles: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};
