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
} from 'antd';
import {
  UploadOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/userContext';

const { Text } = Typography;
const { Option } = Select;

const UploadPopup = ({ visible, onClose, company, i18n, lng }) => {
  const [fileList, setFileList] = useState([]);
  const { t } = useTranslation('documents', { i18n });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedKpis, setSelectedKpis] = useState([]);
  const [periodicity, setPeriodicity] = useState('Q');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { setAnalyzedData } = useUser();
  const navigate = useNavigate();

  // Génération des années pour le sélecteur (actuelle +/- 2 ans)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

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
      message.success(t('documents:upload.file_selected', { name: file.name }));
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

  const handleYearChange = value => {
    setSelectedYear(value);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      setError(t('documents:upload.errors.no_file'));
      message.error(t('documents:upload.errors.no_file'));
      return;
    }

    if (selectedKpis.length === 0) {
      setError(t('documents:upload.errors.no_kpi'));
      message.error(t('documents:upload.errors.no_kpi'));
      return;
    }

    const file = fileList[0];
    const formData = new FormData();
    formData.append('document', file);
    formData.append('companyId', company?.id);
    formData.append('periodicity', periodicity);
    formData.append('kpis', JSON.stringify(selectedKpis));
    formData.append('year', selectedYear);

    try {
      setLoading(true);
      setError(null);
      const cognitoId = await Auth.currentSession()
        .then(session => session.getIdToken().getJwtToken())
        .catch(() => null);

      if (!cognitoId) {
        throw new Error(t('documents:upload.errors.auth_error'));
      }

      const response = await axios.post('/api/textract/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Cognito-Id': cognitoId,
        },
      });

      if (response.data) {
        message.success(t('documents:upload.success'));
        setAnalyzedData({
          ...response.data,
          company,
          selectedKpis,
          periodicity,
          year: selectedYear,
        });
        navigate(`/${lng}/textract-results`);
        setFileList([]);
        onClose();
      } else {
        setError(t('documents:upload.errors.no_data'));
        message.error(t('documents:upload.errors.no_data'));
      }
    } catch (error) {
      if (error.response) {
        setError(t('documents:upload.errors.analysis_error'));
      } else if (error.request) {
        setError(t('documents:upload.errors.no_response'));
      } else {
        setError(t('documents:upload.errors.analysis_error'));
      }
      message.error(t('documents:upload.errors.analysis_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t('documents:modal.upload_title')}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
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
              selectedKpis.length === kpiOptions.length && kpiOptions.length > 0
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
        </Radio.Group>
      </div>

      <div style={{ marginTop: 20 }}>
        <Text strong>{t('documents:upload.select_year')}</Text>
        <Select
          style={{ width: '100%', marginTop: 8 }}
          placeholder={t('documents:upload.select_year_placeholder')}
          onChange={handleYearChange}
          value={selectedYear}
        >
          {yearOptions.map(year => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>
      </div>

      <Button
        type="primary"
        onClick={handleUpload}
        block
        style={{ marginTop: 20 }}
        disabled={loading || fileList.length === 0 || selectedKpis.length === 0}
      >
        {loading ? <Spin /> : t('documents:upload.analyze')}
      </Button>

      {error && (
        <Text type="danger" style={{ marginTop: 10, display: 'block' }}>
          {error}
        </Text>
      )}
    </Modal>
  );
};

export default UploadPopup;
