import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Col,
  Row,
  message,
  Input,
  Table,
  Spin,
  Card,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Skeleton,
  Alert,
  Empty,
  Form,
  notification,
} from 'antd';
import {
  InfoCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
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
  const [validatingWithAI, setValidatingWithAI] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [periodsFound, setPeriodsFound] = useState([]);
  const [periodTableColumns, setPeriodTableColumns] = useState([]);
  const [periodTableData, setPeriodTableData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [editedValues, setEditedValues] = useState({});
  const [form] = Form.useForm();

  const selectedKpis = analyzedData?.selectedKpis || [];
  const periodicity = analyzedData?.periodicity || 'Q';
  const selectedYear = analyzedData?.year || new Date().getFullYear();

  // Function to validate TextExtract data with OpenAI
  const validateWithOpenAI = async () => {
    if (!analyzedData?.textractData?.text?.content) {
      message.error(
        t('documents:textract_results.openai_validation.no_content'),
      );
      return;
    }

    // Get the TextExtract extracted data to send to API
    const extractedData = analyzedData.textractData?.extractedKpis || {};

    // Vérifier que TextExtract a extrait des données
    if (!extractedData || Object.keys(extractedData).length === 0) {
      message.warning(
        t('documents:textract_results.openai_validation.no_extracted_data'),
      );
      // On continue, mais les résultats seront moins fiables
    }

    try {
      setValidatingWithAI(true);

      const textContent = analyzedData.textractData.text.content;

      // Call your backend API with text content, pre-extracted data, and new parameters
      const response = await axios.post('/api/textract/analyze-text', {
        textContent,
        extractedData,
        documentId: analyzedData.id || 'unknown',
        kpis: selectedKpis,
        periodicity: periodicity,
        year: selectedYear,
        pdfUrl: analyzedData.pdfUrl,
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

        // Process periods data
        processPeriodsData(aiAnalysis);

        message.success(
          t('documents:textract_results.openai_validation.success'),
        );
      } else {
        message.error(
          t('documents:textract_results.openai_validation.error') +
            ': ' +
            (response.data?.message || 'Erreur inconnue'),
        );
      }
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      message.error(
        t('documents:textract_results.openai_validation.communication_error') +
          ': ' +
          error.message,
      );
    } finally {
      setValidatingWithAI(false);
    }
  };

  // Process multi-period data
  const processPeriodsData = aiAnalysis => {
    if (!aiAnalysis) return;

    // Extract periods from aiAnalysis
    const periods = aiAnalysis.periods || [];
    setPeriodsFound(periods);

    // Create columns for period table
    const columns = [
      {
        title: 'KPI',
        dataIndex: 'kpi',
        key: 'kpi',
        width: 250,
        fixed: 'left',
        render: (text, record) => (
          <Space>
            {text}
            {record.tooltip && (
              <Tooltip title={record.tooltip}>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            )}
          </Space>
        ),
      },
      ...periods.map(period => ({
        title: `${period} ${selectedYear}`,
        dataIndex: period,
        key: period,
        editable: true,
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Form.Item
              name={`${record.key}_${period}`}
              style={{ margin: 0 }}
              rules={[
                {
                  required: false,
                  message: 'Veuillez saisir une valeur',
                },
              ]}
            >
              <Input
                defaultValue={text !== 'N.A' ? text : ''}
                placeholder={t(
                  'documents:textract_results.tag_labels.not_available',
                )}
              />
            </Form.Item>
          ) : (
            <div
              className="editable-cell-value-wrap"
              style={{ paddingRight: 24 }}
            >
              {!text || text === 'N.A' ? (
                <Tag color="default">
                  {t('documents:textract_results.tag_labels.not_available')}
                </Tag>
              ) : text.toString().includes('+') ? (
                <Tag color="green">{text}</Tag>
              ) : text.toString().includes('-') ||
                text.toString().includes('(') ? (
                <Tag color="red">{text}</Tag>
              ) : (
                <Tag color="blue">{text}</Tag>
              )}
              {record.modified && record.modified[period] && (
                <Tooltip
                  title={t('documents:textract_results.alerts.values_modified')}
                >
                  <CheckCircleOutlined
                    style={{ color: '#52c41a', marginLeft: 8 }}
                  />
                </Tooltip>
              )}
            </div>
          );
        },
      })),
    ];

    // Ajouter colonne d'actions
    columns.push({
      title: 'Actions',
      dataIndex: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              onClick={() => saveEdit(record.key)}
              icon={<SaveOutlined />}
              size="small"
            >
              {t('documents:textract_results.save')}
            </Button>
            <Button onClick={cancelEdit} size="small">
              {t('documents:textract_results.cancel')}
            </Button>
          </Space>
        ) : (
          <Button
            type="text"
            icon={<EditOutlined />}
            disabled={editingKey !== ''}
            onClick={() => edit(record)}
          >
            {t('documents:textract_results.edit')}
          </Button>
        );
      },
    });

    setPeriodTableColumns(columns);

    // Get KPI data from aiAnalysis
    const kpiData = aiAnalysis.kpi || {};

    // Create tooltip mapping for KPIs
    const kpiTooltipMapping = {
      "Chiffre d'affaire": t('documents:textract_results.kpi_tooltips.revenue'),
      Revenue: t('documents:textract_results.kpi_tooltips.revenue'),
      'Net Bookings': t('documents:textract_results.kpi_tooltips.net_bookings'),
      'Marge brute': t('documents:textract_results.kpi_tooltips.gross_margin'),
      'Gross Margin': t('documents:textract_results.kpi_tooltips.gross_margin'),
      "Coût d'acquisition du client": t(
        'documents:textract_results.kpi_tooltips.customer_acquisition_cost',
      ),
      'Customer Acquisition Cost (CAC)': t(
        'documents:textract_results.kpi_tooltips.customer_acquisition_cost',
      ),
      'CAC Ratio': t('documents:textract_results.kpi_tooltips.cac_ratio'),
      'Valeur à vie client': t(
        'documents:textract_results.kpi_tooltips.customer_lifetime_value',
      ),
      'Customer Lifetime Value (LTV)': t(
        'documents:textract_results.kpi_tooltips.customer_lifetime_value',
      ),
      "Nombre d'employés": t(
        'documents:textract_results.kpi_tooltips.headcount',
      ),
      Headcount: t('documents:textract_results.kpi_tooltips.headcount'),
      'Argent brûlé': t('documents:textract_results.kpi_tooltips.cash_burn'),
      'Cash Burn': t('documents:textract_results.kpi_tooltips.cash_burn'),
      'Cash Balance': t('documents:textract_results.kpi_tooltips.cash_balance'),
      EBITDA: t('documents:textract_results.kpi_tooltips.ebitda'),
      'Revenu Annuel Récurrent (ARR)': t(
        'documents:textract_results.kpi_tooltips.arr',
      ),
      'Annual Recurring Revenue (ARR)': t(
        'documents:textract_results.kpi_tooltips.arr',
      ),
      'Net ARR': t('documents:textract_results.kpi_tooltips.net_arr'),
      'ARR base': t('documents:textract_results.kpi_tooltips.arr_base'),
      'Organic ARR growth': t(
        'documents:textract_results.kpi_tooltips.organic_arr_growth',
      ),
      'Enterprise NRR': t(
        'documents:textract_results.kpi_tooltips.enterprise_nrr',
      ),
      Churn: t('documents:textract_results.kpi_tooltips.churn'),
      'Revenu Mensuel Récurrent (MRR)': t(
        'documents:textract_results.kpi_tooltips.mrr',
      ),
      'Monthly Recurring Revenue (MRR)': t(
        'documents:textract_results.kpi_tooltips.mrr',
      ),
      'Montant levé': t(
        'documents:textract_results.kpi_tooltips.funding_amount',
      ),
      'Funding Amount': t(
        'documents:textract_results.kpi_tooltips.funding_amount',
      ),
    };

    // Create data rows from KPI data
    const dataRows = Object.entries(kpiData).map(([kpiName, periodValues]) => {
      const row = {
        key: kpiName,
        kpi: kpiName,
        tooltip: kpiTooltipMapping[kpiName] || '',
        modified: {},
      };

      // Add value for each period
      periods.forEach(period => {
        row[period] = periodValues[period] || 'N.A';
      });

      return row;
    });

    setPeriodTableData(dataRows);
    setEditedValues(
      dataRows.reduce((acc, row) => {
        acc[row.key] = { ...row };
        return acc;
      }, {}),
    );
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
        processPeriodsData(analyzedData.aiAnalysis);
      } else {
        // Start OpenAI validation if not already done
        validateWithOpenAI();
      }

      setLoading(false);
    } else {
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

  const isEditing = record => record.key === editingKey;

  const edit = record => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancelEdit = () => {
    setEditingKey('');
  };

  const saveEdit = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...periodTableData];
      const index = newData.findIndex(item => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const modified = { ...item.modified };
        const periods = periodsFound;

        // Pour chaque période, vérifier si la valeur a été modifiée
        periods.forEach(period => {
          const fieldName = `${key}_${period}`;
          if (row[fieldName] !== undefined) {
            const newValue = row[fieldName] || 'N.A';
            if (item[period] !== newValue) {
              item[period] = newValue;
              modified[period] = true;
            }
          }
        });

        // Marquer les valeurs modifiées
        item.modified = modified;

        newData.splice(index, 1, { ...item });
        setPeriodTableData(newData);
        setEditedValues({ ...editedValues, [key]: true });
        setEditingKey('');
      } else {
        setEditingKey('');
      }
    } catch (error) {
      // Log error quietly in case of validation failure
      console.error('Erreur de validation:', error);
      notification.error({
        message: t('documents:textract_results.validation.error_title'),
        description: `${t('documents:textract_results.validation.form_failed')}: ${error.message}`,
      });
    }
  };

  const saveAllChanges = () => {
    if (Object.keys(editedValues).length === 0) {
      message.info(t('documents:textract_results.no_modifications'));
      return;
    }

    // Ici, vous pourriez envoyer toutes les modifications au backend
    notification.success({
      message: t('documents:textract_results.modifications_saved'),
      description: t('documents:textract_results.modifications_success'),
      placement: 'topRight',
    });
  };

  const renderPeriodicityInfo = () => {
    const periodicityLabel =
      periodicity === 'Q'
        ? t('documents:textract_results.periodicity_info.quarterly')
        : t('documents:textract_results.periodicity_info.half_yearly');
    return (
      <Alert
        message={
          <Space>
            <Tag color="processing">{`${t('documents:textract_results.periodicity_info.year')}: ${selectedYear}`}</Tag>
            <Tag color="processing">{`${t('documents:textract_results.periodicity_info.periodicity')}: ${periodicityLabel}`}</Tag>
            <Tag icon={<ClockCircleOutlined />} color="warning">
              {`${periodsFound.length} ${t('documents:textract_results.periodicity_info.periods_detected')}: ${periodsFound.join(', ')} ${selectedYear}`}
            </Tag>
          </Space>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
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
              {/* KPI Analysis Section with side by side layout */}
              <div>
                <Title level={4} style={{ marginTop: 0 }}>
                  {t('textract:kpiAnalysisTitle')}
                </Title>

                {validatingWithAI ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin
                      indicator={
                        <RobotOutlined spin style={{ fontSize: 28 }} />
                      }
                      tip={t('textract:verificationInProgress')}
                      size="large"
                    />
                    <Paragraph style={{ marginTop: 20 }}>
                      {t(
                        'documents:textract_results.alerts.verification_in_progress',
                      )}
                    </Paragraph>
                  </div>
                ) : (
                  <>
                    <Alert
                      message={t(
                        'documents:textract_results.alerts.values_auto_filled',
                      )}
                      type="warning"
                      style={{ marginBottom: 16 }}
                    />

                    <Row gutter={16} style={{ height: '650px' }}>
                      {/* Document source column */}
                      <Col xs={24} lg={12} style={{ height: '100%' }}>
                        <Card
                          title={
                            <Space>
                              <span>
                                {t(
                                  'documents:textract_results.document_source',
                                )}
                              </span>
                              {analyzedData.pdfUrl && (
                                <Tag color="success">
                                  {t(
                                    'documents:textract_results.pdf_available',
                                  )}
                                </Tag>
                              )}
                            </Space>
                          }
                          bordered
                          style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                          bodyStyle={{
                            flex: 1,
                            overflow: 'hidden',
                            padding: 0,
                          }}
                        >
                          {analyzedData.pdfUrl ? (
                            <iframe
                              src={`${analyzedData.pdfUrl}`}
                              title={t('textract:pdfPreview')}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                padding: 16,
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Empty
                                description={t('textract:noPdfAvailable')}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                              />
                            </div>
                          )}
                        </Card>
                      </Col>

                      {/* KPI table column */}
                      <Col xs={24} lg={12} style={{ height: '100%' }}>
                        <Card
                          title={
                            <Space>
                              <span>
                                {t('documents:textract_results.kpi_table')}
                              </span>
                              <Tag
                                icon={<CheckCircleOutlined />}
                                color="success"
                              >
                                {t('documents:textract_results.ai_validated')}
                              </Tag>
                            </Space>
                          }
                          bordered
                          style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                          bodyStyle={{ flex: 1, overflow: 'auto' }}
                          extra={
                            <Button
                              type="primary"
                              onClick={saveAllChanges}
                              disabled={Object.keys(editedValues).length === 0}
                            >
                              {t('documents:textract_results.save_changes')}
                            </Button>
                          }
                        >
                          {periodsFound.length > 0 ? (
                            <>
                              {renderPeriodicityInfo()}
                              <Form form={form}>
                                <Table
                                  columns={periodTableColumns}
                                  dataSource={periodTableData}
                                  pagination={false}
                                  bordered
                                  size="middle"
                                  scroll={{ x: 'max-content', y: '450px' }}
                                  style={{ marginBottom: 10 }}
                                  locale={{
                                    emptyText: (
                                      <Empty
                                        description={t(
                                          'documents:textract_results.no_data',
                                        )}
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                      />
                                    ),
                                  }}
                                />
                              </Form>
                            </>
                          ) : (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                              <Skeleton active />
                              <Text>
                                {t('documents:textract_results.no_periods')}
                              </Text>
                            </div>
                          )}
                        </Card>
                      </Col>
                    </Row>

                    <Tabs
                      activeKey={activeTab}
                      onChange={key => setActiveTab(key)}
                      style={{ marginTop: 16 }}
                    >
                      <TabPane
                        tab={t('documents:textract_results.extracted_document')}
                        key="1"
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
