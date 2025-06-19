import React, { useEffect, useState } from 'react';
import { Button, Tooltip, Table, Skeleton, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import {
  fetchDocuments,
  deleteDocument,
  openDocumentInNewWindow,
} from '@/services/documents/documentsService';
import { useNavigate } from 'react-router-dom';
import EmptyDocumentState from './EmptyDocumentState';
import DocumentDetailsModal from './DocumentDetailsModal';
import { formatDate, getDateLocale } from '@/lib/utils';

const TableDocuments = ({ t, i18n }) => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const lng = i18n.language;
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleTableChange = pagination => {
    setPagination(pagination);
    loadDocuments();
  };

  const handleDelete = async id => {
    try {
      await deleteDocument(id);
      message.success(t('messages.delete_success'));
      setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== id));
    } catch (error) {
      message.error(`${t('messages.delete_error')}: ${error.message || error}`);
    }
  };

  const handleViewDetails = record => {
    setSelectedDocumentId(record.id);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedDocumentId(null);
  };

  const handleDocumentUpdated = () => {
    loadDocuments(); // Recharger la liste après mise à jour
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetchDocuments();
      setDocuments(response);
      setPagination({
        current: 1,
        pageSize: 10,
        total: response.length || 0,
      });
    } catch (error) {
      message.error(t('messages.loading_error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: t('table.statuses.draft'), value: 'draft' },
        { text: t('table.statuses.validated'), value: 'validated' },
      ],
      onFilter: (value, record) => record.status === value,
      render: status =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          t(`table.statuses.${status}`)
        ),
    },
    {
      title: t('table.filename'),
      dataIndex: 'filename',
      key: 'filename',
      render: (text, record) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <span
            className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
            onClick={() => openDocumentInNewWindow(record.id)}
          >
            {text || record.pdfUrl || t('table.unknown_filename')}
          </span>
        ),
    },
    {
      title: t('table.company'),
      dataIndex: 'company',
      key: 'company',
      render: company =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : company && company.denomination ? (
          company.denomination
        ) : (
          t('table.unknown_company')
        ),
    },
    {
      title: t('document_details.add_date'),
      dataIndex: 'addDate',
      key: 'addDate',
      render: date =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          date &&
          formatDate(date, getDateLocale(lng), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        ),
    },
    {
      title: t('table.actions'),
      key: 'actions',
      render: (_, record) =>
        loading ? (
          <Skeleton.Button active size="small" />
        ) : (
          <div className="flex gap-2">
            {record.status === 'draft' && (
              <Tooltip title={t('table.tooltips.edit')}>
                <Button
                  className="!text-blue-500 hover:!text-blue-700 text-lg cursor-pointer"
                  icon={<EditOutlined />}
                  onClick={() =>
                    navigate(`/${lng}/documents/edit/${record.id}`)
                  }
                />
              </Tooltip>
            )}
            <Tooltip title={t('table.tooltips.view')}>
              <Button
                className="!text-blue-500 hover:!text-blue-700 text-lg cursor-pointer"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
              />
            </Tooltip>
            <Tooltip title={t('table.tooltips.delete')}>
              <Button
                className="!text-rose-500 hover:!text-rose-700 text-lg cursor-pointer"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
          </div>
        ),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-300 flex flex-col w-full">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={loading ? Array(5).fill({}) : documents}
            pagination={pagination}
            onChange={handleTableChange}
            rowClassName={(record, index) =>
              index % 2 === 0 ? '!bg-white' : '!bg-slate-50'
            }
            size="middle"
            locale={{
              emptyText:
                documents.length === 0 && !loading ? (
                  <EmptyDocumentState t={t} />
                ) : null,
            }}
          />
        </div>
      </div>

      <DocumentDetailsModal
        visible={isModalVisible}
        onCancel={handleModalClose}
        onDocumentUpdated={handleDocumentUpdated}
        documentId={selectedDocumentId}
        t={t}
        i18n={i18n}
      />
    </>
  );
};

export default TableDocuments;
