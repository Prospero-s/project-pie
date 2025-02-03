import axios from 'axios';
import { Auth } from 'aws-amplify';

export const saveAsDraft = async (analyzedData, editedText, companyId) => {
  try {
    const session = await Auth.currentSession();
    const cognitoId = session.getIdToken().payload.sub;
    const updatedData = {
      ...analyzedData,
      text: editedText.split("\n"),
      companyId: companyId,
      status: "draft",
    };

    console.log("Envoi des données en brouillon :", updatedData);
    await axios.post("/api/kpi/draft", updatedData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cognito-Id': cognitoId,
      },
    });
    return { success: true, message: "Résultats enregistrés en brouillon !" };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement en brouillon :", error);
    return { success: false, message: "Erreur lors de l'enregistrement en brouillon." };
  }
};

export const submitData = async (analyzedData, editedText, companyId) => {
    try {
      const session = await Auth.currentSession();
      const cognitoId = session.getIdToken().payload.sub;
      const updatedData = {
        ...analyzedData,
        text: editedText.split("\n"),
        companyId: companyId,
      };
  
      console.log("Envoi des données finales :", updatedData);
      await axios.post("/api/kpi/save", updatedData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cognito-Id': cognitoId,
        },
      });
      return { success: true, message: "Données enregistrées avec succès !" };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      return { success: false, message: "Erreur lors de l'enregistrement des données." };
    }
  };