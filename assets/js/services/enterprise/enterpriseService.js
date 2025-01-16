import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';
import { Auth } from 'aws-amplify';

const mapApiDataToEnterprise = (apiData) => {
  return {
    denomination: apiData.denomination,
    siren: apiData.siren,
    siret: apiData.siret,
    formeJuridique: apiData.formeJuridique,
    adresse: {
      pays: apiData.adresse?.pays || 'FRANCE',
      codePostal: apiData.adresse?.codePostal,
      commune: apiData.adresse?.commune,
      typeVoie: apiData.adresse?.typeVoie,
      voie: apiData.adresse?.voie,
      numVoie: apiData.adresse?.numVoie
    },
    codeApe: apiData.codeApe,
    representants: Array.isArray(apiData.representants) ? apiData.representants.map(rep => ({
      nom: rep.nom,
      qualite: rep.qualite
    })) : [],
    updatedAt: apiData.updatedAt
  };
};

export const fetchEnterpriseDetails = async (siren, t) => {
  try {
    // Première tentative avec l'API principale
    let response = await fetch(`/api/enterprise/${siren}`);
    let apiData;
    
    // Vérifier d'abord le statut de la réponse
    if (!response.ok) {
      console.warn(`Erreur API (${response.status}), tentative avec le scraping...`);
      // Si l'API échoue, on force le mode scraping
      response = await fetch(`/api/enterprise/${siren}?mode=scraping`);
      
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
    const enterpriseData = mapApiDataToEnterprise(apiData);
    
    // Vérification des données requises
    const requiredFields = ['denomination', 'siren', 'formeJuridique'];
    const missingFields = requiredFields.filter(field => !enterpriseData[field]);
    
    if (missingFields.length > 0) {
      throw new Error();
    }

    return enterpriseData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    openNotificationWithIcon(
      'error',
      t('enterprise_details.error_siren.title'),
      t('enterprise_details.error_siren.message')
    );
    return null;
  }
};

export const saveEnterprise = async (enterpriseData) => {
  try {
    const cognitoId = await Auth.currentSession()
      .then(session => session.getIdToken().getJwtToken())
      .catch(() => null);

    if (!cognitoId) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await fetch('/api/enterprise/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId
      },
      body: JSON.stringify({
        siren: enterpriseData.siren,
        denomination: enterpriseData.denomination,
        formeJuridique: enterpriseData.formeJuridique,
        codeApe: enterpriseData.codeApe,
        siret: enterpriseData.siret,
        adresse: enterpriseData.adresse,
        representants: enterpriseData.representants,
        fundingType: enterpriseData.fundingType,
        amountRaised: enterpriseData.amountRaised,
        currency: enterpriseData.currency || 'EUR',
        updatedAt: enterpriseData.updatedAt || new Date().toISOString(),
        sector: enterpriseData.sector
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la sauvegarde');
    }

    const result = await response.json();
    
    if (result.success) {
      openNotificationWithIcon(
        'success',
        'Succès',
        'L\'entreprise a été sauvegardée avec succès'
      );
      return result;
    } else {
      throw new Error(result.error || 'Erreur lors de la sauvegarde');
    }

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