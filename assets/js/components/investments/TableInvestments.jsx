import React, { useEffect, useState } from 'react';
import { Skeleton, Table, message, Tag, Spin, Tooltip } from 'antd';
import { FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchInvestments } from '@/services/investment/investmentService';
import AddCompanyModal from '@/components/investments/AddCompanyModal';
import EmptyInvestmentState from '@/components/investments/table/EmptyInvestmentState';
import NoResultsState from '@/components/investments/table/NoResultsState';
import UploadPopup from '@/components/common/upload/UploadPopup';

const TableInvestments = ({
  i18n,
  isModalOpen,
  setIsModalOpen,
  onAddClick,
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

  const getFundingTypeColor = type => {
    switch (type) {
      case 'seed':
        return 'green';
      case 'serieA':
        return 'blue';
      case 'serieB':
        return 'purple';
      case 'serieC':
        return 'magenta';
      case 'growth':
        return 'cyan';
      case 'ipo':
        return 'gold';
      case 'debt':
        return 'orange';
      case 'grant':
        return 'lime';
      default:
        return 'default';
    }
  };

  const columns = [
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
          <Link to={`/${lng}/company/details/${record.id}`}>
            <div className="flex items-center gap-4">
              <img
                src={
                  record?.company?.logo ??
                  'https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png'
                }
                alt={record?.company?.name ?? 'company-default-logo'}
                className="w-10 h-10 rounded-full"
              />
              <span>{text || '-'}</span>
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
          t(`company_details.sectors.${sector}`)
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
          `${Number(record.investment.totalAmount).toLocaleString()} €`
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
              <Tag key={index} color={getFundingTypeColor(type)}>
                {t(`funding.types.${type}`)}
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
          new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
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
                className="!text-blue-500 hover:!text-blue-700 text-lg cursor-pointer"
                onClick={() => handleOpenPopup(record)}
              />
            </Tooltip>
            <Tooltip title="Supprimer">
              <DeleteOutlined
                className="!text-rose-500 hover:!text-rose-700 text-lg cursor-pointer"
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
          </div>
        ),
    },
  ];

  const handleDelete = id => {
    console.error("Suppression de la startup avec l'ID:", id);
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
      <div className="flex items-center justify-center p-8">
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
      <div className="bg-white rounded-lg border border-slate-300 flex flex-col w-full">
        {investments.length === 0 &&
        !Object.values(activeFilters).some(filter => filter.length > 0) ? (
          <EmptyInvestmentState
            t={t}
            onAddClick={onAddClick || (() => setIsModalOpen(true))}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={investments}
              onChange={handleTableChange}
              pagination={pagination}
              sortDirections={['ascend', 'descend']}
              rowClassName={(record, index) =>
                index % 2 === 0
                  ? '!bg-white hover:!bg-blue-50'
                  : '!bg-slate-50 hover:!bg-blue-50'
              }
              locale={{
                filterConfirm: t('common.confirm'),
                filterReset: t('common.reset'),
                emptyText: <NoResultsState t={t} onReset={handleReset} />,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TableInvestments;
