import React, { useEffect, useState } from 'react';
import { Button, Skeleton, Table, Tooltip, Select, message } from 'antd';
import { DeleteOutlined, EyeOutlined, FileAddOutlined, InboxOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchInvestments } from '@/services/investment/investmentService';
import AddCompanyModal from './AddCompanyModal';

const TableInvestments = ({ i18n, isModalOpen, setIsModalOpen }) => {
  const { t } = useTranslation('investments', { i18n });
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [sortedInfo, setSortedInfo] = useState({});
  const [activeFilters, setActiveFilters] = useState({
    sector: [],
    fundingType: []
  });

  useEffect(() => {
    loadInvestments({
      page: 1,
      limit: 10,
      sortField: 'updatedAt',
      sortOrder: 'desc'
    });
  }, []);

  const loadInvestments = async (params = {}) => {
    try {
      setLoading(true);
      const response = await fetchInvestments(params);
      setInvestments(response.data);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total
      });
      if (params.sortField) {
        setSortedInfo({
          columnKey: params.sortField.includes('.') ? params.sortField.split('.')[1] : params.sortField,
          order: params.sortOrder === 'asc' ? 'ascend' : 'descend'
        });
      }
    } catch (error) {
      message.error(t('common.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
    };

    if (filters.sector?.length > 0) {
      params.sector = filters.sector;
    }
    if (filters.fundingType?.length > 0) {
      params.fundingType = filters.fundingType;
    }

    if (sorter.field) {
      if (Array.isArray(sorter.field) && sorter.field[0] === 'investment' && sorter.field[1] === 'totalAmount') {
        params.sortField = 'amount';
      } else {
        params.sortField = Array.isArray(sorter.field) ? sorter.field.join('.') : sorter.field;
      }
      params.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    setActiveFilters({
      sector: filters.sector || [],
      fundingType: filters.fundingType || []
    });

    setSortedInfo({
      columnKey: Array.isArray(sorter.field) ? sorter.field[1] : sorter.field,
      order: sorter.order
    });

    loadInvestments(params);
  };

  const handleReset = () => {
    setActiveFilters({
      sector: [],
      fundingType: []
    });
    setSortedInfo({
      columnKey: null,
      order: null
    });
    setPagination({
      ...pagination,
      current: 1
    });
    
    // Recharger les données avec les paramètres par défaut
    loadInvestments({
      page: 1,
      limit: pagination.pageSize,
      sortField: 'updatedAt',
      sortOrder: 'desc'
    });
  };

  const columns = [
    {
      title: t('company_details.company.name'),
      dataIndex: 'denomination',
      key: 'denomination',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'denomination' ? sortedInfo.order : null,
      render: (text, record) => (
        loading ? <Skeleton.Input block active size="small" /> :
        <Link to={`/investements/${record.id}`}>
          <div className="flex items-center gap-4">
            <img
              src={record?.company?.logo ?? "https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png"}
              alt={record?.company?.name ?? "company-default-logo"}
              className="w-10 h-10 rounded-full"
            />
            <span>{text || '-'}</span>
          </div>
        </Link>
      )
    },
    {
      title: t('company_details.company.sector'),
      dataIndex: 'sector',
      key: 'sector',
      filters: [
        { text: t('company_details.sectors.technology'), value: 'technology' },
        { text: t('company_details.sectors.healthcare'), value: 'healthcare' },
        { text: t('company_details.sectors.finance'), value: 'finance' },
        { text: t('company_details.sectors.retail'), value: 'retail' },
        { text: t('company_details.sectors.manufacturing'), value: 'manufacturing' },
        { text: t('company_details.sectors.energy'), value: 'energy' },
        { text: t('company_details.sectors.education'), value: 'education' },
      ],
      filteredValue: activeFilters.sector,
      render: (sector) => loading ? 
        <Skeleton.Input block active size="small" /> :
        (sector ? t(`company_details.sectors.${sector}`) : '-')
    },
    {
      title: t('funding.amount'),
      dataIndex: ['investment', 'totalAmount'],
      key: 'amount',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'amount' ? sortedInfo.order : null,
      render: (_, record) => loading ? 
        <Skeleton.Input block active size="small" /> :
        (record.investment?.totalAmount ? `${Number(record.investment.totalAmount).toLocaleString()} €` : '-')
    },
    {
      title: t('funding.type'),
      dataIndex: ['investment', 'lastFundingType'],
      key: 'fundingType',
      filters: [
        { text: t('funding.types.seed'), value: 'seed' },
        { text: t('funding.types.serieA'), value: 'serieA' },
        { text: t('funding.types.serieB'), value: 'serieB' },
        { text: t('funding.types.serieC'), value: 'serieC' },
        { text: t('funding.types.growth'), value: 'growth' },
        { text: t('funding.types.ipo'), value: 'ipo' },
      ],
      filteredValue: activeFilters.fundingType,
      render: (_, record) => loading ? (
        <Skeleton.Input block active size="small" />
      ) : (
        record.investment?.lastFundingType ? t(`funding.types.${record.investment.lastFundingType}`) : '-'
      ),
    },
    {
      title: t('company_details.company.details.last_update'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'updatedAt' ? sortedInfo.order : null,
      render: (date) => loading ? (
        <Skeleton.Input block active size="small" />
      ) : (
        date ? new Date(date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : '-'
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

  const handleAdd = async (newInvestment) => {
    // Fermer la modal
    setIsModalOpen(false);
    
    // Recharger les données avec les paramètres actuels
    await loadInvestments({
      page: pagination.current,
      limit: pagination.pageSize,
      sortField: sortedInfo.columnKey || 'updatedAt',
      sortOrder: sortedInfo.order ? (sortedInfo.order === 'ascend' ? 'asc' : 'desc') : 'desc',
      ...activeFilters
    });
  };

  return (
    <>
      <AddCompanyModal 
        visible={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onAdd={handleAdd}
        t={t}
      />
      <div className="rounded-lg border border-slate-200 flex flex-col w-full">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        ) : investments.length === 0 && !Object.values(activeFilters).some(filter => filter.length > 0) ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-gray-50 rounded-full p-4 mb-4">
              <InboxOutlined className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('no_investments.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('no_investments.description')}
            </p>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              {t('common.add')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              size="middle"
              dataSource={investments}
              loading={loading}
              onChange={handleTableChange}
              pagination={pagination}
              sortDirections={['ascend', 'descend']}
              rowClassName={(record, index) =>
                index % 2 === 0 ? '!bg-white hover:!bg-blue-50' : '!bg-slate-50 hover:!bg-blue-50'
              }
              locale={{
                emptyText: (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-gray-50 rounded-full p-4 mb-4">
                      <InboxOutlined className="text-4xl text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('no_results.title')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('no_results.description')}
                    </p>
                    <Button onClick={handleReset} type="primary">
                      {t('common.reset_filters')}
                    </Button>
                  </div>
                )
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TableInvestments;
