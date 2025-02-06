import React, { useEffect, useState } from 'react';
import { Button, Skeleton, Table } from 'antd';
import { DeleteOutlined, FileAddOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllCompanies } from '@/services/company/companyService';

const TableCompanies = ({ i18n }) => {
  const { t } = useTranslation('allCompanies', { i18n });
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [uniqueSectors, setUniqueSectors] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);

    const fetchCompanies = async () => {
      try {
        const data = await getAllCompanies();
        setCompanies(data);
        // Extraire les secteurs uniques des données
        const sectors = [...new Set(data.map(company => company.sector))].filter(Boolean).sort();
        setUniqueSectors(sectors);
      } catch (error) {
        console.error('Erreur lors de la récupération des entreprises :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();

    return () => clearTimeout(timer);
  }, []);

  const columns = [
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
            <Link to={`/company/details/${record.id}`} className="flex items-center gap-4">
              <img
                src={record.logo ?? "https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png"}
                alt={record.name ?? "company-default-logo"}
                className="w-10 h-10 rounded-full"
              />
              <span>{text}</span>
            </Link>
          </div>
        ),
    },
    {
      title: t('company.sector'),
      dataIndex: 'sector',
      key: 'sector',
      filters: uniqueSectors.map(sector => ({ 
        text: t(`company_details.sectors.${sector}`), 
        value: sector 
      })),
      onFilter: (value, record) => record.sector === value,
      filterMode: 'menu',
      filterSearch: true,
      sorter: (a, b) => a.sector.localeCompare(b.sector),
      sortDirections: ['ascend', 'descend'],
      render: (sector) =>
        loading ? <Skeleton.Input block active size="small" /> : 
        (sector ? t(`company_details.sectors.${sector}`) : '-'),
    },
    {
      title: t('company.created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      sortDirections: ['ascend', 'descend'],
      render: (date) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          new Date(date).toLocaleDateString()
        ),
    }
  ];

  const handleDelete = (id) => {
    console.log('Suppression de la startup avec l\'ID:', id);
  };

  const handleAdd = async () => {
    setIsModalOpen(true);
  };

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
              onChange: (page) => setCurrentPage(page), // Met à jour la page courante
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
