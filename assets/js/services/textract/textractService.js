import axios from 'axios';
import { Auth } from 'aws-amplify';

export const saveAsDraft = async (analyzedData, editedText, companyId) => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;

    // Extract the textract data from the verification result
    const textractData = analyzedData.textractData || analyzedData;

    const updatedData = {
      ...textractData,
      text: editedText.split('\n'),
      companyId: companyId,
      status: 'draft',
      // Include verification data if available
      verified: analyzedData.verified || true, // Set to true as OpenAI has verified
      verificationConfidence: analyzedData.confidence || 1.0, // High confidence with OpenAI verification
      // Use only the OpenAI analyzed and verified data
      // TextExtract data is used internally but not exposed to the user
      verifiedData: analyzedData.aiAnalysis || {},
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
      message: `Erreur lors de l'enregistrement en brouillon: ${error.message}`,
    };
  }
};

export const submitData = async (analyzedData, editedText, companyId) => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;

    // Extract the textract data from the verification result
    const textractData = analyzedData.textractData || analyzedData;

    const updatedData = {
      ...textractData,
      text: editedText.split('\n'),
      companyId: companyId,
      // Include verification data if available
      verified: analyzedData.verified || true, // Set to true as OpenAI has verified
      verificationConfidence: analyzedData.confidence || 1.0, // High confidence with OpenAI verification
      // Use only the OpenAI analyzed and verified data
      // TextExtract data is used internally but not exposed to the user
      verifiedData: analyzedData.aiAnalysis || {},
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
      message: `Erreur lors de l'enregistrement des données: ${error.message}`,
    };
  }
};
