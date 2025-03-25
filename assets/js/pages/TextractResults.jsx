import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Col,
  Row,
  Divider,
  message,
  Input,
  Alert,
  List,
  Tag,
  Spin,
} from 'antd';
import { useUser } from '@/context/userContext';
import { saveAsDraft, submitData } from '@/services/textract/textractService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TextractResults = ({ i18n }) => {
  const navigate = useNavigate();
  const { analyzedData } = useUser();
  const { t } = useTranslation('documents', { i18n });
  const company = analyzedData?.company || null;
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [verificationResults, setVerificationResults] = useState(null);

  useEffect(() => {
    if (analyzedData) {
      // Extract the original text from textractData if available
      const originalContent =
        analyzedData?.textractData?.text?.content &&
        Array.isArray(analyzedData.textractData.text.content)
          ? analyzedData.textractData.text.content.join('\n')
          : '';

      setEditedText(originalContent);

      // Set verification results
      setVerificationResults({
        verified: analyzedData.verified,
        corrections: analyzedData.corrections || [],
        confidence: analyzedData.confidence || 0,
      });

      setLoading(false);
    }
  }, [analyzedData]);

  const handleTextChange = e => {
    setEditedText(e.target.value);
  };

  const applyCorrection = (original, corrected) => {
    setEditedText(prevText => prevText.replace(original, corrected));
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

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {!analyzedData ? (
        <div style={{ padding: 20 }}>
          <Title level={4}>{t('textract.noResults')}</Title>
          <Button onClick={() => navigate(-1)}>{t('textract.back')}</Button>
        </div>
      ) : (
        <div style={{ padding: 20 }}>
          {company && (
            <Title level={3} style={{ color: '#1890ff' }}>
              {t('analyze.company')} : {company.denomination}
            </Title>
          )}
          <Divider />

          {/* Verification Alert */}
          {verificationResults && (
            <Alert
              message={
                verificationResults.verified
                  ? t('textract.verification.verified')
                  : t('textract.verification.notVerified')
              }
              description={
                <div>
                  <div>
                    {t('textract.verification.confidence')}:{' '}
                    {Math.round(verificationResults.confidence * 100)}%
                  </div>
                  {verificationResults.corrections &&
                    verificationResults.corrections.length > 0 && (
                      <List
                        size="small"
                        header={
                          <div>{t('textract.suggestedCorrections')}:</div>
                        }
                        bordered
                        dataSource={verificationResults.corrections}
                        renderItem={correction => (
                          <List.Item
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                            actions={[
                              <Button
                                key={`correction-${correction.original}`}
                                type="link"
                                onClick={() =>
                                  applyCorrection(
                                    correction.original,
                                    correction.corrected,
                                  )
                                }
                              >
                                {t('textract.verification.apply')}
                              </Button>,
                            ]}
                          >
                            <div>
                              <Tag color="red">{correction.original}</Tag> →
                              <Tag color="green">{correction.corrected}</Tag>
                            </div>
                          </List.Item>
                        )}
                      />
                    )}
                </div>
              }
              type={verificationResults.verified ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

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
                  <Text>{t('textract.noPdfAvailable')}</Text>
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
