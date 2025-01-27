import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';
import { Auth } from 'aws-amplify';
import axios from 'axios';

const mapApiDataToCompany = (apiData) => {
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
      streetNumber: apiData.adresse?.streetNumber
    },
    codeApe: apiData.codeApe,
    representants: Array.isArray(apiData.representants) ? apiData.representants.map(rep => ({
      nom: rep.nom,
      qualite: rep.qualite
    })) : [],
    updatedAt: apiData.updatedAt
  };
};

export const fetchCompanyDetails = async (siren, t) => {
  try {
    // Première tentative avec l'API principale
    let response = await fetch(`/api/company/${siren}`);
    let apiData;
    
    // Vérifier d'abord le statut de la réponse
    if (!response.ok) {
      console.warn(`Erreur API (${response.status}), tentative avec le scraping...`);
      // Si l'API échoue, on force le mode scraping
      response = await fetch(`/api/company/${siren}?mode=scraping`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des données (${response.status})`);
      }
    }

    try {
      apiData = await response.json();
      console.log('Données brutes reçues:', apiData);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      throw new Error('Format de réponse invalide');
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
    console.error('Erreur lors de la récupération des données:', error);
    openNotificationWithIcon(
      'error',
      t('company_details.error_siren.title'),
      t('company_details.error_siren.message')
    );
    return null;
  }
};

export const saveCompany = async (companyData) => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;
    const email = session.getIdToken().payload.email;

    if (!cognitoId || !email) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await fetch('/api/company/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId,
        'X-Cognito-Email': email
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
        updatedAt: companyData.updatedAt || new Date().toISOString(),
        sector: companyData.sector,
        investorId: companyData.investorId
      })
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
      'L\'entreprise a été sauvegardée avec succès'
    );
    return result;

  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    openNotificationWithIcon(
      'error',
      'Erreur',
      error.message || 'Une erreur est survenue lors de la sauvegarde de l\'entreprise'
    );
    throw error;
  }
};

export const getAllCompanies = async (page, pageSize) => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await axios.get('/api/getAllCompanies', {
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId
      },
    });

    const result = await response.data;

    return result;
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    throw error;
  }
}; 