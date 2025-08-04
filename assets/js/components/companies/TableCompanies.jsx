import React, { useEffect, useState } from 'react';
import { Skeleton, Table, Tag, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  getAllCompanies,
  getCompanyDetailsById,
} from '@/services/company/companyService';
import { formatDate, getDateLocale } from '@/lib/utils';
import CompanyDetails from '../investments/steps/CompanyDetails';

const TableCompanies = ({ i18n }) => {
  const { t } = useTranslation('allCompanies', { i18n });
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyDetailsLoading, setCompanyDetailsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);

    const fetchCompanies = async () => {
      try {
        const data = await getAllCompanies();
        setCompanies(data);
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des entreprises :',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();

    return () => clearTimeout(timer);
  }, []);

  const getSectorTypeColor = type => {
    switch (type) {
      case 'technology':
        return 'geekblue';
      case 'healthcare':
        return 'volcano';
      case 'finance':
        return 'gold';
      case 'retail':
        return 'magenta';
      case 'manufacturing':
        return 'purple';
      case 'energy':
        return 'lime';
      case 'education':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const handleCompanyClick = async company => {
    try {
      setCompanyDetailsLoading(true);
      setModalVisible(true);

      // Récupérer les détails complets de l'entreprise
      const companyDetails = await getCompanyDetailsById(company.id);
      setSelectedCompany(companyDetails);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      // En cas d'erreur, utiliser les données de base disponibles
      setSelectedCompany(company);
    } finally {
      setCompanyDetailsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCompany(null);
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
      title: t('company.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      render: (text, record) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <div className="flex items-center gap-4">
            <div
              onClick={() => handleCompanyClick(record)}
              className="flex items-center gap-4 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              <img
                src={
                  record.logo && record.logo.trim() !== ''
                    ? record.logo
                    : 'https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png'
                }
                alt={record.name ?? 'company-default-logo'}
                className="w-10 h-10 rounded-full"
              />
              <span className="font-degarism">{text}</span>
            </div>
          </div>
        ),
    },
    {
      title: t('company.businessStructures'),
      dataIndex: 'businessStructures',
      key: 'businessStructures',
      sorter: (a, b) =>
        a.businessStructures.localeCompare(b.businessStructures),
      sortDirections: ['ascend', 'descend'],
      render: businessStructures =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : businessStructures ? (
          <span className="font-degarism">{businessStructures}</span>
        ) : (
          '-'
        ),
    },
    {
      title: t('company.sector'),
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
      title: t('company.created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      sortDirections: ['ascend', 'descend'],
      render: date =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <span className="font-degarism">
            {formatDate(date, getDateLocale(i18n.language))}
          </span>
        ),
    },
  ];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-300 dark:border-gray-600 flex flex-col w-full">
        <div className="overflow-x-auto">
          <Table
            rowKey={(record, index) => index}
            columns={columns}
            dataSource={loading ? Array(5).fill({}) : companies}
            pagination={{
              current: pagination.current,
              total: pagination.total,
              pageSize: pagination.pageSize,
              onChange: page => setPagination({ ...pagination, current: page }),
            }}
            sortDirections={['ascend', 'descend']}
            rowClassName={(record, index) =>
              index % 2 === 0
                ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700'
                : 'bg-slate-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600'
            }
          />
        </div>
      </div>

      <Modal
        title={selectedCompany?.name || t('company.details')}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width="90vw"
        style={{ maxWidth: '1200px', minWidth: '800px' }}
        className="company-details-modal"
      >
        {selectedCompany && (
          <CompanyDetails
            company={selectedCompany}
            loading={companyDetailsLoading}
          />
        )}
      </Modal>
    </>
  );
};

export default TableCompanies;
