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
  Tabs,
} from 'antd';
import { useUser } from '@/context/userContext';
import { saveAsDraft, submitData } from '@/services/textract/textractService';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const TextractResults = ({ i18n }) => {
  const navigate = useNavigate();
  const { analyzedData, setAnalyzedData } = useUser();
  const { t } = useTranslation(['documents', 'textract'], { i18n });
  const company = analyzedData?.company || null;
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState([]);
  const [validatingWithAI, setValidatingWithAI] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [reconstructedTable, setReconstructedTable] = useState([]);

  // Function to validate TextExtract data with OpenAI
  const validateWithOpenAI = async () => {
    if (!analyzedData?.textractData?.text?.content) {
      message.error(
        'Aucun contenu textuel à analyser. Veuillez réessayer avec un autre document.',
      );
      return;
    }

    // Get the TextExtract extracted data to send to API
    const extractedData = analyzedData.textractData?.extractedKpis || {};

    // Vérifier que TextExtract a extrait des données
    if (!extractedData || Object.keys(extractedData).length === 0) {
      message.warning(
        'Aucune donnée pré-extraite par TextExtract trouvée. La vérification pourrait être moins précise.',
      );
      // On continue, mais les résultats seront moins fiables
    }

    try {
      setValidatingWithAI(true);

      const textContent = analyzedData.textractData.text.content;

      // Call your backend API with text content and pre-extracted data
      const response = await axios.post('/api/textract/analyze-text', {
        textContent,
        extractedData, // Pass the pre-extracted data
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

        // Set reconstructed table if available
        if (
          aiAnalysis.reconstructed_table &&
          Array.isArray(aiAnalysis.reconstructed_table)
        ) {
          setReconstructedTable(aiAnalysis.reconstructed_table);
        }

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
    // Use reconstructedTable data if available instead of direct AI values
    if (
      aiAnalysis?.reconstructed_table &&
      Array.isArray(aiAnalysis.reconstructed_table)
    ) {
      const table = aiAnalysis.reconstructed_table;

      // Extract data from reconstructed table
      // Create a helper function to find relevant values in the table
      const findValueInTable = searchTerms => {
        if (table.length < 2) return 'N.A';

        const headers = table[0] || [];
        const dataRows = table.slice(1) || [];
        let values = [];

        // Search through rows and columns for matching terms
        for (let row of dataRows) {
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i]?.toString().toLowerCase() || '';
            const cellValue = row[i]?.toString() || '';

            // Check if header or first column contains any of the search terms
            if (
              searchTerms.some(term => header.includes(term.toLowerCase())) ||
              (row[0] &&
                searchTerms.some(term =>
                  row[0].toString().toLowerCase().includes(term.toLowerCase()),
                ))
            ) {
              // If it's a number, add it to our values array for averaging
              const numValue = parseFloat(cellValue.replace(/[^\d.-]/g, ''));
              if (!isNaN(numValue)) {
                values.push(numValue);
              }
            }
          }
        }

        // Calculate average if we found values, otherwise return N.A
        if (values.length > 0) {
          const average =
            values.reduce((sum, val) => sum + val, 0) / values.length;
          // Format as currency if it looks like money
          if (
            searchTerms.some(term =>
              [
                'chiffre',
                'revenu',
                'montant',
                'argent',
                'ebitda',
                'marge',
                'coût',
                'valeur',
              ].includes(term.toLowerCase()),
            )
          ) {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(average);
          }
          // Otherwise just return the number formatted
          return average.toLocaleString('fr-FR');
        }

        return 'N.A';
      };

      setKpiData([
        {
          key: 'chiffre_affaire',
          label: "Chiffre d'affaire",
          value: findValueInTable([
            "chiffre d'affaire",
            'ca',
            "chiffre d'affaires",
            'revenu',
            'revenus',
          ]),
        },
        {
          key: 'marge_brute',
          label: 'Marge brute',
          value: findValueInTable(['marge brute', 'marge']),
        },
        {
          key: 'cout_acquisition',
          label: "Coût d'acquisition du client",
          value: findValueInTable([
            "coût d'acquisition",
            'cac',
            'coût client',
            "coût d'acquisition client",
          ]),
        },
        {
          key: 'valeur_vie_client',
          label: 'Valeur à vie client',
          value: findValueInTable([
            'valeur vie client',
            'ltv',
            'lifetime value',
            'valeur client',
          ]),
        },
        {
          key: 'nombre_employe',
          label: 'Nombre employé',
          value: findValueInTable([
            'nombre employé',
            'effectif',
            'employés',
            'salariés',
          ]),
        },
        {
          key: 'argent_brule',
          label: 'Argent brulé',
          value: findValueInTable(['argent brulé', 'burn rate', 'cash burn']),
        },
        {
          key: 'ebitda',
          label: 'Ebitda',
          value: findValueInTable(['ebitda']),
        },
        {
          key: 'revenu_annuel',
          label: 'Revenu Annuel Récurrent',
          value: findValueInTable(['revenu annuel', 'arr', 'chiffre annuel']),
        },
        {
          key: 'revenu_mensuel',
          label: 'Revenu Mensuel Récurrent',
          value: findValueInTable(['revenu mensuel', 'mrr', 'chiffre mensuel']),
        },
        {
          key: 'montant_leve',
          label: 'Montant levé',
          value: findValueInTable([
            'montant levé',
            'levée de fonds',
            'capital levé',
          ]),
        },
      ]);
    } else {
      // Fallback to direct AI values if reconstructed table is not available
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
    }

    // Also set reconstructed table if available
    if (
      aiAnalysis?.reconstructed_table &&
      Array.isArray(aiAnalysis.reconstructed_table)
    ) {
      setReconstructedTable(aiAnalysis.reconstructed_table);
    }
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

        // Set reconstructed table if available
        if (
          analyzedData.aiAnalysis.reconstructed_table &&
          Array.isArray(analyzedData.aiAnalysis.reconstructed_table)
        ) {
          setReconstructedTable(analyzedData.aiAnalysis.reconstructed_table);
        }
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

  // Render reconstructed table from the AI analysis
  const renderReconstructedTable = () => {
    if (!reconstructedTable || reconstructedTable.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="secondary">{t('textract:noTableReconstruction')}</Text>
        </div>
      );
    }

    // Extract headers from the first row of the reconstructed table
    const headers = reconstructedTable[0] || [];
    const dataSource = (reconstructedTable.slice(1) || []).map((row, index) => {
      const rowData = { key: index };
      headers.forEach((header, i) => {
        rowData[header.toString()] = row[i] || '';
      });
      return rowData;
    });

    const columns = headers.map(header => ({
      title: header,
      dataIndex: header.toString(),
      key: header.toString(),
      render: text => (
        <div
          style={{
            fontWeight:
              typeof text === 'number' ||
              (typeof text === 'string' &&
                !isNaN(parseFloat(text.replace(/[^\d.-]/g, ''))))
                ? 'bold'
                : 'normal',
          }}
        >
          {text}
        </div>
      ),
    }));

    return (
      <div>
        <Paragraph style={{ marginBottom: 16 }}>
          {t('textract:tableReconstructionDesc')}
        </Paragraph>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          bordered
          size="middle"
        />
      </div>
    );
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
                    <Tabs
                      activeKey={activeTab}
                      onChange={key => setActiveTab(key)}
                    >
                      <TabPane tab={t('textract:kpiTab')} key="1">
                        <Table
                          columns={kpiColumns}
                          dataSource={kpiData}
                          pagination={false}
                          bordered
                          size="middle"
                          style={{ marginBottom: 10 }}
                        />
                      </TabPane>
                      <TabPane
                        tab={t('textract:reconstructedTableTab')}
                        key="2"
                      >
                        {renderReconstructedTable()}
                      </TabPane>
                    </Tabs>
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
