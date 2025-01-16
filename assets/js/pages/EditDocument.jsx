import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography, Col, Row, Divider, message, Input } from "antd";
import axios from "axios"; 

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    loadDocument();
  }, []);

  const loadDocument = async () => {
    try {
      const response = await axios.get(`/api/kpi/getDocument/${id}`);
      setDocument(response.data);
      setTimeout(() => setDocument({ ...response.data }), 0);
      setEditedText(JSON.stringify(response.data.kpi, null, 2));
    } catch (error) {
      message.error("Erreur lors du chargement du document");
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/kpi/updateDocument/${id}`, { kpi: JSON.parse(editedText) });
      message.success("Modifications enregistrées !");
      navigate('/documents');
    } catch (error) {
      message.error("Erreur lors de la mise à jour");
    }
  };

  if (!document) {
    return <p>Chargement...</p>;
  }
  
  
  try {
    return (
      <div style={{ padding: 20 }}>
        <Title level={3} style={{ color: "#1890ff" }}>
            Modifier le document : {document?.company?.denomination || "Nom indisponible"}
        </Title>
        <Divider />
        <Row gutter={20}>
          <Col span={12}>
            <div style={{ padding: "10px", border: "1px solid #d9d9d9", borderRadius: "5px" }}>
              <Title level={4}>Texte JSON :</Title>
              <TextArea
                rows={10}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
            </div>
          </Col>
  
          <Col span={12}>
            <div style={{ padding: "10px", border: "1px solid #d9d9d9", borderRadius: "5px", textAlign: "center" }}>
              <Title level={4}>Prévisualisation du PDF</Title>
              {document?.pdfUrl ? (
                <iframe
                  src={`http://localhost:80${document.pdfUrl}`}
                  title="Prévisualisation du PDF"
                  style={{ width: "100%", height: "500px", border: "none" }}
                />
              ) : (
                <Text>Aucun fichier PDF disponible.</Text>
              )}
            </div>
          </Col>
        </Row>
        <Divider />
        <Row justify="center" gutter={20}>
          <Col>
            <Button type="primary" onClick={handleSave}>Enregistrer</Button>
          </Col>
          <Col>
            <Button onClick={() => navigate('/documents')}>Retour</Button>
          </Col>
        </Row>
      </div>
    );
  } catch (error) {
    return <p>Une erreur est survenue.</p>;
  }
};

export default EditDocument;