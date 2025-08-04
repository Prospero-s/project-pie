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
      // Preserve original TextExtract data as the source of extraction
      textractOriginalData: textractData.extractedKpis || {},
      // Include verification status
      verified: analyzedData.verified || true, // Set to true as OpenAI has verified
      verificationConfidence: analyzedData.confidence || 1.0,
      // These are the TextExtract values validated and formatted by GPT
      // GPT does NOT extract from PDF but uses TextExtract data and PDF as reference
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
      // Preserve original TextExtract data as the source of extraction
      textractOriginalData: textractData.extractedKpis || {},
      // Include verification status
      verified: analyzedData.verified || true, // Set to true as OpenAI has verified
      verificationConfidence: analyzedData.confidence || 1.0,
      // These are the TextExtract values validated and formatted by GPT
      // GPT does NOT extract from PDF but uses TextExtract data and PDF as reference
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
