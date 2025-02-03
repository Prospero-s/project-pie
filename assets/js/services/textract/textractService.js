import axios from 'axios';
import { Auth } from 'aws-amplify';

export const saveAsDraft = async (analyzedData, editedText, companyId) => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;
    const updatedData = {
      ...analyzedData,
      text: editedText.split('\n'),
      companyId: companyId,
      status: 'draft',
    };

    await axios.post('/api/kpi/draft', updatedData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId,
      },
    });
    return { success: true, message: 'Résultats enregistrés en brouillon !' };
  } catch (error) {
    return { 
      success: false, 
      message: `Erreur lors de l\'enregistrement en brouillon: ${error.message}` 
    };
  }
};

export const submitData = async (analyzedData, editedText, companyId) => {
    try {
      const session = await Auth.currentSession();
      const cognitoId = session.getIdToken().payload.sub;
      const updatedData = {
        ...analyzedData,
        text: editedText.split('\n'),
        companyId: companyId,
      };
  
      await axios.post('/api/kpi/save', updatedData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cognito-Id': cognitoId,
        },
      });
      return { success: true, message: 'Données enregistrées avec succès !' };
    } catch (error) {
      return { 
        success: false, 
        message: `Erreur lors de l\'enregistrement des données: ${error.message}` 
      };
    }
  };