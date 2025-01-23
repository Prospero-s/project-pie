import React, { useEffect, useState } from 'react';
import { Button, Skeleton, Table, Tooltip, Select } from 'antd';
import { DeleteOutlined, EyeOutlined, FileAddOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import startupsMock from '@/mocks/investements/startupsMock';
import AddCompanyModal from './AddCompanyModal';

const TableInvestments = ({ i18n, isModalOpen, setIsModalOpen }) => {
  const { t } = useTranslation('investments', { i18n });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const fundingTypes = [
    'Seed',
    'Série A',
    'Série B',
    'Série C',
    'Série D',
    'IPO'
  ];

  const columns = [
    {
      title: t('company_details.company.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      render: (text, record) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <div className="flex items-center gap-4">
            <Link to={`/investements/${record.id}`} className="flex items-center gap-4">
              <img
                src={record.logo}
                alt={record.name}
                className="w-10 h-10 rounded-full"
              />
              <span>{text}</span>
            </Link>
          </div>
        ),
    },
    {
      title: t('company_details.company.sector'),
      dataIndex: 'sector',
      key: 'sector',
      sorter: (a, b) => a.sector.localeCompare(b.sector),
      sortDirections: ['ascend', 'descend'],
      render: (text) =>
        loading ? <Skeleton.Input block active size="small" /> : text,
    },
    {
      title: t('funding.amount'),
      dataIndex: 'amountRaised',
      key: 'amountRaised',
      sorter: (a, b) => a.amountRaised - b.amountRaised,
      sortDirections: ['ascend', 'descend'],
      render: (amount) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          `${amount.toLocaleString()} €`
        ),
    },
    {
      title: t('funding.type'),
      dataIndex: 'fundingType',
      key: 'fundingType',
      filters: fundingTypes.map(type => ({ text: type, value: type })),
      onFilter: (value, record) => {
        const normalizeStr = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        return normalizeStr(record.fundingType) === normalizeStr(value);
      },
      filterMode: 'menu',
      filterSearch: true,
      render: (text) =>
        loading ? <Skeleton.Input block active size="small" /> : text,
    },
    {
      title: t('company_details.company.details.last_update'),
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      sorter: (a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate),
      sortDirections: ['ascend', 'descend'],
      render: (date) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          new Date(date).toLocaleDateString()
        ),
    },
    {
      title: t('actions.title'),
      key: 'actions',
      width: 100,
      render: (text, record) =>
        loading ? (
          <Skeleton.Button active size="small" />
        ) : (
          <div className="flex items-center gap-4">
            <FileAddOutlined
              className="!text-blue-500 hover:!text-blue-700 text-lg cursor-pointer"
              onClick={() => handleAdd(record.id)}
            />
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

  const handleAdd = async () => {
    setIsModalOpen(true);
  };

  const dataSource = startupsMock.map((startup, index) => ({
    key: index,
    ...startup,
  }));

  return (
    <>
      <AddCompanyModal 
        visible={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onAdd={handleAdd}
        t={t}
      />
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
        <TablePagination t={t} />
      </div>
    </>
  );
};

const TablePagination = ({ t }) => {
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
          {t('common.previous')}
        </Button>
        <Button 
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          {t('common.next')}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {t('common.page')} {currentPage} {t('common.of')} {totalPages}
      </div>
    </div>
  );  
};

export default TableInvestments;
