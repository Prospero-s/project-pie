import React, { useEffect, useState } from 'react';
import { Button, Skeleton, Table, Tooltip } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import startupsMock from '@/mocks/investements/startupsMock';

const TableInvestments = ({ i18n }) => {
  const { t } = useTranslation('investments', { i18n });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    {
      title: '',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo, record) =>
        loading ? (
          <Skeleton.Avatar active shape="circle" />
        ) : (
          <img
            src={record.logo}
            alt={record.name}
            className="w-10 h-10 rounded-full"
          />
        ),
    },
    {
      title: t('entreprise_name'),
      dataIndex: 'name',
      key: 'name',
      render: (text) =>
        loading ? <Skeleton.Input block active size="small" /> : text,
    },
    {
      title: t('sector'),
      dataIndex: 'sector',
      key: 'sector',
      render: (text) =>
        loading ? <Skeleton.Input block active size="small" /> : text,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
      width: 400,
      ellipsis: {
        showTitle: false,
      },
      render: (text) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ),
    },
    {
      title: t('funding_type'),
      dataIndex: 'fundingType',
      key: 'fundingType',
      render: (text) =>
        loading ? <Skeleton.Input block active size="small" /> : text,
    },
    {
      title: t('amount_raised'),
      dataIndex: 'amountRaised',
      key: 'amountRaised',
      render: (amount) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          `${amount.toLocaleString()} €`
        ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 100,
      render: (text, record) =>
        loading ? (
          <Skeleton.Button active size="small" />
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to={`/investements/${record.id}`}
              className="text-blue-500 hover:text-blue-700 text-lg"
            >
              <EyeOutlined />
            </Link>
            <DeleteOutlined 
              className="!text-rose-500 hover:!text-rose-700 text-lg cursor-pointer" 
              onClick={() => handleDelete(record.id)}
            />
          </div>
        ),
    },
  ];

  const handleDelete = (id) => {
    console.log('Suppression de la startup avec l\'ID:', id);
  };

  const dataSource = startupsMock.map((startup, index) => ({
    key: index,
    ...startup,
  }));

  return (
    <div className="rounded-lg border border-slate-200 flex flex-col w-full">
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={loading ? Array(5).fill({}) : dataSource}
          pagination={false}
          rowClassName={(record, index) =>
            index % 2 === 0 ? '!bg-white' : '!bg-slate-50'
          }
          size="small"
        />
      </div>
      <TablePagination />
    </div>
  );
};

const TablePagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-b-lg w-full">
      <div className="flex items-center gap-2">
        <Button 
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Précédent
        </Button>
        <Button 
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Suivant
        </Button>
      </div>
      <div className="flex items-center gap-2">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  );
};

export default TableInvestments;
