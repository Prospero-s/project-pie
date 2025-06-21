import React, { useEffect, useState } from 'react';
import { Skeleton, Table, message, Tag, Spin, Tooltip } from 'antd';
import { FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  fetchInvestments,
  deleteInvestment,
} from '@/services/investment/investmentService';
import AddCompanyModal from '@/components/investments/AddCompanyModal';
import EmptyInvestmentState from '@/components/investments/table/EmptyInvestmentState';
import NoResultsState from '@/components/investments/table/NoResultsState';
import UploadPopup from '@/components/common/upload/UploadPopup';
import { formatDate, getDateLocale } from '@/lib/utils';
import { fundingTypeTranslation } from '@/services/graphe/grapheService';
import { getFundingTypeColor, getSectorTypeColor } from '@/lib/colors';

const TableInvestments = ({
  i18n,
  isModalOpen,
  setIsModalOpen,
  onAddClick,
  onEmptyStateChange,
}) => {
  const { t } = useTranslation('investments', { i18n });
  const lng = i18n.language;
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortedInfo, setSortedInfo] = useState({});
  const [activeFilters, setActiveFilters] = useState({
    sector: [],
    fundingType: [],
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const handleOpenPopup = company => {
    setSelectedCompany(company);
    setPopupVisible(true);
  };
  const handleClosePopup = () => setPopupVisible(false);

  useEffect(() => {
    loadInvestments({
      page: 1,
      limit: 10,
      sortField: 'updatedAt',
      sortOrder: 'desc',
    });
  }, []);

  useEffect(() => {
    const isEmpty =
      investments.length === 0 &&
      !Object.values(activeFilters).some(filter => filter.length > 0);

    if (typeof onEmptyStateChange === 'function') {
      onEmptyStateChange(isEmpty);
    }
  }, [investments, activeFilters, onEmptyStateChange]);

  const loadInvestments = async (params = {}) => {
    try {
      setLoading(true);
      const response = await fetchInvestments(params);

      if (!response.data || !Array.isArray(response.data)) {
        console.error('Format de données invalide:', response);
        message.error(t('common.error_invalid_data'));
        return;
      }

      setInvestments(response.data);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });

      if (params.sortField) {
        setSortedInfo({
          columnKey: params.sortField.includes('.')
            ? params.sortField.split('.')[1]
            : params.sortField,
          order: params.sortOrder === 'asc' ? 'ascend' : 'descend',
        });
      }
    } catch (error) {
      console.error('Erreur de chargement:', error);
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
      if (
        Array.isArray(sorter.field) &&
        sorter.field[0] === 'investment' &&
        sorter.field[1] === 'totalAmount'
      ) {
        params.sortField = 'amount';
      } else {
        params.sortField = Array.isArray(sorter.field)
          ? sorter.field.join('.')
          : sorter.field;
      }
      params.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    setActiveFilters({
      sector: filters.sector || [],
      fundingType: filters.fundingType || [],
    });

    setSortedInfo({
      columnKey: Array.isArray(sorter.field) ? sorter.field[1] : sorter.field,
      order: sorter.order,
    });

    loadInvestments(params);
  };

  const handleReset = () => {
    setActiveFilters({
      sector: [],
      fundingType: [],
    });
    setSortedInfo({
      columnKey: null,
      order: null,
    });
    setPagination({
      ...pagination,
      current: 1,
    });

    // Recharger les données avec les paramètres par défaut
    loadInvestments({
      page: 1,
      limit: pagination.pageSize,
      sortField: 'updatedAt',
      sortOrder: 'desc',
    });
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      render: (_, record, index) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <div className="flex items-center gap-4">
            <span>
              {(pagination.current - 1) * pagination.pageSize + index + 1}
            </span>
          </div>
        ),
    },
    {
      title: t('company_details.company.name'),
      dataIndex: 'denomination',
      key: 'denomination',
      sorter: true,
      sortOrder:
        sortedInfo.columnKey === 'denomination' ? sortedInfo.order : null,
      render: (text, record) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <Link
            to={`/${lng}/company/details/${record.id}`}
            className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  record?.company?.logo && record.company.logo.trim() !== ''
                    ? record.company.logo
                    : 'https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png'
                }
                alt={record?.company?.name ?? 'company-default-logo'}
                className="w-10 h-10 rounded-full"
              />
              <span className="font-degarism">{text}</span>
            </div>
          </Link>
        ),
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
        {
          text: t('company_details.sectors.manufacturing'),
          value: 'manufacturing',
        },
        { text: t('company_details.sectors.energy'), value: 'energy' },
        { text: t('company_details.sectors.education'), value: 'education' },
      ],
      filteredValue: activeFilters.sector,
      render: sector =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : sector ? (
          <Tag className="font-degarism" color={getSectorTypeColor(sector)}>
            {t(`company_details.sectors.${sector}`)}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: t('funding.amount'),
      dataIndex: ['investment', 'totalAmount'],
      key: 'amount',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'amount' ? sortedInfo.order : null,
      render: (_, record) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : record.investment?.totalAmount ? (
          <span className="font-degarism">
            {Number(record.investment.totalAmount).toLocaleString()} €
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: t('funding.type'),
      dataIndex: ['investment', 'fundingTypes'],
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
      render: (_, record) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <div className="flex flex-wrap gap-1">
            {record.investment?.fundingTypes?.map((type, index) => (
              <Tag
                className="font-degarism"
                key={index}
                color={getFundingTypeColor(type)}
              >
                {fundingTypeTranslation(t, type)}
              </Tag>
            ))}
          </div>
        ),
    },
    {
      title: t('company_details.company.details.last_update'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'updatedAt' ? sortedInfo.order : null,
      render: date =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : date ? (
          <span className="font-degarism">
            {formatDate(date, getDateLocale(lng))}
          </span>
        ) : (
          '-'
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
          <div className="flex gap-2">
            <Tooltip title="Upload un fichier">
              <FileAddOutlined
                className="!text-blue-500 dark:!text-blue-400 hover:!text-blue-700 dark:hover:!text-blue-300 text-lg cursor-pointer"
                onClick={() => handleOpenPopup(record)}
              />
            </Tooltip>
            <Tooltip title="Supprimer">
              <DeleteOutlined
                className="!text-rose-500 dark:!text-rose-400 hover:!text-rose-700 dark:hover:!text-rose-300 text-lg cursor-pointer"
                onClick={() => handleDelete(record.investment.id)}
              />
            </Tooltip>
          </div>
        ),
    },
  ];

  const handleDelete = async id => {
    try {
      await deleteInvestment(id);
      message.success(t('common.delete_success'));
      await loadInvestments({
        page: pagination.current,
        limit: pagination.pageSize,
        sortField: sortedInfo.columnKey || 'updatedAt',
        sortOrder: sortedInfo.order
          ? sortedInfo.order === 'ascend'
            ? 'asc'
            : 'desc'
          : 'desc',
        ...activeFilters,
      });
    } catch (error) {
      message.error(t('common.delete_error'));
      console.error(error);
    }
  };

  const handleAdd = async () => {
    setIsModalOpen(false);
    await loadInvestments({
      page: pagination.current,
      limit: pagination.pageSize,
      sortField: sortedInfo.columnKey || 'updatedAt',
      sortOrder: sortedInfo.order
        ? sortedInfo.order === 'ascend'
          ? 'asc'
          : 'desc'
        : 'desc',
      ...activeFilters,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-slate-300 dark:border-gray-600">
        <Spin />
      </div>
    );
  }

  return (
    <>
      <AddCompanyModal
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onAdd={handleAdd}
        t={t}
      />
      {isPopupVisible && (
        <UploadPopup
          visible={isPopupVisible}
          onClose={handleClosePopup}
          company={selectedCompany}
          i18n={i18n}
          lng={lng}
        />
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-300 dark:border-gray-600 flex flex-col w-full">
        {investments.length === 0 &&
        !Object.values(activeFilters).some(filter => filter.length > 0) ? (
          <EmptyInvestmentState
            t={t}
            onAddClick={onAddClick || (() => setIsModalOpen(true))}
          />
        ) : (
          <Table
            rowKey={(record, index) => index}
            columns={columns}
            dataSource={investments}
            onChange={handleTableChange}
            pagination={pagination}
            sortDirections={['ascend', 'descend']}
            scroll={{ x: 'max-content' }}
            rowClassName={(record, index) =>
              index % 2 === 0
                ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700'
                : 'bg-slate-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600'
            }
            locale={{
              filterConfirm: t('common.confirm'),
              filterReset: t('common.reset'),
              emptyText: <NoResultsState t={t} onReset={handleReset} />,
            }}
          />
        )}
      </div>
    </>
  );
};

export default TableInvestments;
