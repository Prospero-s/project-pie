import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Upload,
  Button,
  message,
  Typography,
  Spin,
  Select,
  Radio,
  Tooltip,
  Space,
  Checkbox,
  DatePicker,
} from 'antd';
import {
  UploadOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/userContext';
import dayjs from 'dayjs';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';

const { Text } = Typography;
const { Option } = Select;

// URL du service Python PDF Processor
const PDF_PROCESSOR_URL =
  import.meta.env.VITE_PDF_PROCESSOR_URL || 'http://localhost:5000';

const UploadPopup = ({ visible, onClose, company, i18n, lng }) => {
  const [fileList, setFileList] = useState([]);
  const { t } = useTranslation('documents', { i18n });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedKpis, setSelectedKpis] = useState([]);
  const [periodicity, setPeriodicity] = useState('Q');
  const [selectedYear, setSelectedYear] = useState(null);
  const { setAnalyzedData } = useUser();
  const navigate = useNavigate();

  // Mapping des KPI options avec leurs descriptions et tooltips
  const kpiOptions = [
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

  const handleFileChange = ({ file }) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error(t('documents:upload.file_size_error'));
      return;
    }

    if (file.status !== 'removed') {
      setFileList([file]);
    } else {
      setFileList([]);
    }
  };

  const handleRemoveFile = () => {
    setFileList([]);
    message.info(t('documents:upload.file_removed'));
  };

  const handleKpiChange = values => {
    setSelectedKpis(values);
  };

  const handleSelectAllKpis = e => {
    if (e.target.checked) {
      // Sélectionner tous les KPIs
      setSelectedKpis(kpiOptions.map(kpi => kpi.value));
    } else {
      // Désélectionner tous les KPIs
      setSelectedKpis([]);
    }
  };

  const handlePeriodicityChange = e => {
    setPeriodicity(e.target.value);
  };

  const handleYearChange = date => {
    setSelectedYear(date ? date.year() : null);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      setError(t('documents:upload.errors.no_file'));
      openNotificationWithIcon(
        'error',
        t('documents:upload.errors.title', 'Erreur'),
        t('documents:upload.errors.no_file'),
      );
      return;
    }

    if (selectedKpis.length === 0) {
      setError(t('documents:upload.errors.no_kpi'));
      openNotificationWithIcon(
        'error',
        t('documents:upload.errors.title', 'Erreur'),
        t('documents:upload.errors.no_kpi'),
      );
      return;
    }

    const file = fileList[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', company?.id || '');
    formData.append('periodicity', periodicity);
    formData.append('kpis', JSON.stringify(selectedKpis));
    if (selectedYear !== null && selectedYear !== 'all') {
      formData.append('year', selectedYear);
    }
    formData.append('language', i18n.language);

    try {
      setLoading(true);
      setError(null);

      // Authentification avec Cognito si nécessaire
      let cognitoToken = null;
      try {
        const session = await Auth.currentSession();
        cognitoToken = session.getIdToken().getJwtToken();
      } catch (authError) {
        console.warn('Session Cognito non disponible:', authError);
      }

      // Définir les headers
      const headers = {
        'Content-Type': 'multipart/form-data',
      };

      if (cognitoToken) {
        headers['X-Cognito-Id'] = cognitoToken;
      }

      // Appel vers le service Python PDF Processor au lieu de l'API Textract
      const response = await axios.post(
        `${PDF_PROCESSOR_URL}/upload`,
        formData,
        {
          headers,
        },
      );

      if (response.data) {
        // Stocker l'ID de traitement pour le nettoyage ultérieur si nécessaire
        const processingId = response.data.processing_id;

        message.success(t('documents:upload.success'));

        // Construction de l'objet de données analysées dans le format attendu par TextractResults
        const analyzedData = {
          // Données fournies par le PDF Processor
          ...response.data,
          // Métadonnées supplémentaires
          company,
          selectedKpis,
          periodicity,
          year: selectedYear,
          // Chemins d'images si disponibles
          pdfUrl: response.data.pdf_url || null,
          imageUrls: response.data.image_urls || [],
          // ID de traitement pour référence future
          processingId: processingId,
        };

        setAnalyzedData(analyzedData);
        navigate(`/${lng}/extract-results`);
        setFileList([]);
        onClose();
      } else {
        setError(t('documents:upload.errors.no_data'));
        message.error(t('documents:upload.errors.no_data'));
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);

      if (error.response) {
        // Erreur avec réponse du serveur
        setError(
          `${t('documents:upload.errors.analysis_error')}: ${error.response.data?.error || error.message}`,
        );
      } else if (error.request) {
        // Aucune réponse reçue
        setError(t('documents:upload.errors.no_response'));
      } else {
        // Autre erreur
        setError(t('documents:upload.errors.analysis_error'));
      }

      message.error(t('documents:upload.errors.analysis_error'));
    } finally {
      setLoading(false);
    }
  };

  // Composant d'écran de chargement personnalisé
  const LoadingScreen = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        textAlign: 'center',
      }}
    >
      {/* Logo Prospero avec spinner autour */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        {/* Spinner de chargement autour du logo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120px',
            height: '120px',
          }}
        >
          <Spin
            indicator={
              <LoadingOutlined
                style={{
                  fontSize: '120px',
                  color: '#3B71D6',
                  opacity: 0.3,
                }}
                spin
              />
            }
          />
        </div>

        {/* Icône Prospero au centre */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="144"
            height="162"
            viewBox="0 0 144 162"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '60px', height: 'auto' }}
          >
            <path
              d="M31.0216 121.341L3.04466 104.445C1.3211 103.406 0.268555 101.54 0.268555 99.5272L0.268555 24.7612C0.268555 21.8978 3.39396 20.1329 5.84832 21.6129L36.5967 40.186L36.5967 118.192C36.5967 121.056 33.4713 122.821 31.017 121.341H31.0216Z"
              fill="#3B71D6"
            />
            <path
              d="M113.247 40.6685L141.224 57.5641C142.948 58.6028 144 60.4689 144 62.482V137.248C144 140.111 140.875 141.876 138.42 140.396L107.672 121.823L107.672 43.8169C107.672 40.9535 110.797 39.1886 113.252 40.6685H113.247Z"
              fill="#3B71D6"
            />
            <path
              d="M90.2297 108.591L90.2297 32.0645C90.2297 30.0008 89.1221 28.0934 87.325 27.0731L42.0986 1.32531C39.6488 -0.0719258 36.6016 1.70219 36.6016 4.51964L36.6016 40.1446L51.1393 48.4223C52.9318 49.4427 54.0441 51.3501 54.0441 53.4137L54.0441 129.935C54.0441 131.999 55.1517 133.907 56.9488 134.927L102.175 160.675C104.625 162.072 107.672 160.298 107.672 157.48L107.672 121.855L93.1345 113.578C91.342 112.557 90.2297 110.65 90.2297 108.586V108.591Z"
              fill="#3B71D6"
            />
          </svg>
        </div>
      </div>

      {/* Messages de chargement */}
      <div style={{ maxWidth: '400px' }}>
        <Text
          strong
          style={{
            fontSize: '18px',
            color: '#202226',
            display: 'block',
            marginBottom: '12px',
          }}
        >
          {t('documents:upload.processing.title')}
        </Text>
        <Text
          style={{
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.5',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          {t('documents:upload.processing.message')}
        </Text>
        <Text
          style={{
            fontSize: '12px',
            color: '#999',
            fontStyle: 'italic',
          }}
        >
          {t('documents:upload.processing.file_size_note')}
        </Text>
      </div>
    </div>
  );

  return (
    <Modal
      title={loading ? null : t('documents:modal.upload_title')}
      open={visible}
      onCancel={loading ? undefined : onClose}
      footer={null}
      width={600}
      closable={!loading}
      maskClosable={!loading}
      keyboard={!loading}
    >
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            fileList={fileList}
            showUploadList={false}
            accept=".pdf"
          >
            {fileList.length === 0 && (
              <Button icon={<UploadOutlined />} block>
                {t('documents:modal.select_file')}
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

          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text strong>{t('documents:upload.select_kpis')}</Text>
              <Checkbox
                onChange={handleSelectAllKpis}
                checked={
                  selectedKpis.length === kpiOptions.length &&
                  kpiOptions.length > 0
                }
              >
                {t('documents:upload.select_all_kpis')}
              </Checkbox>
            </div>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              placeholder={t('documents:upload.select_kpis_placeholder')}
              onChange={handleKpiChange}
              optionLabelProp="label"
              value={selectedKpis}
            >
              {kpiOptions.map(option => (
                <Option
                  key={option.value}
                  value={option.value}
                  label={option.label}
                >
                  <Space>
                    {option.label}
                    <Tooltip title={option.tooltip}>
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 20 }}>
            <Text strong>{t('documents:upload.select_periodicity')}</Text>
            <Radio.Group
              onChange={handlePeriodicityChange}
              value={periodicity}
              style={{
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <Radio.Button value="Q">
                {t('documents:upload.quarterly')}
              </Radio.Button>
              <Radio.Button value="H">
                {t('documents:upload.half_yearly')}
              </Radio.Button>
              <Radio.Button value="Y">
                {t('documents:upload.yearly', 'Yearly')}
              </Radio.Button>
            </Radio.Group>
          </div>

          <div style={{ marginTop: 20 }}>
            <Text strong>{t('documents:upload.select_year')}</Text>
            <DatePicker
              picker="year"
              style={{ width: '100%', marginTop: 8 }}
              placeholder={t('documents:upload.select_year_placeholder')}
              onChange={handleYearChange}
              value={selectedYear ? dayjs().year(selectedYear) : null}
              allowClear
              showToday={false}
              disabledDate={current =>
                current && current > dayjs().endOf('year')
              }
            />
            {selectedYear === null && (
              <Text
                type="secondary"
                style={{
                  display: 'block',
                  marginTop: 4,
                  fontSize: '12px',
                }}
              >
                {t('documents:upload.year_optional_hint')}
              </Text>
            )}
          </div>

          <Button
            type="primary"
            onClick={handleUpload}
            block
            style={{ marginTop: 20 }}
            disabled={
              loading || fileList.length === 0 || selectedKpis.length === 0
            }
          >
            {loading ? <Spin /> : t('documents:upload.analyze')}
          </Button>

          {error && (
            <Text type="danger" style={{ marginTop: 10, display: 'block' }}>
              {error}
            </Text>
          )}
        </>
      )}
    </Modal>
  );
};

export default UploadPopup;
