import React, { useEffect, useState } from 'react';
import { Table, Skeleton, Select, Button, Space, Spin } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCompanyKpisByYear, getCompanyKpisYears } from '@/services/company/companyService';
import KpiComparisonModal from './KpiComparisonModal';
import '../../../../css/components/metrics.css';

const { Option } = Select;

const AllMetrics = () => {
  const { t } = useTranslation('metrics');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [comparisonModalVisible, setComparisonModalVisible] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    loadAvailableYears();
  }, [id]);

  useEffect(() => {
    if (selectedYear) {
      loadMetrics(selectedYear);
    }
  }, [selectedYear, id]);

  const loadAvailableYears = async () => {
    setYearsLoading(true);
    try {
      const years = await getCompanyKpisYears(id);
      setAvailableYears(years);
      
      // Sélectionner automatiquement l'année la plus récente
      if (years.length > 0) {
        setSelectedYear(years[0]); // Les années sont triées par ordre décroissant
      }
    } catch (error) {
      console.error('Erreur lors du chargement des années:', error);
      setAvailableYears([]);
    } finally {
      setYearsLoading(false);
    }
  };

  const loadMetrics = async (year) => {
    setLoading(true);
    try {
      const kpisData = await getCompanyKpisByYear(id, year);
      
      // Transformer les données pour le tableau
      const transformedData = kpisData.map((kpi, index) => {
        const rowData = {
          key: index + 1,
          metric: kpi.metric,
        };
        
        // Ajouter dynamiquement toutes les périodes disponibles
        Object.keys(kpi).forEach(key => {
          if (key !== 'metric' && key !== 'unit') {
            rowData[key] = kpi[key];
          }
        });
        
        return rowData;
      });
      
      setData(transformedData);
    } catch (error) {
      console.error('Erreur lors du chargement des KPI:', error);
      // En cas d'erreur, afficher un message
      setData([
        {
          key: '1',
          metric: 'Aucune donnée disponible',
          message: `Impossible de charger les KPI pour l'année ${year}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Navigation entre les années
  const goToPreviousYear = () => {
    const currentIndex = availableYears.indexOf(selectedYear);
    if (currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1]);
    }
  };

  const goToNextYear = () => {
    const currentIndex = availableYears.indexOf(selectedYear);
    if (currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1]);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Générer dynamiquement les colonnes basées sur les données
  const generateColumns = () => {
    if (data.length === 0) {
      // Colonnes par défaut si pas de données
      return [
        {
          title: 'Métrique',
          dataIndex: 'metric',
          key: 'metric',
          render: text =>
            loading ? <Skeleton.Input block active size="small" /> : text,
        }
      ];
    }

    const columns = [
      {
        title: 'Métrique',
        dataIndex: 'metric',
        key: 'metric',
        render: text =>
          loading ? <Skeleton.Input block active size="small" /> : text,
      }
    ];

    // Créer les colonnes pour toutes les périodes trouvées dans les données
    const allPeriods = new Set();
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'key' && key !== 'metric') {
          allPeriods.add(key);
        }
      });
    });

    // Trier les périodes (basique, peut être amélioré selon le format)
    const sortedPeriods = Array.from(allPeriods).sort();

    sortedPeriods.forEach(period => {
      columns.push({
        title: period,
        dataIndex: period,
        key: period,
        render: text =>
          loading ? <Skeleton.Input block active size="small" /> : (text || '-'),
      });
    });

    return columns;
  };

  if (yearsLoading) {
    return (
      <div className="metrics-loading-container">
        <Spin size="large" />
        <div className="metrics-loading-text">{t('common.loading_years')}</div>
      </div>
    );
  }

  if (availableYears.length === 0) {
    return (
      <div className="metrics-empty-container">
        <div>{t('no_kpi_data')}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Sélecteur d'année avec navigation */}
      <div className="metrics-header">
        <Space size="middle">
          <CalendarOutlined className="metrics-year-icon" />
          <span className="metrics-year-label">{t('year_label')} :</span>
          
          <Space.Compact>
            <Button 
              icon={<LeftOutlined />} 
              onClick={goToPreviousYear}
              disabled={availableYears.indexOf(selectedYear) >= availableYears.length - 1}
              title="Année précédente"
            />
            
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              className="metrics-year-selector"
              size="middle"
            >
              {availableYears.map(year => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
            
            <Button 
              icon={<RightOutlined />} 
              onClick={goToNextYear}
              disabled={availableYears.indexOf(selectedYear) <= 0}
              title="Année suivante"
            />
          </Space.Compact>
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            onClick={() => setComparisonModalVisible(true)}
            disabled={availableYears.length < 2}
            title={availableYears.length < 2 ? t('kpi_comparison.comparison_help') : ''}
          >
            {t('kpi_comparison.button_text')}
          </Button>
          
          <div className="metrics-info-text">
            {availableYears.length} année{availableYears.length > 1 ? 's' : ''} disponible{availableYears.length > 1 ? 's' : ''}
          </div>
        </Space>
      </div>

      {/* Tableau des métriques */}
      <Table
        columns={generateColumns()}
        dataSource={data}
        pagination={false}
        bordered
        loading={loading}
        size="middle"
      />

      {/* Modal de comparaison KPI */}
      <KpiComparisonModal
        visible={comparisonModalVisible}
        onClose={() => setComparisonModalVisible(false)}
      />
    </div>
  );
};

export default AllMetrics;
