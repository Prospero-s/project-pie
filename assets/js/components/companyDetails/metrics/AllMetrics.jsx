import React, { useEffect, useState } from 'react';
import { Table, Skeleton } from 'antd';

const AllMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    // Simuler un chargement de données
    setLoading(true);
    setTimeout(() => {
      setData([
        {
          key: '1',
          metric: 'ARR',
          Q4_FY2022: '2 000 000,00 €',
          Q1_FY2023: '3 000 000,00 €',
          Q2_FY2023: '4 000 000,00 €',
          Q3_FY2023: '4 400 000,00 €',
          Q4_FY2023: '5 000 000,00 €',
          Q1_FY2024: '4 500 000,00 €',
          Q2_FY2024: '7 000 000,00 €',
        },
        {
          key: '2',
          metric: 'ARR par Compte',
          Q4_FY2022: '105 000,00 €',
          Q1_FY2023: '110 000,00 €',
          Q2_FY2023: '115 000,00 €',
          Q3_FY2023: '115 000,00 €',
          Q4_FY2023: '115 000,00 €',
          Q1_FY2024: '115 000,00 €',
          Q2_FY2024: '115 000,00 €',
        },
        {
          key: '3',
          metric: 'Revenu Moyen par Effectif',
          Q4_FY2022: '50 000,00 €',
          Q1_FY2023: '60 000,00 €',
          Q2_FY2023: '70 000,00 €',
          Q3_FY2023: '80 000,00 €',
          Q4_FY2023: '230 000,00 €',
          Q1_FY2024: '230 000,00 €',
          Q2_FY2024: '230 000,00 €',
        },
        // Ajoutez d'autres lignes de données ici...
      ]);
      setLoading(false);
    }, 2000); // Simuler un délai de chargement
  };

  const columns = [
    {
      title: 'Métrique',
      dataIndex: 'metric',
      key: 'metric',
      render: (text) => (loading ? <Skeleton.Input block active size="small" /> : text),
    },
    {
      title: '(A) T4 FY2022',
      dataIndex: 'Q4_FY2022',
      key: 'Q4_FY2022',
      render: (text) => (loading ? <Skeleton.Input block active size="small" /> : text),
    },
    {
      title: '(A) T1 FY2023',
      dataIndex: 'Q1_FY2023',
      key: 'Q1_FY2023',
      render: (text) => (loading ? <Skeleton.Input block active size="small" /> : text),
    },
    {
      title: '(A) T2 FY2023',
      dataIndex: 'Q2_FY2023',
      key: 'Q2_FY2023',
      render: (text) => (loading ? <Skeleton.Input block active size="small" /> : text),
    },
    {
      title: '(A) T3 FY2023',
      dataIndex: 'Q3_FY2023',
      key: 'Q3_FY2023',
      render: (text) => (loading ? <Skeleton.Input block active size="small" /> : text),
    },
    {
      title: '(A) T4 FY2023',
      dataIndex: 'Q4_FY2023',
      key: 'Q4_FY2023',
      render: (text) => (loading ? <Skeleton.Input block active size="small" /> : text),
    },
    {
      title: '(A) T1 FY2024',
      dataIndex: 'Q1_FY2024',
      key: 'Q1_FY2024',
      render: (text) => (loading ? <Skeleton.Input block active size="small" /> : text),
    },
    {
      title: '(A) T2 FY2024',
      dataIndex: 'Q2_FY2024',
      key: 'Q2_FY2024',
      render: (text) => (loading ? <Skeleton.Input block active size="small" /> : text),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        loading={loading}
      />
    </div>
  );
};

export default AllMetrics;