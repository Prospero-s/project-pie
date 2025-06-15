import React, { useState, useEffect } from 'react';
import { Modal, Select, Table, Spin, Alert, Card, Statistic, Row, Col, Tag, Button, Space, Tooltip } from 'antd';
import { RiseOutlined, FallOutlined, MinusOutlined, InfoCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getCompanyKpisByYear, getCompanyKpisYears } from '@/services/company/companyService';
import '@/css/components/metrics.css';

const { Option } = Select;

const KpiComparisonModal = ({ visible, onClose }) => {
  const { t } = useTranslation('metrics');
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'chart'

  useEffect(() => {
    if (visible) {
      loadAvailableYears();
    }
  }, [visible, id]);

  useEffect(() => {
    if (selectedYears.length >= 2) {
      loadComparisonData();
    }
  }, [selectedYears]);

  const loadAvailableYears = async () => {
    try {
      const years = await getCompanyKpisYears(id);
      setAvailableYears(years);
      
      // Sélectionner automatiquement les 2 années les plus récentes
      if (years.length >= 2) {
        setSelectedYears([years[0], years[1]]);
      } else if (years.length === 1) {
        setSelectedYears([years[0]]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des années:', error);
    }
  };

  const loadComparisonData = async () => {
    if (selectedYears.length < 2) return;

    setLoading(true);
    try {
      // Charger les données pour chaque année sélectionnée
      const yearDataPromises = selectedYears.map(year => 
        getCompanyKpisByYear(id, year).then(data => ({ year, data }))
      );
      
      const yearDataResults = await Promise.all(yearDataPromises);
      
      // Organiser les données par métrique
      const metricsMap = new Map();
      
      yearDataResults.forEach(({ year, data }) => {
        data.forEach(item => {
          const metricKey = item.metric;
          if (!metricsMap.has(metricKey)) {
            metricsMap.set(metricKey, {
              metric: metricKey,
              unit: item.unit || '',
              values: {}
            });
          }
          
          // Extraire la valeur numérique des colonnes Q1, Q2, Q3, Q4
          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
          let totalValue = 0;
          let quarterCount = 0;
          
          quarters.forEach(quarter => {
            if (item[quarter] && item[quarter] !== null) {
              // Extraire le nombre de la chaîne (ex: "7 531 666.67 €" -> 7531666.67)
              const numericValue = parseFloat(item[quarter].toString().replace(/[^\d.-]/g, ''));
              if (!isNaN(numericValue)) {
                totalValue += numericValue;
                quarterCount++;
              }
            }
          });
          
          // Calculer la moyenne si on a des données
          const averageValue = quarterCount > 0 ? totalValue / quarterCount : 0;
          metricsMap.get(metricKey).values[year] = averageValue;
        });
      });
      
      // Convertir en tableau et calculer les évolutions
      const comparisonArray = Array.from(metricsMap.values()).map(metric => {
        const sortedYears = selectedYears.sort((a, b) => a - b);
        const oldestYear = sortedYears[0];
        const newestYear = sortedYears[sortedYears.length - 1];
        
        const oldValue = metric.values[oldestYear] || 0;
        const newValue = metric.values[newestYear] || 0;
        
        // Calculer l'évolution
        let evolution = 0;
        let evolutionPercent = 0;
        let trend = 'stable';
        
        if (oldValue !== 0) {
          evolution = newValue - oldValue;
          evolutionPercent = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
          
          if (evolutionPercent > 5) {
            trend = 'up';
          } else if (evolutionPercent < -5) {
            trend = 'down';
          }
        } else if (newValue !== 0) {
          trend = 'up';
          evolutionPercent = 100;
        }
        
        return {
          ...metric,
          oldValue,
          newValue,
          evolution,
          evolutionPercent,
          trend,
          oldestYear,
          newestYear
        };
      });
      
      setComparisonData(comparisonArray);
      
      // Préparer les données pour le graphique
      const chartDataArray = comparisonArray.map(metric => {
        const chartItem = { metric: metric.metric };
        selectedYears.forEach(year => {
          chartItem[`year_${year}`] = metric.values[year] || 0;
        });
        return chartItem;
      });
      
      setChartData(chartDataArray);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données de comparaison:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value, unit) => {
    if (value === 0) return '0';
    
    // Formatage selon l'unité
    if (unit === '€') {
      if (Math.abs(value) >= 1000000) {
        return `${(value / 1000000).toFixed(2)} M€`;
      } else if (Math.abs(value) >= 1000) {
        return `${(value / 1000).toFixed(0)} K€`;
      } else {
        return `${value.toFixed(2)} €`;
      }
    } else if (unit === '%') {
      return `${value.toFixed(2)}%`;
    } else if (unit === 'personnes') {
      return `${Math.round(value)} ${unit}`;
    } else {
      return `${value.toFixed(2)} ${unit}`.trim();
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <RiseOutlined className="kpi-trend-up" />;
      case 'down':
        return <FallOutlined className="kpi-trend-down" />;
      default:
        return <MinusOutlined className="kpi-trend-stable" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return '#52c41a';
      case 'down':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  const renderMetricName = (metricName) => {
    // Cette fonction rend le nom de la métrique qui est une valeur dynamique
    return React.createElement('strong', {}, metricName);
  };

  const columns = [
    {
      title: t('kpi_comparison.metric_column'),
      dataIndex: 'metric',
      key: 'metric',
      width: 200,
      fixed: 'left',
      render: renderMetricName
    },
    {
      title: `${comparisonData[0]?.oldestYear || ''}`,
      key: 'oldValue',
      width: 150,
      render: (_, record) => formatValue(record.oldValue, record.unit)
    },
    {
      title: `${comparisonData[0]?.newestYear || ''}`,
      key: 'newValue',
      width: 150,
      render: (_, record) => formatValue(record.newValue, record.unit)
    },
    {
      title: t('kpi_comparison.evolution'),
      key: 'evolution',
      width: 120,
      render: (_, record) => (
        <Space>
          {getTrendIcon(record.trend)}
          <span className={`kpi-trend-${record.trend}`}>
            {record.evolution > 0 ? '+' : ''}{formatValue(record.evolution, record.unit)}
          </span>
        </Space>
      )
    },
    {
      title: t('kpi_comparison.variation_percent'),
      key: 'evolutionPercent',
      width: 120,
      render: (_, record) => (
        <Tag color={record.trend === 'up' ? 'green' : record.trend === 'down' ? 'red' : 'default'}>
          {record.evolutionPercent > 0 ? '+' : ''}{record.evolutionPercent.toFixed(1)}%
        </Tag>
      )
    },
    {
      title: t('kpi_comparison.trend'),
      key: 'trend',
      width: 100,
      render: (_, record) => {
        const trendText = record.trend === 'up' ? t('kpi_comparison.trend_up') : record.trend === 'down' ? t('kpi_comparison.trend_down') : t('kpi_comparison.trend_stable');
        return (
          <Tag color={record.trend === 'up' ? 'green' : record.trend === 'down' ? 'red' : 'default'}>
            {trendText}
          </Tag>
        );
      }
    }
  ];

  const renderChart = () => {
    if (chartData.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="metric" 
            angle={-45} 
            textAnchor="end" 
            height={100}
            interval={0}
          />
          <YAxis />
          <RechartsTooltip 
            formatter={(value, name) => [
              formatValue(value, ''), 
              name.replace('year_', t('kpi_comparison.year_prefix') + ' ')
            ]}
          />
          <Legend />
          {selectedYears.map((year, index) => (
            <Bar 
              key={year}
              dataKey={`year_${year}`}
              name={`${t('kpi_comparison.year_prefix')} ${year}`}
              fill={index === 0 ? '#8884d8' : '#82ca9d'}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderSummaryCards = () => {
    if (comparisonData.length === 0) return null;

    const upTrends = comparisonData.filter(item => item.trend === 'up').length;
    const downTrends = comparisonData.filter(item => item.trend === 'down').length;
    const stableTrends = comparisonData.filter(item => item.trend === 'stable').length;

    return (
      <Row gutter={16} className="kpi-comparison-container">
        <Col span={6}>
          <Card>
            <Statistic
              title={t('kpi_comparison.metrics_up')}
              value={upTrends}
              valueStyle={{ color: '#52c41a' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('kpi_comparison.metrics_down')}
              value={downTrends}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<FallOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('kpi_comparison.metrics_stable')}
              value={stableTrends}
              valueStyle={{ color: '#d9d9d9' }}
              prefix={<MinusOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('kpi_comparison.total_metrics')}
              value={comparisonData.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <BarChartOutlined />
          {t('kpi_comparison.title')}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="close" onClick={onClose}>
          {t('common.close')}
        </Button>
      ]}
      destroyOnClose
    >
      <div style={{ marginBottom: 20 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <label style={{ marginRight: 10, fontWeight: 'bold' }}>
              {t('kpi_comparison.select_years')}:
            </label>
            <Select
              mode="multiple"
              style={{ width: 300 }}
              placeholder={t('kpi_comparison.select_years_placeholder')}
              value={selectedYears}
              onChange={setSelectedYears}
              maxTagCount={3}
            >
              {availableYears.map(year => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Button.Group>
              <Button 
                type={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
              >
                {t('kpi_comparison.table_view')}
              </Button>
              <Button 
                type={viewMode === 'chart' ? 'primary' : 'default'}
                onClick={() => setViewMode('chart')}
              >
                {t('kpi_comparison.chart_view')}
              </Button>
            </Button.Group>
          </div>
        </Space>
      </div>

      {selectedYears.length < 2 && (
        <Alert
          message={t('kpi_comparison.select_two_years')}
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
          <div style={{ marginTop: 10 }}>{t('common.loading')}</div>
        </div>
      ) : selectedYears.length >= 2 && comparisonData.length > 0 ? (
        <>
          {renderSummaryCards()}
          
          {viewMode === 'table' ? (
            <Table
              columns={columns}
              dataSource={comparisonData}
              rowKey="metric"
              pagination={false}
              scroll={{ x: 800, y: 400 }}
              size="small"
              bordered
            />
          ) : (
            <div>
              <h4 className="kpi-comparison-chart-title">{t('kpi_comparison.evolution_chart')}</h4>
              {renderChart()}
            </div>
          )}
        </>
      ) : null}
    </Modal>
  );
};

export default KpiComparisonModal; 