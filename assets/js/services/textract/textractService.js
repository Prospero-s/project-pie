import axios from 'axios';

export const saveAsDraft = async (analyzedData, editedText, companyId) => {
  try {
    const updatedData = {
      ...analyzedData,
      text: editedText.split("\n"),
      companyId: companyId,
      status: "draft",
    };

    console.log("Envoi des données en brouillon :", updatedData);
    await axios.post("/api/kpi/draft", updatedData);
    return { success: true, message: "Résultats enregistrés en brouillon !" };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement en brouillon :", error);
    return { success: false, message: "Erreur lors de l'enregistrement en brouillon." };
  }
};

export const submitData = async (analyzedData, editedText, companyId) => {
    try {
      const updatedData = {
        ...analyzedData,
        text: editedText.split("\n"),
        companyId: companyId,
      };
  
      console.log("Envoi des données finales :", updatedData);
      await axios.post("/api/kpi/save", updatedData); // Envoi direct, sans `json_data`
      return { success: true, message: "Données enregistrées avec succès !" };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      return { success: false, message: "Erreur lors de l'enregistrement des données." };
    }
  };