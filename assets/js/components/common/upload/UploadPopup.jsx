import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Upload, Button, message, Typography, Spin } from 'antd';
import { UploadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/userContext';

const { Text } = Typography;

const UploadPopup = ({ visible, onClose, company, i18n, lng }) => {
  const [fileList, setFileList] = useState([]);
  const { t } = useTranslation('documents', { i18n });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAnalyzedData } = useUser();
  const navigate = useNavigate();

  const handleFileChange = ({ file, fileList }) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error("La taille du fichier dépasse la limite de 5MB.");
      return;
    }

    if (file.status !== 'removed') {
      setFileList([file]);
      message.success(`Fichier ${file.name} sélectionné.`);
    } else {
      setFileList([]);
    }
  };

  const handleRemoveFile = () => {
    setFileList([]);
    message.info('Fichier retiré.');
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      setError("Veuillez sélectionner un fichier avant de l'envoyer.");
      message.error("Aucun fichier sélectionné.");
      return;
    }

    const file = fileList[0];
    const formData = new FormData();
    formData.append('document', file);
    formData.append('companyId', company?.id); // On envoie l'ID de l'entreprise

    try {
      setLoading(true);
      setError(null);
      const cognitoId = await Auth.currentSession()
        .then((session) => session.getIdToken().getJwtToken())
        .catch(() => null);

      if (!cognitoId) {
        throw new Error('Utilisateur non authentifié');
      }

      const response = await axios.post('/api/textract/analyze', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'X-Cognito-Id': cognitoId
        },
      });

      if (response.data) {
        message.success('Analyse réussie !');
        console.log("Données reçues du serveur :", response.data);
        setAnalyzedData({ ...response.data, company });
        navigate(`/${lng}/textract-results`);
        setFileList([]);
        onClose();
      } else {
        setError("Analyse échouée. Aucune donnée reçue du serveur.");
        message.error("Aucune donnée reçue du serveur.");
      }
    } catch (error) {
      if (error.response) {
        setError("Erreur lors de l'analyse du fichier. Veuillez réessayer.");
      } else if (error.request) {
        setError("La requête a été envoyée, mais aucune réponse n'a été reçue.");
      } else {
        setError("Erreur lors de l'analyse du fichier. Veuillez réessayer.");
      }
      message.error("Erreur lors de l'analyse du fichier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t("modal.upload_title")}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Upload
        beforeUpload={() => false}
        onChange={handleFileChange}
        fileList={fileList}
        showUploadList={false}
      >
        {fileList.length === 0 && (
          <Button icon={<UploadOutlined />} block>
            {t("modal.select_file")}
          </Button>
        )}
      </Upload>

      {fileList.length > 0 && (
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Text strong>{fileList[0].name}</Text>{' '}
            <Text type="secondary">
              ({(fileList[0].size / 1024).toFixed(2)} KB)
            </Text>
          </div>
          <CloseCircleOutlined
            style={{ color: 'red', fontSize: '20px', cursor: 'pointer' }}
            onClick={handleRemoveFile}
          />
        </div>
      )}

      {fileList.length > 0 && (
        <Button
          type="primary"
          onClick={handleUpload}
          block
          style={{ marginTop: 20 }}
          disabled={loading}
        >
          {loading ? <Spin /> : t("modal.validate")}
        </Button>
      )}

      {error && (
        <Text type="danger" style={{ marginTop: 10, display: 'block' }}>
          {error}
        </Text>
      )}
    </Modal>
  );
};

export default UploadPopup;