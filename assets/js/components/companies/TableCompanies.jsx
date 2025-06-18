import React, { useEffect, useState } from 'react';
import { Skeleton, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllCompanies } from '@/services/company/companyService';
import { formatDate, getDateLocale } from '@/lib/utils';

const TableCompanies = ({ i18n }) => {
  const { t } = useTranslation('allCompanies', { i18n });
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems] = useState(0);
  const [pageSize] = useState(10);

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

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      sorter: (a, b) => a.index.localeCompare(b.index),
      sortDirections: ['ascend', 'descend'],
      render: index =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <div className="flex items-center gap-4">
            <span>{index}</span>
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
            <Link
              to={`/company/details/${record.id}`}
              className="flex items-center gap-4"
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
              <span>{text}</span>
            </Link>
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
          businessStructures
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
          <Tag color={getSectorTypeColor(sector)}>
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
          formatDate(date, getDateLocale(i18n.language))
        ),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-300 flex flex-col w-full">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={loading ? Array(5).fill({}) : companies}
            pagination={{
              current: currentPage,
              total: totalItems,
              pageSize: pageSize,
              onChange: page => setCurrentPage(page), // Met à jour la page courante
            }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? '!bg-white' : '!bg-slate-50'
            }
            size="middle"
          />
        </div>
      </div>
    </>
  );
};

export default TableCompanies;
