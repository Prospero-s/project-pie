import React, { useEffect, useState } from 'react';
import { Button, Tooltip, Table, Skeleton, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchDocuments } from '@/services/documents/documentsService';
import { useNavigate } from 'react-router-dom';
import { deleteDocument } from '@/services/documents/documentsService';

const TableDocuments = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    loadDocuments();
  };
  
  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      message.success("Document supprimé avec succès !");
      setDocuments((prevDocuments) => prevDocuments.filter(doc => doc.id !== id));
    } catch (error) {
      message.error("Erreur lors de la suppression du document.");
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetchDocuments();
      console.log('Données récupérées:', response);
      setDocuments(response);
      setPagination({
        current: 1,
        pageSize: 10,
        total: response.length || 0,
      });
    } catch (error) {
      message.error('Erreur lors du chargement des documents');
      console.error(error); // Debug
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nom de l’entreprise',
      dataIndex: 'company',
      key: 'company',
      render: (text) => (loading ? <Skeleton.Input block active size="small" /> : text),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Brouillon', value: 'draft' },
        { text: 'Traité', value: 'processed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Dernière mise à jour',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        ),
    },
    {
      title: 'Détails',
      dataIndex: 'kpi',
      key: 'kpi',
      render: (kpi) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <div className="grid grid-cols-9 gap-4 text-sm">
            {kpi.slice(0,50).map((item, index) => (
              <div key={index} className="border border-gray-300 p-2 rounded-md bg-gray-100">
                {item}
              </div>
            ))}
          </div>
        ),
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <div className="flex gap-2">
            {record.status === 'draft' && (
              <Tooltip title="Modifier">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/documents/edit/${record.id}`)}
                />
              </Tooltip>
            )}
            <Tooltip title="Supprimer">
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
          </div>
        ),
      }
  ];

  return (
    <div className="rounded-lg border border-slate-200 flex flex-col w-full">
      <Table
        columns={columns}
        dataSource={documents}
        loading={loading}
        onChange={handleTableChange}
        pagination={pagination}
        />
    </div>
  );
};

export default TableDocuments;