import React, { useState, useEffect, useCallback } from 'react';
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
  Tag,
  Tooltip,
  Skeleton,
  Alert,
  Empty,
  Form,
  notification,
  Modal,
} from 'antd';
import {
  InfoCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  WarningOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useUser } from '@/context/userContext';
import axios from 'axios';
import documentsService from '@/services/documents/documentsService';

const { Title, Text } = Typography;

const TextractResults = ({ i18n }) => {
  const navigate = useNavigate();
  const { analyzedData } = useUser();
  const { t } = useTranslation(['documents', 'textract'], { i18n });
  const company = analyzedData?.company || null;
  const [loading, setLoading] = useState(true);
  const [periodsFound, setPeriodsFound] = useState([]);
  const [periodTableColumns, setPeriodTableColumns] = useState([]);
  const [periodTableData, setPeriodTableData] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newKpiForm] = Form.useForm();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingKpiData, setEditingKpiData] = useState(null);
  const [editKpiForm] = Form.useForm();

  const periodicity = analyzedData?.periodicity || 'Q';
  const selectedYear =
    analyzedData && Object.prototype.hasOwnProperty.call(analyzedData, 'year')
      ? analyzedData.year
      : new Date().getFullYear();
  const processingId = analyzedData?.processingId || null;

  const [savingDocument, setSavingDocument] = useState(false);

  useEffect(() => {
    console.warn('Données analysées reçues :', analyzedData);
    if (analyzedData?.data?.kpi) {
      console.warn('Données KPI reçues :', analyzedData.data.kpi);
    } else if (analyzedData?.kpi) {
      console.warn('Données KPI reçues :', analyzedData.kpi);
    } else {
      console.warn('Aucune donnée KPI trouvée dans analyzedData');
    }

    // Afficher les données numériques si elles existent
    if (analyzedData?.data?.numeric_kpi) {
      console.warn(
        'Données numériques KPI reçues :',
        analyzedData.data.numeric_kpi,
      );
    } else if (analyzedData?.numeric_kpi) {
      console.warn('Données numériques KPI reçues :', analyzedData.numeric_kpi);
    } else {
      console.warn('Aucune donnée numérique KPI trouvée dans analyzedData');
    }
  }, [analyzedData]);

  const cleanupProcessingResources = async () => {
    if (processingId) {
      try {
        await axios.post(`http://localhost:5000/cleanup/${processingId}`);
      } catch (error) {
        console.error('Erreur lors du nettoyage des ressources:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      cleanupProcessingResources();
    };
  }, [processingId]);

  const processKpiData = useCallback(
    data => {
      if (!data) {
        console.warn('Aucune donnée reçue dans processKpiData');
        return;
      }

      console.error('Données à traiter:', data);

      // Afficher les données numériques spécifiquement
      if (data.data?.numeric_kpi) {
        console.error('Données numériques détaillées:', data.data.numeric_kpi);
      } else if (data.numeric_kpi) {
        console.error('Données numériques détaillées:', data.numeric_kpi);
      } else {
        console.error(
          'Aucune donnée numérique trouvée dans les données à traiter',
        );
      }

      let periods = [];

      if (
        data.periods &&
        Array.isArray(data.periods) &&
        data.periods.length > 0
      ) {
        periods = data.periods;
        console.warn('Périodes trouvées dans data.periods:', periods);
      } else if (
        data.data &&
        data.data.periods &&
        Array.isArray(data.data.periods)
      ) {
        periods = data.data.periods;
        console.warn('Périodes trouvées dans data.data.periods:', periods);
      } else if (periodicity === 'Y') {
        periods = selectedYear ? [selectedYear.toString()] : ['Yearly'];
        console.warn('Yearly period determined:', periods);
      } else {
        const periodsCount = periodicity === 'Q' ? 4 : 2;
        periods = Array.from(
          { length: periodsCount },
          (_, i) => `${periodicity}${i + 1}`,
        );
        console.warn('Périodes générées:', periods);
      }

      setPeriodsFound(periods);

      const columnsConfig = [
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
          title: selectedYear === null ? period : `${period} ${selectedYear}`,
          dataIndex: period,
          key: period,
          render: (text, record) => {
            return (
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
                    title={t(
                      'documents:textract_results.alerts.values_modified',
                    )}
                  >
                    <WarningOutlined
                      style={{ color: '#faad14', marginLeft: 8 }}
                    />
                  </Tooltip>
                )}
              </div>
            );
          },
        })),
      ];

      columnsConfig.push({
        title: 'Actions',
        dataIndex: 'actions',
        fixed: 'right',
        width: 120,
        render: (_, record) => {
          return (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
            >
              {t('documents:textract_results.edit')}
            </Button>
          );
        },
      });

      setPeriodTableColumns(columnsConfig);

      let kpiData = {};

      if (data.data?.kpi && typeof data.data.kpi === 'object') {
        kpiData = data.data.kpi;
        console.warn('KPI trouvés dans data.data.kpi');
      } else if (data.kpi && typeof data.kpi === 'object') {
        kpiData = data.kpi;
        console.warn('KPI trouvés dans data.kpi');
      } else if (
        data.data?.extracted_data?.kpi &&
        typeof data.data.extracted_data.kpi === 'object'
      ) {
        kpiData = data.data.extracted_data.kpi;
        console.warn('KPI trouvés dans data.data.extracted_data.kpi');
      } else if (
        data.extracted_data?.kpi &&
        typeof data.extracted_data.kpi === 'object'
      ) {
        kpiData = data.extracted_data.kpi;
        console.warn('KPI trouvés dans data.extracted_data.kpi');
      } else if (data.kpis && typeof data.kpis === 'object') {
        kpiData = data.kpis;
        console.warn('KPI trouvés dans data.kpis');
      } else if (data.data?.kpis && typeof data.data.kpis === 'object') {
        kpiData = data.data.kpis;
        console.warn('KPI trouvés dans data.data.kpis');
      } else {
        console.error('AUCUNE DONNÉE KPI TROUVÉE, structures explorées:', {
          'data.data?.kpi': data.data?.kpi,
          'data.kpi': data.kpi,
          'data.extracted_data?.kpi': data.extracted_data?.kpi,
          'data.data?.extracted_data?.kpi': data.data?.extracted_data?.kpi,
          'data.kpis': data.kpis,
          'data.data?.kpis': data.data?.kpis,
        });

        kpiData = {
          "Chiffre d'affaire": {
            Q1: '125K€',
            Q2: '156K€',
            Q3: '203K€',
            Q4: '320K€',
          },
          EBITDA: {
            Q1: '-3.2K€',
            Q2: '-1.5K€',
            Q3: '4.5K€',
            Q4: '12.4K€',
          },
        };
        console.warn('Données de test créées pour visualisation');
      }

      const kpiTooltipMapping = {
        "Chiffre d'affaire": t(
          'documents:textract_results.kpi_tooltips.revenue',
        ),
        Revenue: t('documents:textract_results.kpi_tooltips.revenue'),
        'Net Bookings': t(
          'documents:textract_results.kpi_tooltips.net_bookings',
        ),
        'Marge brute': t(
          'documents:textract_results.kpi_tooltips.gross_margin',
        ),
        'Gross Margin': t(
          'documents:textract_results.kpi_tooltips.gross_margin',
        ),
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
        'Cash Balance': t(
          'documents:textract_results.kpi_tooltips.cash_balance',
        ),
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

      const dataRows = Object.entries(kpiData).map(
        ([kpiName, periodValues]) => {
          const row = {
            key: kpiName,
            kpi: kpiName,
            tooltip: kpiTooltipMapping[kpiName] || '',
            modified: {},
          };

          if (typeof periodValues === 'object') {
            periods.forEach(period => {
              row[period] = periodValues[period] || 'N.A';
            });
          } else {
            row[periods[0]] = periodValues || 'N.A';
          }

          return row;
        },
      );

      setPeriodTableData(dataRows);
      setEditedValues(
        dataRows.reduce((acc, row) => {
          acc[row.key] = { ...row };
          return acc;
        }, {}),
      );
    },
    [periodicity, selectedYear, t],
  );

  useEffect(() => {
    if (analyzedData) {
      processKpiData(analyzedData);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [analyzedData, processKpiData]);

  useEffect(() => {
    if (analyzedData) {
      console.warn('Données PDF/Images disponibles:', {
        pdfUrl: analyzedData.pdfUrl,
        imageUrls: analyzedData.imageUrls,
        processingId: analyzedData.processingId,
      });
    }
  }, [analyzedData]);

  const edit = record => {
    console.warn('[EDIT] Record data:', record);
    console.warn('[EDIT] Periods found:', periodsFound);
    setEditingKpiData(record);
    const initialValues = { kpiName: record.kpi };

    // Get all period keys from the record (excluding common fields)
    const recordPeriodKeys = Object.keys(record).filter(
      key => !['key', 'kpi', 'tooltip', 'modified', 'actions'].includes(key),
    );
    console.warn('[EDIT] Record period keys:', recordPeriodKeys);

    // Match period keys with record keys
    recordPeriodKeys.forEach(periodKey => {
      initialValues[periodKey] =
        record[periodKey] === 'N.A' ? '' : record[periodKey];
    });

    console.warn('[EDIT] Setting initial form values:', initialValues);
    editKpiForm.setFieldsValue(initialValues);
    setIsEditModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    newKpiForm.resetFields();
  };

  const handleAddOk = async () => {
    try {
      const values = await newKpiForm.validateFields();
      const newKpiName = values.kpiName;

      if (periodTableData.some(item => item.key === newKpiName)) {
        notification.error({
          message: t('documents:textract_results.add_kpi.duplicate_error'),
        });
        return;
      }

      const newRow = {
        key: newKpiName,
        kpi: newKpiName,
        tooltip: '',
        modified: {},
      };

      periodsFound.forEach(period => {
        newRow[period] = values[period] || 'N.A';
        newRow.modified[period] = true;
      });

      setPeriodTableData([...periodTableData, newRow]);
      setEditedValues({ ...editedValues, [newKpiName]: { ...newRow } });

      setIsAddModalVisible(false);
      newKpiForm.resetFields();
      message.success(
        t('documents:textract_results.add_kpi.success', {
          kpiName: newKpiName,
        }),
      );
    } catch (errorInfo) {
      console.error('Failed:', errorInfo);
      notification.error({
        message: t('documents:textract_results.add_kpi.validation_error'),
      });
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingKpiData(null);
  };

  const handleEditOk = async () => {
    try {
      const values = await editKpiForm.validateFields();
      const originalKey = editingKpiData.key;
      const newKpiName = values.kpiName;

      if (
        newKpiName !== originalKey &&
        periodTableData.some(item => item.key === newKpiName)
      ) {
        notification.error({
          message: t('documents:textract_results.add_kpi.duplicate_error'),
        });
        return;
      }

      const newData = [...periodTableData];
      const index = newData.findIndex(item => item.key === originalKey);

      if (index > -1) {
        const item = newData[index];
        const modifiedPeriods = { ...item.modified };

        const updatedItem = {
          ...item,
          key: newKpiName,
          kpi: newKpiName,
        };

        periodsFound.forEach(period => {
          const newValue = values[period] || 'N.A';
          if (item[period] !== newValue) {
            updatedItem[period] = newValue;
            modifiedPeriods[period] = true;
          } else {
            modifiedPeriods[period] = item.modified?.[period] || false;
          }
        });

        updatedItem.modified = modifiedPeriods;

        newData.splice(index, 1, updatedItem);
        setPeriodTableData(newData);

        setEditedValues({ ...editedValues, [newKpiName]: updatedItem });
        if (newKpiName !== originalKey && editedValues[originalKey]) {
          delete editedValues[originalKey];
        }

        setIsEditModalVisible(false);
        setEditingKpiData(null);
        message.success(t('documents:textract_results.modifications_saved'));
      } else {
        notification.error({ message: 'Error finding KPI to update.' });
        setIsEditModalVisible(false);
        setEditingKpiData(null);
      }
    } catch (errorInfo) {
      console.error('Edit validation Failed:', errorInfo);
      notification.error({
        message: t('documents:textract_results.validation.error_title'),
        description: t('documents:textract_results.validation.form_failed'),
      });
    }
  };

  const handleSubmit = async () => {
    console.warn('Submitting Data:', periodTableData);
    message.info(
      'Submit logic needs implementation based on modified data handling.',
    );
    navigate('/documents');
  };

  // Fonction pour sauvegarder les données dans la base de données
  const handleSaveToDatabase = async () => {
    try {
      setSavingDocument(true);

      // Vérification que toutes les données nécessaires sont présentes
      if (!analyzedData || !analyzedData.pdfUrl) {
        notification.error({
          message: t('documents:textract_results.save_error'),
          description: t('documents:textract_results.missing_pdf'),
        });
        setSavingDocument(false);
        return;
      }

      // Récupérer le contenu du PDF en base64
      const pdfResponse = await axios.get(analyzedData.pdfUrl, {
        responseType: 'blob',
      });

      // Convertir le blob en base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = reader.result.split(',')[1];

          // Préparer les données pour l'API
          const documentData = documentsService.prepareDocumentData(
            analyzedData,
            base64data,
          );

          // Appeler l'API pour sauvegarder
          await documentsService.saveDocument(documentData);

          notification.success({
            message: t('documents:textract_results.save_success'),
            description: t('documents:textract_results.save_success_desc'),
          });

          setSavingDocument(false);

          // Rediriger vers la page des documents
          setTimeout(() => {
            navigate('/documents');
          }, 1500);
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
          notification.error({
            message: t('documents:textract_results.save_error'),
            description: error.message,
          });
          setSavingDocument(false);
        }
      };
      reader.onerror = error => {
        console.error('Erreur lors de la lecture du PDF:', error);
        notification.error({
          message: t('documents:textract_results.save_error'),
          description: t('documents:textract_results.pdf_read_error'),
        });
        setSavingDocument(false);
      };
      reader.readAsDataURL(pdfResponse.data);
    } catch (error) {
      console.error('Erreur lors de la récupération du PDF:', error);
      notification.error({
        message: t('documents:textract_results.save_error'),
        description: error.message,
      });
      setSavingDocument(false);
    }
  };

  const renderPeriodicityInfo = () => {
    let periodicityLabel = '';
    if (periodicity === 'Q') {
      periodicityLabel = t(
        'documents:textract_results.periodicity_info.quarterly',
      );
    } else if (periodicity === 'H') {
      periodicityLabel = t(
        'documents:textract_results.periodicity_info.half_yearly',
      );
    } else if (periodicity === 'Y') {
      periodicityLabel = t(
        'documents:textract_results.periodicity_info.yearly',
        'Yearly',
      );
    }

    const yearLabel =
      selectedYear === null
        ? t(
            'documents:textract_results.periodicity_info.all_years',
            'All Years',
          )
        : selectedYear;
    const periodsLabel =
      selectedYear === null
        ? periodsFound.join(', ')
        : periodsFound.map(p => `${p} ${selectedYear}`).join(', ');

    return (
      <Alert
        message={
          <Space>
            <Tag color="processing">{`${t('documents:textract_results.periodicity_info.year')}: ${yearLabel}`}</Tag>
            <Tag color="processing">{`${t('documents:textract_results.periodicity_info.periodicity')}: ${periodicityLabel}`}</Tag>
            <Tag icon={<ClockCircleOutlined />} color="warning">
              {`${periodsFound.length} ${t('documents:textract_results.periodicity_info.periods_detected')}: ${periodsLabel}`}
            </Tag>
          </Space>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
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
              <div>
                <Title level={4} style={{ marginTop: 0 }}>
                  {t('textract:kpiAnalysisTitle')}
                </Title>

                <Row gutter={16} style={{ height: '650px' }}>
                  <Col xs={24} lg={12} style={{ height: '100%' }}>
                    <Card
                      title={
                        <Space>
                          <span>
                            {t('documents:textract_results.document_source')}
                          </span>
                          {analyzedData.pdfUrl && (
                            <Tag color="success">
                              {t('documents:textract_results.pdf_available')}
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
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                          }}
                        >
                          <iframe
                            src={analyzedData.pdfUrl}
                            title={t('textract:pdfPreview')}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              display: 'block',
                              margin: 0,
                            }}
                            onLoad={e =>
                              console.warn('PDF iframe chargé:', e.target.src)
                            }
                            onError={e => {
                              console.error(
                                "Erreur de chargement du PDF dans l'iframe:",
                                e,
                              );
                            }}
                          />

                          <object
                            data={analyzedData.pdfUrl}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              opacity: 0,
                              zIndex: -1,
                            }}
                            onLoad={e => {
                              console.warn('PDF object chargé');
                              e.target.style.opacity = 1;
                              e.target.style.zIndex = 1;
                            }}
                          >
                            <embed
                              src={analyzedData.pdfUrl}
                              type="application/pdf"
                              width="100%"
                              height="100%"
                            />
                          </object>
                        </div>
                      ) : analyzedData.imageUrls &&
                        analyzedData.imageUrls.length > 0 ? (
                        <div
                          style={{
                            height: '100%',
                            overflow: 'auto',
                            padding: '16px',
                          }}
                        >
                          <div
                            style={{
                              padding: '0 0 10px 0',
                              textAlign: 'center',
                              background: '#f9f9f9',
                              marginBottom: '10px',
                            }}
                          >
                            <Text>
                              {analyzedData.imageUrls.length}{' '}
                              {t('textract:imagesAvailable')}
                            </Text>
                          </div>
                          {analyzedData.imageUrls.map((url, index) => (
                            <div key={index} style={{ marginBottom: '20px' }}>
                              <div style={{ marginBottom: '5px' }}>
                                <Space>
                                  <Text strong>Page {index + 1}</Text>
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() => window.open(url, '_blank')}
                                  >
                                    Ouvrir
                                  </Button>
                                </Space>
                              </div>
                              <img
                                src={url}
                                alt={`Page ${index + 1}`}
                                style={{
                                  width: '100%',
                                  border: '1px solid #eee',
                                  display: 'block',
                                }}
                                onLoad={() =>
                                  console.warn(
                                    `Image ${index + 1} chargée:`,
                                    url,
                                  )
                                }
                                onError={e => {
                                  console.error(
                                    `Erreur de chargement de l'image ${index + 1}:`,
                                    e,
                                  );
                                  e.target.style.display = 'none';
                                  const errorDiv =
                                    document.createElement('div');
                                  errorDiv.innerText = `Erreur de chargement de l'image: ${url}`;
                                  errorDiv.style.padding = '20px';
                                  errorDiv.style.textAlign = 'center';
                                  errorDiv.style.color = 'red';
                                  errorDiv.style.border = '1px solid #eee';
                                  e.target.parentNode.appendChild(errorDiv);
                                }}
                              />
                            </div>
                          ))}
                        </div>
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

                  <Col xs={24} lg={12} style={{ height: '100%' }}>
                    <Card
                      title={
                        <Space>
                          <span>
                            {t('documents:textract_results.kpi_table')}
                          </span>
                          <Tag icon={<CheckCircleOutlined />} color="success">
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
                        <Button type="primary" onClick={handleSubmit}>
                          {t('analyze.confirm')}
                        </Button>
                      }
                    >
                      {periodsFound.length > 0 ? (
                        <>
                          {renderPeriodicityInfo()}
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
                          <Button
                            type="dashed"
                            onClick={showAddModal}
                            icon={<PlusOutlined />}
                            style={{ width: '100%', marginTop: 10 }}
                          >
                            {t('documents:textract_results.add_kpi.button')}
                          </Button>
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
              </div>

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Space>
                  <Button onClick={() => navigate(-1)}>
                    {t('analyze.cancel')}
                  </Button>
                  {analyzedData && (
                    <Button
                      type="primary"
                      onClick={handleSaveToDatabase}
                      loading={savingDocument}
                      icon={<SaveOutlined />}
                    >
                      {t(
                        'documents:textract_results.save_to_database',
                        'Sauvegarder en base de données',
                      )}
                    </Button>
                  )}
                </Space>
              </div>
            </Space>
          </Card>
        </div>
      )}

      <Modal
        title={t('documents:textract_results.add_kpi.modal_title')}
        open={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
        okText={t('documents:textract_results.add_kpi.add_button')}
        cancelText={t('documents:textract_results.cancel')}
      >
        <Form form={newKpiForm} layout="vertical" name="add_kpi_form">
          <Form.Item
            name="kpiName"
            label={t('documents:textract_results.add_kpi.kpi_name_label')}
            rules={[
              {
                required: true,
                message: t(
                  'documents:textract_results.add_kpi.kpi_name_required',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'documents:textract_results.add_kpi.kpi_name_placeholder',
              )}
            />
          </Form.Item>
          <Row gutter={16}>
            {periodsFound.map(period => (
              <Col
                span={Math.max(6, Math.floor(24 / periodsFound.length))}
                key={period}
              >
                <Form.Item
                  name={period}
                  label={
                    selectedYear === null ? period : `${period} ${selectedYear}`
                  }
                >
                  <Input
                    placeholder={t(
                      'documents:textract_results.tag_labels.not_available',
                    )}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>

      <Modal
        title={t('documents:textract_results.edit_kpi.modal_title', 'Edit KPI')}
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText={t('documents:textract_results.save')}
        cancelText={t('documents:textract_results.cancel')}
        destroyOnClose
      >
        <Form form={editKpiForm} layout="vertical" name="edit_kpi_form">
          <Form.Item
            name="kpiName"
            label={t('documents:textract_results.add_kpi.kpi_name_label')}
            rules={[
              {
                required: true,
                message: t(
                  'documents:textract_results.add_kpi.kpi_name_required',
                ),
              },
            ]}
          >
            <Input
              disabled
              placeholder={t(
                'documents:textract_results.add_kpi.kpi_name_placeholder',
              )}
            />
          </Form.Item>

          <Row gutter={16}>
            {editingKpiData &&
              Object.keys(editingKpiData)
                .filter(
                  key =>
                    !['key', 'kpi', 'tooltip', 'modified', 'actions'].includes(
                      key,
                    ),
                )
                .map(period => (
                  <Col
                    span={Math.max(
                      6,
                      Math.floor(
                        24 /
                          Object.keys(editingKpiData).filter(
                            k =>
                              ![
                                'key',
                                'kpi',
                                'tooltip',
                                'modified',
                                'actions',
                              ].includes(k),
                          ).length,
                      ),
                    )}
                    key={period}
                  >
                    <Form.Item name={period} label={period}>
                      <Input
                        placeholder={t(
                          'documents:textract_results.tag_labels.not_available',
                        )}
                      />
                    </Form.Item>
                  </Col>
                ))}
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default TextractResults;
