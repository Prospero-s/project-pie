import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Tag,
  Space,
  Spin,
  Typography,
  Card,
  Row,
  Col,
  Descriptions,
  Divider,
  message,
  Select,
} from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FormOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import documentsService, {
  openDocumentInNewWindow,
} from '@/services/documents/documentsService';

const { Text } = Typography;
const { Option } = Select;

const DocumentDetailsModal = ({
  visible,
  onCancel,
  documentId,
  t,
  onDocumentUpdated,
  i18n,
}) => {
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const lng = i18n.language;
  useEffect(() => {
    if (visible && documentId) {
      loadDocument();
    }
  }, [visible, documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const data = await documentsService.getDocumentById(documentId);
      setDocument(data);
      processKpiData(data);
    } catch (error) {
      message.error(t('messages.loading_error'));
      console.error('Erreur lors du chargement du document:', error);
    } finally {
      setLoading(false);
    }
  };

  const processKpiData = document => {
    if (!document || !document.kpis) {
      setTableData([]);
      setPeriods([]);
      return;
    }

    // Organiser les KPIs par nom et période
    const kpisByName = {};
    const periodsSet = new Set();

    document.kpis.forEach(kpi => {
      const { name, period, value, unit } = kpi;
      periodsSet.add(period);

      if (!kpisByName[name]) {
        kpisByName[name] = {
          key: name,
          kpi: name,
          units: {},
        };
      }

      kpisByName[name][period] = value;
      kpisByName[name].units[period] = unit || '';
    });

    const periodsArray = Array.from(periodsSet).sort();
    setPeriods(periodsArray);

    const tableRows = Object.values(kpisByName);
    setTableData(tableRows);
  };

  const handleStatusChange = async newStatus => {
    try {
      setUpdatingStatus(true);
      await documentsService.updateDocument(documentId, { status: newStatus });
      setDocument({ ...document, status: newStatus });
      message.success(t('document_details.status_updated'));
      if (onDocumentUpdated) {
        onDocumentUpdated();
      }
    } catch (error) {
      message.error(t('document_details.status_update_error'));
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEdit = () => {
    onCancel();
    navigate(`/${lng}/documents/edit/${documentId}`);
  };

  const handleViewPdf = () => {
    openDocumentInNewWindow(documentId);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'draft':
        return 'orange';
      case 'validated':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'draft':
        return <FormOutlined />;
      case 'validated':
        return <CheckCircleOutlined />;
      default:
        return null;
    }
  };

  const getPeriodicityLabel = periodicity => {
    const periodicityMap = {
      q: 'quarterly',
      h: 'half_yearly',
      a: 'yearly',
      y: 'yearly',
    };

    const mappedPeriodicity =
      periodicityMap[periodicity?.toLowerCase()] || 'quarterly';
    return t(`textract_results.periodicity_info.${mappedPeriodicity}`);
  };

  const columns = [
    {
      title: t('extractresult:kpi'),
      dataIndex: 'kpi',
      key: 'kpi',
      width: 200,
      fixed: 'left',
    },
    ...periods.map(period => ({
      title: `${period} ${document?.year || ''}`,
      dataIndex: period,
      key: period,
      render: (value, record) => {
        const unit = record.units?.[period] || '';
        const displayValue =
          value === null || value === undefined ? 'N.A' : `${value}${unit}`;

        return (
          <Tag
            color={value === null || value === undefined ? 'default' : 'blue'}
          >
            {displayValue}
          </Tag>
        );
      },
    })),
  ];

  return (
    <Modal
      title={
        <Space className="mb-8">
          <FileTextOutlined />
          {t('document_details.title')}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button icon={<UndoOutlined />} key="cancel" onClick={onCancel}>
          {t('extractresult:cancel')}
        </Button>,
        document?.status === 'draft' && (
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            {t('document_details.edit_document')}
          </Button>
        ),
        <Button key="view-pdf" icon={<EyeOutlined />} onClick={handleViewPdf}>
          {t('document_details.view_pdf')}
        </Button>,
      ].filter(Boolean)}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : document ? (
        <div>
          {/* Informations générales du document */}
          <Card
            title={t('document_details.general_info')}
            style={{ marginBottom: 16 }}
            size="small"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label={t('table.company')}>
                    {document.company?.denomination ||
                      t('table.unknown_company')}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('table.filename')}>
                    {document.filename || t('table.unknown_filename')}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t('extractresult:periodicity_info.year')}
                  >
                    <Space>
                      <CalendarOutlined />
                      {document.year}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item
                    label={t('textract_results.periodicity_info.periodicity')}
                  >
                    {getPeriodicityLabel(document.periodicity)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('table.status')}>
                    <Space>
                      <Tag
                        icon={getStatusIcon(document.status)}
                        color={getStatusColor(document.status)}
                      >
                        {t(`table.statuses.${document.status}`)}
                      </Tag>
                      {document.status === 'draft' && (
                        <Select
                          size="small"
                          value={document.status}
                          onChange={handleStatusChange}
                          loading={updatingStatus}
                          style={{ width: 120 }}
                        >
                          <Option value="draft">
                            {t('table.statuses.draft')}
                          </Option>
                          <Option value="validated">
                            {t('table.statuses.validated')}
                          </Option>
                        </Select>
                      )}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('document_details.add_date')}>
                    {new Date(document.addDate).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>

          <Divider />

          {/* Tableau des KPIs */}
          <Card
            title={
              <Space>
                <span>{t('extractresult:kpi_table')}</span>
                <Tag color="blue">{tableData.length} KPI(s)</Tag>
              </Space>
            }
            size="small"
          >
            {tableData.length > 0 ? (
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                scroll={{ x: 'max-content' }}
                size="small"
                bordered
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">{t('extractresult:no_data')}</Text>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type="secondary">{t('document_details.no_document')}</Text>
        </div>
      )}
    </Modal>
  );
};

export default DocumentDetailsModal;
