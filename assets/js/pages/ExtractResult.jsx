import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
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
  DatePicker,
  Select,
} from 'antd';
import {
  InfoCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
  UndoOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useUser } from '@/context/userContext';
import axios from 'axios';
import documentsService from '@/services/documents/documentsService';
import dayjs from 'dayjs';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';

const { Title, Text } = Typography;

const ExtractResult = ({ i18n }) => {
  const navigate = useNavigate();
  const { id: documentId } = useParams(); // Récupérer l'ID du document depuis l'URL pour le mode édition
  const { analyzedData } = useUser();
  const { t } = useTranslation(['documents', 'extractresult'], { i18n });

  // Déterminer le mode : création (analyzedData) ou édition (documentId)
  const isEditMode = !!documentId;

  // Pour le mode édition, on utilise un state local au lieu d'analyzedData
  const [editModeData, setEditModeData] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  // Utiliser les données appropriées selon le mode
  const currentData = isEditMode ? editModeData : analyzedData;
  const company = currentData?.company || null;

  // Charger le document en mode édition
  useEffect(() => {
    if (isEditMode && documentId) {
      loadDocumentForEdit();
    }
  }, [isEditMode, documentId]);

  const loadDocumentForEdit = async () => {
    try {
      setLoadingDocument(true);
      const document = await documentsService.getDocumentById(documentId);
      const transformedData =
        await documentsService.transformDocumentForEdit(document);
      setEditModeData(transformedData);
    } catch (error) {
      console.error(
        'Erreur lors du chargement du document pour édition:',
        error,
      );
      message.error(t('messages.loading_error'));
      navigate('/documents');
    } finally {
      setLoadingDocument(false);
    }
  };

  // Fonction pour générer un ID unique
  const generateUniqueId = (prefix = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

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

  // Nouvelles states pour gérer les colonnes
  const [isAddColumnModalVisible, setIsAddColumnModalVisible] = useState(false);
  const [addColumnForm] = Form.useForm();

  // Options d'unités disponibles
  const availableUnits = [
    { value: '€', label: '€ (Euro)' },
    { value: '$', label: '$ (Dollar)' },
    { value: '£', label: '£ (Livre)' },
    { value: '¥', label: '¥ (Yen)' },
    { value: '%', label: '% (Pourcentage)' },
    { value: 'x', label: 'x (Ratio)' },
    { value: '', label: t('extractresult:no_unit', 'Sans unité') },
  ];

  const periodicity = currentData?.periodicity || 'Q';
  const [selectedYear, setSelectedYear] = useState(
    currentData &&
      Object.prototype.hasOwnProperty.call(currentData, 'year') &&
      currentData.year
      ? currentData.year
      : null,
  );
  const processingId = currentData?.processingId || null;

  const [isValidating, setIsValidating] = useState(false);
  const [yearSelectionRequired, setYearSelectionRequired] = useState(false);

  // Liste des KPIs disponibles
  const availableKpis = [
    {
      value: 'chiffre_affaire',
      label: t('documents:upload.kpi_labels.chiffre_affaire'),
      tooltip: t('documents:upload.tooltips.revenue'),
    },
    {
      value: 'marge_brute',
      label: t('documents:upload.kpi_labels.marge_brute'),
      tooltip: t('documents:upload.tooltips.gross_margin'),
    },
    {
      value: 'cout_acquisition',
      label: t('documents:upload.kpi_labels.cout_acquisition'),
      tooltip: t('documents:upload.tooltips.customer_acquisition_cost'),
    },
    {
      value: 'valeur_vie_client',
      label: t('documents:upload.kpi_labels.valeur_vie_client'),
      tooltip: t('documents:upload.tooltips.customer_lifetime_value'),
    },
    {
      value: 'nombre_employe',
      label: t('documents:upload.kpi_labels.nombre_employe'),
      tooltip: t('documents:upload.tooltips.headcount'),
    },
    {
      value: 'argent_brule',
      label: t('documents:upload.kpi_labels.argent_brule'),
      tooltip: t('documents:upload.tooltips.cash_burn'),
    },
    {
      value: 'ebitda',
      label: t('documents:upload.kpi_labels.ebitda'),
      tooltip: t('documents:upload.tooltips.ebitda'),
    },
    {
      value: 'revenu_annuel',
      label: t('documents:upload.kpi_labels.revenu_annuel'),
      tooltip: t('documents:upload.tooltips.arr'),
    },
    {
      value: 'revenu_mensuel',
      label: t('documents:upload.kpi_labels.revenu_mensuel'),
      tooltip: t('documents:upload.tooltips.mrr'),
    },
    {
      value: 'montant_leve',
      label: t('documents:upload.kpi_labels.montant_leve'),
      tooltip: t('documents:upload.tooltips.funding_amount'),
    },
  ];

  // Calculer les KPIs non encore sélectionnés
  const getAvailableKpisForSelection = () => {
    const existingKpis = periodTableData.map(item => item.kpi.toLowerCase());
    return availableKpis.filter(
      kpi =>
        !existingKpis.some(
          existing =>
            existing.includes(kpi.value) ||
            kpi.label.toLowerCase().includes(existing) ||
            existing.includes(kpi.label.toLowerCase()),
        ),
    );
  };

  const cleanupProcessingResources = async () => {
    if (processingId) {
      try {
        await axios.post(`http://localhost:5000/cleanup/${processingId}`);
      } catch {
        // Erreur pendant le nettoyage - on ignore
      }
    }
  };

  // Fonction pour détecter et gérer les erreurs GPT/OpenAI
  const handleGptError = error => {
    const errorMessage = error.message || '';
    const errorResponse = error.response?.data?.error || '';
    const fullErrorText = `${errorMessage} ${errorResponse}`.toLowerCase();

    // Détecter les erreurs de crédit GPT
    if (
      fullErrorText.includes('credit') ||
      fullErrorText.includes('quota') ||
      fullErrorText.includes('billing') ||
      fullErrorText.includes('insufficient_quota') ||
      errorResponse.includes('quota_exceeded')
    ) {
      openNotificationWithIcon(
        'error',
        t('extractresult:gpt_errors.quota_exceeded_title'),
        t('extractresult:gpt_errors.quota_exceeded_message'),
      );
      return true;
    }

    // Détecter les erreurs d'API Key
    if (
      fullErrorText.includes('api_key') ||
      fullErrorText.includes('unauthorized') ||
      fullErrorText.includes('authentication')
    ) {
      openNotificationWithIcon(
        'error',
        t('extractresult:gpt_errors.auth_error_title'),
        t('extractresult:gpt_errors.auth_error_message'),
      );
      return true;
    }

    // Détecter les erreurs de rate limit
    if (
      fullErrorText.includes('rate_limit') ||
      fullErrorText.includes('too_many_requests')
    ) {
      openNotificationWithIcon(
        'error',
        t('extractresult:gpt_errors.rate_limit_title'),
        t('extractresult:gpt_errors.rate_limit_message'),
      );
      return true;
    }

    // Détecter les erreurs de service indisponible
    if (
      fullErrorText.includes('service_unavailable') ||
      fullErrorText.includes('server_error') ||
      error.response?.status >= 500
    ) {
      openNotificationWithIcon(
        'error',
        t('extractresult:gpt_errors.service_unavailable_title'),
        t('extractresult:gpt_errors.service_unavailable_message'),
      );
      return true;
    }

    return false; // Erreur non reconnue comme étant liée à GPT
  };

  useEffect(() => {
    return () => {
      // Nettoyer les blob URLs créées pour le PDF en mode édition
      if (
        isEditMode &&
        editModeData?.pdfUrl &&
        editModeData.pdfUrl.startsWith('blob:')
      ) {
        window.URL.revokeObjectURL(editModeData.pdfUrl);
      }
      // Nettoyage existant pour le processing
      cleanupProcessingResources();
    };
  }, [isEditMode, editModeData, processingId]);

  const processKpiData = useCallback(
    data => {
      if (!data) {
        return;
      }

      let periods = [];

      if (
        data.periods &&
        Array.isArray(data.periods) &&
        data.periods.length > 0
      ) {
        periods = data.periods;
      } else if (
        data.data &&
        data.data.periods &&
        Array.isArray(data.data.periods)
      ) {
        periods = data.data.periods;
      } else {
        // Utiliser l'année actuelle par défaut pour générer les périodes si aucune année n'est sélectionnée
        const currentYear = selectedYear || new Date().getFullYear();

        if (periodicity === 'Y') {
          periods = [currentYear.toString()];
        } else {
          const periodsCount = periodicity === 'Q' ? 4 : 2;
          periods = Array.from(
            { length: periodsCount },
            (_, i) => `${periodicity}${i + 1}`,
          );
        }
      }

      setPeriodsFound(periods);

      // Créer les colonnes sans l'année dans le titre (sera mis à jour séparément)
      const columnsConfig = [
        {
          title: t('extractresult:kpi'),
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
          title: period, // Titre sans année, sera mis à jour par updateColumnTitles
          dataIndex: period,
          key: period,
          render: (text, record) => {
            const unit = record.units?.[period] || '';
            const displayValue =
              !text || text === 'N.A' || text === null || text === undefined
                ? 'N.A'
                : `${text}${unit}`;

            return (
              <div
                className="editable-cell-value-wrap"
                style={{ paddingRight: 24 }}
              >
                {!text ||
                text === 'N.A' ||
                text === null ||
                text === undefined ? (
                  <Tag color="default">
                    {t('extractresult:tag_labels.not_available')}
                  </Tag>
                ) : (
                  <Tag color="blue">{displayValue}</Tag>
                )}
                {record.modified && record.modified[period] && (
                  <Tooltip title={t('extractresult:alerts.values_modified')}>
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
        title: t('extractresult:actions', 'Actions'),
        dataIndex: 'actions',
        fixed: 'right',
        width: 100,
        render: (_, record) => {
          return (
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => edit(record)}
                size="small"
                title={t('extractresult:edit')}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => deleteKpi(record)}
                size="small"
                danger
                title={t('extractresult:delete')}
              />
            </Space>
          );
        },
      });

      setPeriodTableColumns(columnsConfig);

      let kpiData = {};
      let numericKpiData = {};

      // Récupérer les données KPI textuelles
      if (data.data?.kpi && typeof data.data.kpi === 'object') {
        kpiData = data.data.kpi;
      } else if (data.kpi && typeof data.kpi === 'object') {
        kpiData = data.kpi;
      } else if (
        data.data?.extracted_data?.kpi &&
        typeof data.data.extracted_data.kpi === 'object'
      ) {
        kpiData = data.data.extracted_data.kpi;
      } else if (
        data.extracted_data?.kpi &&
        typeof data.extracted_data.kpi === 'object'
      ) {
        kpiData = data.extracted_data.kpi;
      } else if (data.kpis && typeof data.kpis === 'object') {
        kpiData = data.kpis;
      } else if (data.data?.kpis && typeof data.data.kpis === 'object') {
        kpiData = data.data.kpis;
      } else {
        kpiData = {};
      }

      // Récupérer les données KPI numériques
      if (data.data?.numeric_kpi && typeof data.data.numeric_kpi === 'object') {
        numericKpiData = data.data.numeric_kpi;
      } else if (data.numeric_kpi && typeof data.numeric_kpi === 'object') {
        numericKpiData = data.numeric_kpi;
      } else {
        numericKpiData = {};
      }

      const kpiTooltipMapping = {
        "Chiffre d'affaire": t('extractresult:kpi_tooltips.revenue'),
        Revenue: t('extractresult:kpi_tooltips.revenue'),
        'Net Bookings': t('extractresult:kpi_tooltips.net_bookings'),
        'Marge brute': t('extractresult:kpi_tooltips.gross_margin'),
        'Gross Margin': t('extractresult:kpi_tooltips.gross_margin'),
        "Coût d'acquisition du client": t(
          'extractresult:kpi_tooltips.customer_acquisition_cost',
        ),
        'Customer Acquisition Cost (CAC)': t(
          'extractresult:kpi_tooltips.customer_acquisition_cost',
        ),
        'CAC Ratio': t('extractresult:kpi_tooltips.cac_ratio'),
        'Valeur à vie client': t(
          'extractresult:kpi_tooltips.customer_lifetime_value',
        ),
        'Customer Lifetime Value (LTV)': t(
          'extractresult:kpi_tooltips.customer_lifetime_value',
        ),
        "Nombre d'employés": t('extractresult:kpi_tooltips.headcount'),
        Headcount: t('extractresult:kpi_tooltips.headcount'),
        'Argent brûlé': t('extractresult:kpi_tooltips.cash_burn'),
        'Cash Burn': t('extractresult:kpi_tooltips.cash_burn'),
        'Cash Balance': t('extractresult:kpi_tooltips.cash_balance'),
        EBITDA: t('extractresult:kpi_tooltips.ebitda'),
        'Revenu Annuel Récurrent (ARR)': t('extractresult:kpi_tooltips.arr'),
        'Annual Recurring Revenue (ARR)': t('extractresult:kpi_tooltips.arr'),
        'Net ARR': t('extractresult:kpi_tooltips.net_arr'),
        'ARR base': t('extractresult:kpi_tooltips.arr_base'),
        'Organic ARR growth': t(
          'extractresult:kpi_tooltips.organic_arr_growth',
        ),
        'Enterprise NRR': t('extractresult:kpi_tooltips.enterprise_nrr'),
        Churn: t('extractresult:kpi_tooltips.churn'),
        'Revenu Mensuel Récurrent (MRR)': t('extractresult:kpi_tooltips.mrr'),
        'Monthly Recurring Revenue (MRR)': t('extractresult:kpi_tooltips.mrr'),
        'Montant levé': t('extractresult:kpi_tooltips.funding_amount'),
        'Funding Amount': t('extractresult:kpi_tooltips.funding_amount'),
      };

      // Créer les lignes de données en utilisant les valeurs numériques
      const dataRows = Object.entries(kpiData).map(
        ([kpiName, periodValues]) => {
          const row = {
            rowKey: generateUniqueId(
              `kpi-${kpiName.replace(/\s+/g, '_').toLowerCase()}`,
            ),
            key: kpiName,
            kpi: kpiName,
            tooltip: kpiTooltipMapping[kpiName] || '',
            modified: {},
            units: {}, // Ajouter un objet pour stocker les unités par période
          };

          if (typeof periodValues === 'object') {
            periods.forEach(period => {
              // Utiliser la valeur numérique si disponible, sinon utiliser 'N.A'
              const numericData =
                numericKpiData[kpiName] && numericKpiData[kpiName][period]
                  ? numericKpiData[kpiName][period]
                  : null;

              if (
                numericData &&
                numericData.value !== null &&
                numericData.value !== undefined
              ) {
                // Formater la valeur numérique pour l'affichage
                row[period] = numericData.value;
                row.units[period] = numericData.unit || '';
              } else {
                row[period] = 'N.A';
                row.units[period] = '';
              }
            });
          } else {
            row[periods[0]] = 'N.A';
            row.units[periods[0]] = '';
          }

          return row;
        },
      );

      // Les unités sont maintenant stockées directement dans les enregistrements

      setPeriodTableData(dataRows);
      setEditedValues(
        dataRows.reduce((acc, row) => {
          acc[row.rowKey] = { ...row };
          return acc;
        }, {}),
      );
    },
    [periodicity, t],
  );

  // Nouvelle fonction pour mettre à jour seulement les titres des colonnes
  const updateColumnTitles = useCallback((year, periods) => {
    setPeriodTableColumns(currentColumns => {
      return currentColumns.map((column, index) => {
        // La première colonne est KPI, la dernière est Actions
        if (index === 0 || index === currentColumns.length - 1) {
          return column;
        }

        // Pour les colonnes de périodes, mettre à jour seulement le titre
        const periodIndex = index - 1; // -1 car la première colonne est KPI
        if (periodIndex >= 0 && periodIndex < periods.length) {
          const period = periods[periodIndex];
          return {
            ...column,
            title: year === null ? period : `${period} ${year}`,
          };
        }

        return column;
      });
    });
  }, []);

  useEffect(() => {
    if (currentData) {
      processKpiData(currentData);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [currentData, processKpiData]);

  // Effet séparé pour mettre à jour les titres des colonnes quand selectedYear ou periodsFound changent
  useEffect(() => {
    if (periodsFound.length > 0 && periodTableColumns.length > 0) {
      updateColumnTitles(selectedYear, periodsFound);
    }
  }, [selectedYear, periodsFound, updateColumnTitles]);

  const edit = record => {
    setEditingKpiData(record);
    const initialValues = { kpiName: record.kpi };

    // Get all period keys from the record (excluding common fields)
    const recordPeriodKeys = Object.keys(record).filter(
      key =>
        ![
          'key',
          'kpi',
          'tooltip',
          'modified',
          'actions',
          'rowKey',
          'units',
        ].includes(key),
    );

    // Match period keys with record keys
    recordPeriodKeys.forEach(periodKey => {
      initialValues[periodKey] =
        record[periodKey] === 'N.A' ? '' : record[periodKey];
    });

    // Ajouter l'unité commune (prendre la première unité non vide ou '')
    const commonUnit = record.units
      ? Object.values(record.units).find(unit => unit && unit !== '') || ''
      : '';
    initialValues.unit = commonUnit;

    editKpiForm.setFieldsValue(initialValues);
    setIsEditModalVisible(true);
  };

  const deleteKpi = record => {
    Modal.confirm({
      title: t('extractresult:delete_kpi.confirm_title'),
      content: t('extractresult:delete_kpi.confirm_message', {
        kpiName: record.kpi,
      }),
      okText: t('extractresult:delete_kpi.confirm_ok'),
      okType: 'danger',
      cancelText: t('extractresult:cancel'),
      onOk() {
        try {
          // Utiliser la fonction callback pour accéder aux valeurs actuelles
          setPeriodTableData(currentData => {
            const newTableData = currentData.filter(
              item => item.rowKey !== record.rowKey,
            );
            return newTableData;
          });

          setEditedValues(currentValues => {
            const newEditedValues = { ...currentValues };
            delete newEditedValues[record.rowKey];
            return newEditedValues;
          });

          message.success(
            t('extractresult:delete_kpi.success', {
              kpiName: record.kpi,
            }),
          );
        } catch (error) {
          notification.error({
            message: t('extractresult:delete_kpi.error'),
            description: error.message,
          });
        }
      },
    });
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    newKpiForm.resetFields();
  };

  const handleAddOk = async () => {
    try {
      const values = await newKpiForm.validateFields();
      const newKpiName = values.kpiName;

      if (periodTableData.some(item => item.kpi === newKpiName)) {
        notification.error({
          message: t('extractresult:add_kpi.duplicate_error'),
        });
        return;
      }

      const rowKey = generateUniqueId(
        `kpi-${newKpiName.replace(/\s+/g, '_').toLowerCase()}-new`,
      );
      const newRow = {
        rowKey,
        key: newKpiName,
        kpi: newKpiName,
        tooltip: '',
        modified: {},
        units: {},
      };

      const commonUnit = values.unit || '';

      periodsFound.forEach(period => {
        let value = values[period] || 'N.A';

        // Convertir la valeur en nombre si possible
        if (value !== 'N.A' && value !== '' && value !== null) {
          const parsedValue = parseFloat(value);
          if (!isNaN(parsedValue)) {
            value = parsedValue;
          }
        }

        newRow[period] = value;
        newRow.units[period] = commonUnit;
        newRow.modified[period] = true;
      });

      // Créer une nouvelle référence pour le tableau
      const newTableData = [...periodTableData, newRow];
      setPeriodTableData(newTableData);

      // Créer une nouvelle référence pour editedValues
      setEditedValues({ ...editedValues, [rowKey]: { ...newRow } });

      setIsAddModalVisible(false);
      newKpiForm.resetFields();
      message.success(
        t('extractresult:add_kpi.success', {
          kpiName: newKpiName,
        }),
      );
    } catch {
      notification.error({
        message: t('extractresult:add_kpi.validation_error'),
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
      const originalRowKey = editingKpiData.rowKey;
      const newKpiName = values.kpiName;

      if (
        newKpiName !== originalKey &&
        periodTableData.some(
          item => item.kpi === newKpiName && item.rowKey !== originalRowKey,
        )
      ) {
        notification.error({
          message: t('extractresult:add_kpi.duplicate_error'),
        });
        return;
      }

      // Créer une copie complète des données
      const newData = [...periodTableData];
      const index = newData.findIndex(item => item.rowKey === originalRowKey);

      if (index > -1) {
        const item = newData[index];
        const modifiedPeriods = { ...item.modified };
        const updatedUnits = { ...item.units };

        const updatedItem = {
          ...item,
          key: newKpiName,
          kpi: newKpiName,
        };

        const commonUnit = values.unit || '';

        periodsFound.forEach(period => {
          let newValue = values[period] || 'N.A';

          // Convertir la valeur en nombre si possible
          if (newValue !== 'N.A' && newValue !== '' && newValue !== null) {
            const parsedValue = parseFloat(newValue);
            if (!isNaN(parsedValue)) {
              newValue = parsedValue;
            }
          }

          if (item[period] !== newValue) {
            updatedItem[period] = newValue;
            modifiedPeriods[period] = true;
          } else {
            modifiedPeriods[period] = item.modified?.[period] || false;
          }

          // Mettre à jour l'unité (même unité pour toutes les périodes)
          updatedUnits[period] = commonUnit;
        });

        updatedItem.modified = modifiedPeriods;
        updatedItem.units = updatedUnits;

        newData.splice(index, 1, updatedItem);
        setPeriodTableData(newData);

        // Mise à jour des editedValues avec nouvelles références
        const newEditedValues = { ...editedValues };
        newEditedValues[originalRowKey] = updatedItem;
        setEditedValues(newEditedValues);

        // Les unités sont maintenant stockées directement dans l'enregistrement

        setIsEditModalVisible(false);
        setEditingKpiData(null);
        message.success(t('extractresult:modifications_saved'));
      } else {
        notification.error({
          message: t('extractresult:edit_kpi.error_title'),
          description: t('extractresult:edit_kpi.not_found'),
        });
        setIsEditModalVisible(false);
        setEditingKpiData(null);
      }
    } catch {
      notification.error({
        message: t('extractresult:validation.error_title'),
        description: t('extractresult:validation.form_failed'),
      });
    }
  };

  const handleSubmit = async (saveAsDraft = false) => {
    // Vérifier qu'une année a été sélectionnée ou détectée
    if (!selectedYear) {
      openNotificationWithIcon(
        'error',
        t('extractresult:validation.year_required_title'),
        t('extractresult:validation.year_required_message'),
      );
      return;
    }

    try {
      setIsValidating(true);

      // Préparer les données modifiées pour l'API
      const { kpis: modifiedKpis, units: kpiUnits } =
        convertTableDataToKpiFormat();
      const status = saveAsDraft ? 'draft' : 'validated';

      if (isEditMode) {
        // Mode édition : mettre à jour le document existant
        const updateData = {
          kpis: modifiedKpis,
          units: kpiUnits,
          status: status,
          year: selectedYear,
        };

        await documentsService.updateDocument(documentId, updateData);

        const successMessage = saveAsDraft
          ? t('extractresult:validation.draft_success_message')
          : t('extractresult:validation.success_message');

        notification.success({
          message: t('extractresult:validation.success_title'),
          description: successMessage,
        });

        setIsValidating(false);

        // Rediriger vers la page des documents
        setTimeout(() => {
          navigate('/documents');
        }, 1500);
      } else {
        // Mode création : logique existante
        if (!currentData || !currentData.pdfUrl) {
          Modal.error({
            title: t('extractresult:validation.missing_data_title'),
            content: t('extractresult:validation.missing_pdf_message'),
            okText: t('common.ok', 'OK'),
          });
          setIsValidating(false);
          return;
        }

        // Récupérer le contenu du PDF en base64
        const pdfResponse = await axios.get(currentData.pdfUrl, {
          responseType: 'blob',
        });

        // Convertir le blob en base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64data = reader.result.split(',')[1];

            const documentData = documentsService.prepareDocumentData(
              {
                ...currentData,
                year: selectedYear,
              },
              base64data,
              status,
              modifiedKpis,
              kpiUnits,
            );

            // Appeler l'API pour sauvegarder
            await documentsService.saveDocument(documentData);

            const successMessage = saveAsDraft
              ? t('extractresult:validation.draft_success_message')
              : t('extractresult:validation.success_message');

            notification.success({
              message: t('extractresult:validation.success_title'),
              description: successMessage,
            });

            setIsValidating(false);

            // Rediriger vers la page des documents
            setTimeout(() => {
              navigate('/documents');
            }, 1500);
          } catch (error) {
            Modal.error({
              title: t('extractresult:validation.error_title'),
              content: t('extractresult:validation.error_message', {
                error: error.message,
              }),
              okText: t('common.ok', 'OK'),
            });
            setIsValidating(false);
          }
        };
        reader.onerror = () => {
          Modal.error({
            title: t('extractresult:validation.error_title'),
            content: t('extractresult:validation.pdf_read_error'),
            okText: t('common.ok', 'OK'),
          });
          setIsValidating(false);
        };
        reader.readAsDataURL(pdfResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);

      // Essayer de gérer l'erreur GPT spécifiquement
      const isGptError = handleGptError(error);

      if (!isGptError) {
        // Si ce n'est pas une erreur GPT reconnue, afficher l'erreur générique
        Modal.error({
          title: t('extractresult:validation.error_title'),
          content: t('extractresult:validation.error_message', {
            error: error.message,
          }),
          okText: t('common.ok', 'OK'),
        });
      }

      setIsValidating(false);
    }
  };

  const handleYearSelection = date => {
    const year = date ? date.year() : null;
    setSelectedYear(year);
    setYearSelectionRequired(false);

    // Message informatif à l'utilisateur
    message.success(t('extractresult:year_selection.year_updated', { year }));
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

    const periodsLabel =
      selectedYear === null
        ? periodsFound.join(', ')
        : periodsFound.map(p => `${p} ${selectedYear}`).join(', ');

    return (
      <Alert
        message={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag color="processing">{`${t('documents:textract_results.periodicity_info.periodicity')}: ${periodicityLabel}`}</Tag>
              <Tag icon={<ClockCircleOutlined />} color="warning">
                {`${periodsFound.length} ${t('documents:textract_results.periodicity_info.periods_detected')}: ${periodsLabel}`}
              </Tag>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {t('documents:textract_results.periodicity_info.year')}:
              </span>
              <DatePicker
                picker="year"
                size="small"
                style={{ width: '120px' }}
                placeholder={t(
                  'documents:textract_results.year_selection.placeholder',
                )}
                onChange={handleYearSelection}
                value={selectedYear ? dayjs().year(selectedYear) : null}
                showToday={false}
                disabledDate={current =>
                  current && current > dayjs().endOf('year')
                }
                allowClear
              />
              <Tooltip
                title={t(
                  'documents:textract_results.year_selection.change_hint',
                )}
              >
                <InfoCircleOutlined
                  style={{ color: '#1890ff', cursor: 'help' }}
                />
              </Tooltip>
            </div>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  };

  // Fonction pour convertir periodTableData en format KPI pour la sauvegarde
  const convertTableDataToKpiFormat = () => {
    const kpis = {};
    const units = {};

    periodTableData.forEach(row => {
      const kpiName = row.kpi;
      kpis[kpiName] = {};

      // Récupérer l'unité pour ce KPI (première unité non vide ou '')
      const kpiUnit = row.units
        ? Object.values(row.units).find(unit => unit && unit !== '') || ''
        : '';
      units[kpiName] = kpiUnit;

      // Parcourir toutes les périodes pour ce KPI
      periodsFound.forEach(period => {
        if (row[period] && row[period] !== 'N.A') {
          let numericValue = 0;

          if (typeof row[period] === 'number') {
            numericValue = row[period];
          } else if (typeof row[period] === 'string') {
            // Convertir la string en nombre
            const cleanValue = row[period]
              .replace(/[^\d.,-]/g, '')
              .replace(',', '.');
            const parsed = parseFloat(cleanValue);
            numericValue = isNaN(parsed) ? 0 : parsed;

            // Gérer les multiplicateurs (K, M, B)
            const upperValue = row[period].toUpperCase();
            if (upperValue.includes('K')) {
              numericValue *= 1000;
            } else if (upperValue.includes('M')) {
              numericValue *= 1000000;
            } else if (upperValue.includes('B') || upperValue.includes('G')) {
              numericValue *= 1000000000;
            }
          }

          kpis[kpiName][period] = numericValue;
        }
      });
    });

    return { kpis, units };
  };

  // Nouvelle fonction pour ajouter une colonne
  const handleAddColumn = async () => {
    try {
      const values = await addColumnForm.validateFields();
      const newPeriod = values.periodName;

      // Vérifier si la période existe déjà
      if (periodsFound.includes(newPeriod)) {
        notification.error({
          message: t('extractresult:add_column.duplicate_error'),
          description: t('extractresult:add_column.period_exists', {
            period: newPeriod,
          }),
        });
        return;
      }

      // Ajouter la nouvelle période à la liste
      const updatedPeriods = [...periodsFound, newPeriod];
      setPeriodsFound(updatedPeriods);

      // Mettre à jour les données du tableau pour inclure la nouvelle colonne
      const updatedTableData = periodTableData.map(row => ({
        ...row,
        [newPeriod]: 'N.A',
        modified: {
          ...row.modified,
          [newPeriod]: false,
        },
      }));
      setPeriodTableData(updatedTableData);

      // Mettre à jour editedValues
      const updatedEditedValues = { ...editedValues };
      Object.keys(updatedEditedValues).forEach(rowKey => {
        updatedEditedValues[rowKey] = {
          ...updatedEditedValues[rowKey],
          [newPeriod]: 'N.A',
        };
      });
      setEditedValues(updatedEditedValues);

      // Fermer la modal et réinitialiser le form
      setIsAddColumnModalVisible(false);
      addColumnForm.resetFields();

      message.success(
        t('extractresult:add_column.success', { period: newPeriod }),
      );
    } catch {
      notification.error({
        message: t('extractresult:add_column.validation_error'),
      });
    }
  };

  const handleAddColumnCancel = () => {
    setIsAddColumnModalVisible(false);
    addColumnForm.resetFields();
  };

  if (loading || loadingDocument) {
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

  // Afficher le sélecteur d'année si nécessaire
  if (yearSelectionRequired) {
    return (
      <div className="rounded-md h-full">
        <Card
          bordered={false}
          style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            borderRadius: 8,
            marginBottom: 20,
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <InfoCircleOutlined
                style={{
                  fontSize: '48px',
                  color: '#1890ff',
                  marginBottom: '16px',
                }}
              />
              <Typography.Title level={3}>
                {t('documents:textract_results.year_selection.title')}
              </Typography.Title>
              <Typography.Text
                type="secondary"
                style={{ display: 'block', marginBottom: '24px' }}
              >
                {t('documents:textract_results.year_selection.description')}
              </Typography.Text>
            </div>

            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <Typography.Text
                strong
                style={{ display: 'block', marginBottom: '8px' }}
              >
                {t('documents:textract_results.year_selection.select_year')}
              </Typography.Text>
              <DatePicker
                picker="year"
                style={{ width: '100%' }}
                placeholder={t(
                  'documents:textract_results.year_selection.placeholder',
                )}
                onChange={handleYearSelection}
                value={selectedYear ? dayjs().year(selectedYear) : null}
                showToday={false}
                disabledDate={current =>
                  current && current > dayjs().endOf('year')
                }
              />
            </div>

            <Space>
              <Button
                type="default"
                icon={<UndoOutlined />}
                onClick={() => navigate(-1)}
              >
                {t('analyze.cancel')}
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  if (selectedYear) {
                    handleYearSelection(dayjs().year(selectedYear));
                  } else {
                    handleYearSelection(dayjs());
                  }
                }}
              >
                {t('documents:textract_results.year_selection.continue')}
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

  // Afficher un spin global si en cours de validation
  if (isValidating) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}
      >
        <Spin size="large" />
        <Typography.Text style={{ marginTop: 16, fontSize: '16px' }}>
          {t('documents:textract_results.validation.validating')}
        </Typography.Text>
      </div>
    );
  }

  return (
    <>
      {!currentData ? (
        <div style={{ padding: 20 }}>
          <Title level={4}>{t('extractresult:noResults')}</Title>
          <Button onClick={() => navigate(-1)}>
            {t('extractresult:back')}
          </Button>
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
                  {t('extractresult:kpiAnalysisTitle')}
                </Title>

                <Row gutter={16} style={{ height: '650px' }}>
                  <Col xs={24} lg={12} style={{ height: '100%' }}>
                    <Card
                      title={
                        <Space>
                          <span>
                            {t('documents:textract_results.document_source')}
                          </span>
                          {currentData.pdfUrl && (
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
                      {currentData.pdfUrl ? (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                          }}
                        >
                          <iframe
                            src={currentData.pdfUrl}
                            title={t('extractresult:pdfPreview')}
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
                            data={currentData.pdfUrl}
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
                              src={currentData.pdfUrl}
                              type="application/pdf"
                              width="100%"
                              height="100%"
                            />
                          </object>
                        </div>
                      ) : currentData.imageUrls &&
                        currentData.imageUrls.length > 0 ? (
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
                              {currentData.imageUrls.length}{' '}
                              {t('extractresult:imagesAvailable')}
                            </Text>
                          </div>
                          {currentData.imageUrls.map((url, index) => (
                            <div key={index} style={{ marginBottom: '20px' }}>
                              <div style={{ marginBottom: '5px' }}>
                                <Space>
                                  <Text strong>
                                    {t('extractresult:page', 'Page')}{' '}
                                    {index + 1}
                                  </Text>
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() => window.open(url, '_blank')}
                                  >
                                    {t('extractresult:open')}
                                  </Button>
                                </Space>
                              </div>
                              <img
                                src={url}
                                alt={`${t('extractresult:page', 'Page')} ${index + 1}`}
                                style={{
                                  width: '100%',
                                  border: '1px solid #eee',
                                  display: 'block',
                                }}
                                onLoad={() =>
                                  console.warn(
                                    `${t('extractresult:image', 'Image')} ${index + 1} ${t('extractresult:loaded', 'chargée')}:`,
                                    url,
                                  )
                                }
                                onError={e => {
                                  console.error(
                                    `${t('extractresult:image_load_error')} ${index + 1}:`,
                                    e,
                                  );
                                  e.target.style.display = 'none';
                                  const errorDiv =
                                    document.createElement('div');
                                  errorDiv.innerText = `${t('extractresult:image_load_error')}: ${url}`;
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
                            description={t('extractresult:noPdfAvailable')}
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
                          <span>{t('extractresult:kpi_table')}</span>
                          <Tag icon={<CheckCircleOutlined />} color="success">
                            {t('extractresult:ai_validated')}
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
                    >
                      {periodsFound.length > 0 ? (
                        <>
                          {renderPeriodicityInfo()}
                          <Table
                            columns={periodTableColumns}
                            dataSource={periodTableData}
                            rowKey="rowKey"
                            pagination={false}
                            bordered
                            size="middle"
                            scroll={{ x: 'max-content', y: '450px' }}
                            style={{ marginBottom: 10 }}
                            locale={{
                              emptyText: (
                                <Empty
                                  description={t('extractresult:no_data')}
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                              ),
                            }}
                          />
                          <Space
                            style={{
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                          >
                            {getAvailableKpisForSelection().length > 0 && (
                              <Button
                                type="link"
                                icon={<PlusOutlined />}
                                onClick={() => setIsAddModalVisible(true)}
                                style={{ fontSize: '12px' }}
                              >
                                {t('extractresult:add_kpi.add_manual')}
                              </Button>
                            )}
                            <Button
                              type="link"
                              icon={<PlusOutlined />}
                              onClick={() => setIsAddColumnModalVisible(true)}
                              style={{ fontSize: '12px' }}
                            >
                              {t('extractresult:add_column.add_column')}
                            </Button>
                          </Space>
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
                <Space direction="vertical" size="small">
                  <Space>
                    <Button
                      type="default"
                      icon={<UndoOutlined />}
                      onClick={() => navigate(-1)}
                      disabled={isValidating}
                    >
                      {t('analyze.cancel')}
                    </Button>
                    <Button
                      type="default"
                      onClick={() => handleSubmit(true)}
                      loading={isValidating}
                      icon={<FormOutlined />}
                    >
                      {t('extractresult:save_as_draft')}
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => handleSubmit(false)}
                      loading={isValidating}
                      icon={<SaveOutlined />}
                    >
                      {t('extractresult:validate_document')}
                    </Button>
                  </Space>
                  {!selectedYear && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('extractresult:validation.year_required_message')}
                    </Text>
                  )}
                </Space>
              </div>
            </Space>
          </Card>
        </div>
      )}

      <Modal
        title={t('extractresult:add_column.modal_title')}
        open={isAddColumnModalVisible}
        onOk={handleAddColumn}
        onCancel={handleAddColumnCancel}
        okText={t('extractresult:add_column.add_button')}
        cancelText={t('extractresult:cancel')}
      >
        <Form form={addColumnForm} layout="vertical" name="add_column_form">
          <Form.Item
            name="periodName"
            label={t('extractresult:add_column.period_name_label')}
            rules={[
              {
                required: true,
                message: t('extractresult:add_column.period_name_required'),
              },
            ]}
          >
            <Input
              placeholder={t(
                'extractresult:add_column.period_name_placeholder',
              )}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Alert
            message={t('extractresult:add_column.info_title')}
            description={t('extractresult:add_column.info_description')}
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Form>
      </Modal>

      <Modal
        title={t('extractresult:add_kpi.modal_title')}
        open={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
        okText={t('extractresult:add_kpi.add_button')}
        cancelText={t('extractresult:cancel')}
      >
        <Form form={newKpiForm} layout="vertical" name="add_kpi_form">
          <Form.Item
            name="kpiName"
            label={t('extractresult:add_kpi.kpi_name_label')}
            rules={[
              {
                required: true,
                message: t('extractresult:add_kpi.kpi_name_required'),
              },
            ]}
          >
            <Select
              placeholder={t('extractresult:add_kpi.kpi_name_placeholder')}
              options={getAvailableKpisForSelection().map(kpi => ({
                value: kpi.label,
                label: kpi.label,
              }))}
              showSearch
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item name="unit" label={t('extractresult:unit', 'Unité')}>
            <Select
              placeholder={t(
                'extractresult:select_unit',
                'Sélectionner une unité',
              )}
              allowClear
              options={availableUnits}
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
                    placeholder={t('extractresult:tag_labels.not_available')}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>

      <Modal
        title={t('extractresult:edit_kpi.modal_title')}
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText={t('extractresult:save')}
        cancelText={t('extractresult:cancel')}
        destroyOnClose
      >
        <Form form={editKpiForm} layout="vertical" name="edit_kpi_form">
          <Form.Item
            name="kpiName"
            label={t('extractresult:add_kpi.kpi_name_label')}
            rules={[
              {
                required: true,
                message: t('extractresult:add_kpi.kpi_name_required'),
              },
            ]}
          >
            <Input
              disabled
              placeholder={t('extractresult:add_kpi.kpi_name_placeholder')}
            />
          </Form.Item>

          <Form.Item name="unit" label={t('extractresult:unit', 'Unité')}>
            <Select
              placeholder={t(
                'extractresult:select_unit',
                'Sélectionner une unité',
              )}
              allowClear
              options={availableUnits}
            />
          </Form.Item>

          <Row gutter={16}>
            {editingKpiData &&
              Object.keys(editingKpiData)
                .filter(
                  key =>
                    ![
                      'key',
                      'kpi',
                      'tooltip',
                      'modified',
                      'actions',
                      'rowKey',
                      'units',
                    ].includes(key),
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
                                'rowKey',
                                'units',
                              ].includes(k),
                          ).length,
                      ),
                    )}
                    key={period}
                  >
                    <Form.Item name={period} label={period}>
                      <Input
                        placeholder={t(
                          'extractresult:tag_labels.not_available',
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

export default ExtractResult;
