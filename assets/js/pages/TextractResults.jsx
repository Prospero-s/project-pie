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
  Table,
  Spin,
  Card,
  Space,
} from 'antd';
import { useUser } from '@/context/userContext';
import { saveAsDraft, submitData } from '@/services/textract/textractService';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TextractResults = ({ i18n }) => {
  const navigate = useNavigate();
  const { analyzedData, setAnalyzedData } = useUser();
  const { t } = useTranslation(['documents', 'textract'], { i18n });
  const company = analyzedData?.company || null;
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState([]);
  const [validatingWithAI, setValidatingWithAI] = useState(false);

  // Function to validate TextExtract data with OpenAI
  const validateWithOpenAI = async () => {
    if (!analyzedData || !analyzedData.textractData) {
      message.error('Aucune donnée à valider.');
      return;
    }

    setValidatingWithAI(true);

    try {
      // Extract text content from the TextExtract result
      const textContent = analyzedData?.textractData?.text?.content || [];

      // Build prompt for OpenAI to extract KPIs from the document
      const prompt = `
        Je suis un document financier ou business plan contenant potentiellement les KPIs suivants. 
        Extrais et formate ces KPIs à partir de mon contenu. Si un KPI n'est pas présent, indique "N.A".
        Prends en compte à la fois les termes français et anglais (indiqués entre parenthèses).
        
        KPIs à extraire:
        - Chiffre d'affaire (Revenue, Sales, Turnover)
        - Marge brute (Gross Margin, Gross Profit)
        - Coût d'acquisition du client (CAC, Cost of Acquisition, CAC Ratio)
        - Valeur à vie client (Lifetime Value, LTV)
        - Nombre employé (Headcount, Employees)
        - Argent brulé (Burn, Cash Burn, Burn Rate)
        - Ebitda (EBITDA)
        - Revenu Annuel Récurrent (ARR, Annual Recurring Revenue)
        - Revenu Mensuel Récurrent (MRR, Monthly Recurring Revenue)
        - Montant levé (Funding, Raised)
        
        Document:
        ${textContent.join('\n')}
        
        Réponds uniquement avec un objet JSON contenant les valeurs extraites, par exemple:
        {
          "chiffre_affaire": "1000000€",
          "marge_brute": "500000€",
          "cout_acquisition": "200€",
          ...
        }
      `;

      // Call your backend API that will communicate with OpenAI
      const response = await axios.post('/api/openai/analyze', {
        prompt,
        documentId: analyzedData.id || 'unknown',
      });

      // Update analyzedData with OpenAI verification results
      if (response.data && response.data.success) {
        const aiAnalysis = response.data.result;

        // Update the local state and userContext
        const updatedData = {
          ...analyzedData,
          aiAnalysis,
          verified: true,
        };

        setAnalyzedData(updatedData);

        // Update the KPI data table
        updateKpiTable(aiAnalysis);

        message.success(
          'Vérification et validation par OpenAI terminée avec succès!',
        );
      } else {
        message.error(
          'Erreur lors de la vérification avec OpenAI: ' +
            (response.data?.message || 'Erreur inconnue'),
        );
      }
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      message.error(
        'Erreur lors de la communication avec OpenAI: ' + error.message,
      );
    } finally {
      setValidatingWithAI(false);
    }
  };

  // Update KPI table with AI analysis data
  const updateKpiTable = aiAnalysis => {
    setKpiData([
      {
        key: 'chiffre_affaire',
        label: "Chiffre d'affaire",
        value: aiAnalysis?.chiffre_affaire || 'N.A',
      },
      {
        key: 'marge_brute',
        label: 'Marge brute',
        value: aiAnalysis?.marge_brute || 'N.A',
      },
      {
        key: 'cout_acquisition',
        label: "Coût d'acquisition du client",
        value: aiAnalysis?.cout_acquisition || 'N.A',
      },
      {
        key: 'valeur_vie_client',
        label: 'Valeur à vie client',
        value: aiAnalysis?.valeur_vie_client || 'N.A',
      },
      {
        key: 'nombre_employe',
        label: 'Nombre employé',
        value: aiAnalysis?.nombre_employe || 'N.A',
      },
      {
        key: 'argent_brule',
        label: 'Argent brulé',
        value: aiAnalysis?.argent_brule || 'N.A',
      },
      {
        key: 'ebitda',
        label: 'Ebitda',
        value: aiAnalysis?.ebitda || 'N.A',
      },
      {
        key: 'revenu_annuel',
        label: 'Revenu Annuel Récurrent',
        value: aiAnalysis?.revenu_annuel || 'N.A',
      },
      {
        key: 'revenu_mensuel',
        label: 'Revenu Mensuel Récurrent',
        value: aiAnalysis?.revenu_mensuel || 'N.A',
      },
      {
        key: 'montant_leve',
        label: 'Montant levé',
        value: aiAnalysis?.montant_leve || 'N.A',
      },
    ]);
  };

  useEffect(() => {
    if (analyzedData) {
      // Extract the original text from textractData if available
      const originalContent =
        analyzedData?.textractData?.text?.content &&
        Array.isArray(analyzedData.textractData.text.content)
          ? analyzedData.textractData.text.content.join('\n')
          : '';

      setEditedText(originalContent);

      // Check if we already have AI analysis data
      if (analyzedData.aiAnalysis) {
        updateKpiTable(analyzedData.aiAnalysis);
      } else {
        // Start OpenAI validation if not already done
        validateWithOpenAI();
      }

      setLoading(false);
    }
  }, [analyzedData]);

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

  const kpiColumns = [
    {
      title: t('textract:kpi'),
      dataIndex: 'label',
      key: 'label',
      width: '50%',
    },
    {
      title: t('textract:valueVerifiedByOpenAI'),
      dataIndex: 'value',
      key: 'value',
      width: '50%',
      render: text => (
        <div
          style={{
            color: text === 'N.A' ? '#999' : '#52c41a',
            fontWeight: text === 'N.A' ? 'normal' : 'bold',
          }}
        >
          {text}
        </div>
      ),
    },
  ];

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
          <Title level={4}>{t('textract:noResults')}</Title>
          <Button onClick={() => navigate(-1)}>{t('textract:back')}</Button>
        </div>
      ) : (
        <div className="rounded-md h-full">
          <Card
            bordered={false}
            style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              borderRadius: 8,
              marginBottom: 20,
            }}
            title={
              company && (
                <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                  {t('analyze.company')} : {company.denomination}
                </Title>
              )
            }
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* KPI Analysis Section */}
              <div>
                <Title level={4} style={{ marginTop: 0 }}>
                  {t('textract:kpiAnalysisTitle')}
                </Title>
                <Paragraph>{t('textract:kpiAnalysisDesc')}</Paragraph>

                {validatingWithAI ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Spin tip={t('textract:verificationInProgress')} />
                  </div>
                ) : (
                  <>
                    <Table
                      columns={kpiColumns}
                      dataSource={kpiData}
                      pagination={false}
                      bordered
                      size="middle"
                      style={{ marginBottom: 10 }}
                    />
                    <Paragraph
                      type="secondary"
                      style={{
                        fontStyle: 'italic',
                        fontSize: '0.9em',
                        marginTop: 8,
                      }}
                    >
                      {t('textract:verification.disclaimer')}
                    </Paragraph>
                  </>
                )}
              </div>

              <Divider style={{ margin: '12px 0' }} />

              {/* Document Preview Section */}
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Card
                    title={t('analyze.data_extract')}
                    size="small"
                    bordered
                    style={{ height: '100%' }}
                  >
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
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card
                    title={t('analyze.file_preview')}
                    size="small"
                    bordered
                    style={{ height: '100%', textAlign: 'center' }}
                  >
                    {analyzedData.pdfUrl ? (
                      <iframe
                        src={`http://localhost:80${analyzedData.pdfUrl}`}
                        title={t('textract:pdfPreview')}
                        style={{
                          width: '100%',
                          height: '400px',
                          border: 'none',
                        }}
                      />
                    ) : (
                      <Text>{t('textract:noPdfAvailable')}</Text>
                    )}
                  </Card>
                </Col>
              </Row>

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Space>
                  <Button type="primary" onClick={handleSubmit}>
                    {t('analyze.confirm')}
                  </Button>
                  <Button onClick={() => navigate(-1)}>
                    {t('analyze.cancel')}
                  </Button>
                  <Button type="default" onClick={handleSaveAsDraft}>
                    {t('analyze.save_draft')}
                  </Button>
                </Space>
              </div>
            </Space>
          </Card>
        </div>
      )}
    </>
  );
};

export default TextractResults;
