import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Col, Row, Divider, message, Input } from 'antd';
import { useUser } from '@/context/userContext';
import { saveAsDraft, submitData } from '@/services/textract/textractService'; // Import du service

const { Title, Text } = Typography;
const { TextArea } = Input;

const TextractResults = ({ i18n }) => {
  const navigate = useNavigate();
  const { analyzedData } = useUser();
  const { t } = useTranslation('documents', { i18n });
  const company = analyzedData?.company || null;
  const [editedText, setEditedText] = useState(
    analyzedData?.text?.content && Array.isArray(analyzedData.text.content)
      ? analyzedData.text.content.join('\n')
      : '',
  );

  const handleTextChange = e => {
    setEditedText(e.target.value);
  };

  const handleSaveAsDraft = async () => {
    if (!editedText) {
      message.error('Aucune donnée à enregistrer.');
      return;
    }

    const response = await saveAsDraft(analyzedData, editedText, company?.id);

    if (response.success) {
      message.success(response.message);
      navigate('/documents');
    } else {
      message.error(response.message);
    }
  };

  const handleSubmit = async () => {
    if (!editedText) {
      message.error('Aucune donnée à enregistrer.');
      return;
    }

    const response = await submitData(analyzedData, editedText, company?.id);
    if (response.success) {
      message.success(response.message);
      navigate('/documents');
    } else {
      message.error(response.message);
    }
  };

  return (
    <>
      {!analyzedData ? (
        <div style={{ padding: 20 }}>
          <Title level={4}>{t('no_documents')}</Title>
          <Button onClick={() => navigate(-1)}>{t('back')}</Button>
        </div>
      ) : (
        <div style={{ padding: 20 }}>
          {company && (
            <Title level={3} style={{ color: '#1890ff' }}>
              {t('analyze.company')} : {company.denomination}
            </Title>
          )}
          <Divider />
          <Row gutter={20}>
            <Col span={12}>
              <div
                style={{
                  padding: '10px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '5px',
                }}
              >
                <Title level={4}>{t('analyze.data_extract')} :</Title>
                <TextArea
                  rows={10}
                  value={editedText}
                  onChange={handleTextChange}
                  autoSize={{ minRows: 3, maxRows: 20 }}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '5px',
                  }}
                />
              </div>
            </Col>

            <Col span={12}>
              <div
                style={{
                  padding: '10px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '5px',
                  textAlign: 'center',
                }}
              >
                <Title level={4}>{t('analyze.file_preview')}</Title>
                {analyzedData.pdfUrl ? (
                  <iframe
                    src={`http://localhost:80${analyzedData.pdfUrl}`}
                    title="Prévisualisation du PDF"
                    style={{ width: '100%', height: '500px', border: 'none' }}
                  />
                ) : (
                  <Text>{t('no_documents')}</Text>
                )}
              </div>
            </Col>
          </Row>

          <Divider />
          <Row justify="center" gutter={20}>
            <Col>
              <Button type="primary" onClick={handleSubmit}>
                {t('analyze.confirm')}
              </Button>
            </Col>
            <Col>
              <Button onClick={() => navigate(-1)}>
                {t('analyze.cancel')}
              </Button>
            </Col>
            <Col>
              <Button type="default" onClick={handleSaveAsDraft}>
                {t('analyze.save_draft')}
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default TextractResults;
