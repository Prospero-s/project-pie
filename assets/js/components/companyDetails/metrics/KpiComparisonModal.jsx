import React, { useState, useEffect } from 'react';
import {
  Modal,
  Select,
  Table,
  Spin,
  Alert,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Button,
  Space,
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from 'recharts';
import {
  getCompanyKpisByYear,
  getCompanyKpisYears,
  getAllCompanies,
} from '@/services/company/companyService';
import '../../../../css/components/metrics.css';

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
  const [chartType, setChartType] = useState('percentage'); // 'bar', 'radar', 'percentage', 'separated'
  const [comparisonMode, setComparisonMode] = useState('years'); // 'years' ou 'companies'
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    if (visible) {
      loadAvailableYears();
      loadAvailableCompanies();
    }
  }, [visible, id]);

  useEffect(() => {
    if (comparisonMode === 'years' && selectedYears.length >= 2) {
      loadComparisonData();
    } else if (
      comparisonMode === 'companies' &&
      selectedCompanies.length >= 2 &&
      selectedYear
    ) {
      loadCompanyComparisonData();
    }
  }, [selectedYears, selectedCompanies, selectedYear, comparisonMode]);

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

  const loadAvailableCompanies = async () => {
    try {
      const companies = await getAllCompanies();
      // Filtrer pour exclure l'entreprise courante
      const filteredCompanies = companies.filter(
        company => company.id !== parseInt(id),
      );
      setAvailableCompanies(filteredCompanies);

      // Sélectionner automatiquement les premières entreprises si pas encore sélectionnées
      if (filteredCompanies.length >= 2 && selectedCompanies.length === 0) {
        setSelectedCompanies([parseInt(id), filteredCompanies[0].id]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    }
  };

  const loadComparisonData = async () => {
    if (selectedYears.length < 2) return;

    setLoading(true);
    try {
      // Charger les données pour chaque année sélectionnée
      const yearDataPromises = selectedYears.map(year =>
        getCompanyKpisByYear(id, year).then(data => ({ year, data })),
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
              values: {},
            });
          }

          // Extraire la valeur numérique des colonnes Q1, Q2, Q3, Q4
          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
          let totalValue = 0;
          let quarterCount = 0;

          quarters.forEach(quarter => {
            if (item[quarter] && item[quarter] !== null) {
              // Extraire le nombre de la chaîne (ex: "7 531 666.67 €" -> 7531666.67)
              const numericValue = parseFloat(
                item[quarter].toString().replace(/[^\d.-]/g, ''),
              );
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

          // Seuil plus sensible pour détecter les variations
          if (evolutionPercent > 0.1) {
            trend = 'up';
          } else if (evolutionPercent < -0.1) {
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
          newestYear,
        };
      });

      setComparisonData(comparisonArray);

      // Préparer les données pour le graphique
      const chartDataArray = comparisonArray.map(metric => {
        const chartItem = { metric: metric.metric };
        selectedYears.forEach(year => {
          const value = metric.values[year] || 0;
          // S'assurer que la valeur est numérique et valide
          chartItem[`year_${year}`] = isNaN(value) ? 0 : Number(value);
        });
        return chartItem;
      });

      // Filtrer les données invalides et trier par nom de métrique pour un affichage cohérent
      const validChartData = chartDataArray
        .filter(item => item.metric && item.metric.trim() !== '')
        .sort((a, b) => a.metric.localeCompare(b.metric));

      console.error('Chart data prepared:', validChartData); // Debug log
      setChartData(validChartData);
    } catch (error) {
      console.error(
        'Erreur lors du chargement des données de comparaison:',
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyComparisonData = async () => {
    if (selectedCompanies.length < 2 || !selectedYear) return;

    setLoading(true);
    try {
      // Charger les données pour chaque entreprise sélectionnée
      const companyDataPromises = selectedCompanies.map(async companyId => {
        let companyInfo;
        if (companyId === parseInt(id)) {
          // Récupérer les info de l'entreprise courante
          const currentCompany =
            availableCompanies.find(c => c.id === parseInt(id)) ||
            (await getAllCompanies().then(companies =>
              companies.find(c => c.id === parseInt(id)),
            ));
          companyInfo = currentCompany || {
            id: parseInt(id),
            denomination: 'Entreprise courante',
          };
        } else {
          companyInfo = availableCompanies.find(c => c.id === companyId);
          if (!companyInfo) {
            // Si pas trouvé dans la liste, recharger toutes les entreprises
            const allCompanies = await getAllCompanies();
            companyInfo = allCompanies.find(c => c.id === companyId) || {
              id: companyId,
              denomination: `Entreprise ${companyId}`,
            };
          }
        }

        const data = await getCompanyKpisByYear(companyId, selectedYear);
        return { company: companyInfo, data };
      });

      const companyDataResults = await Promise.all(companyDataPromises);

      // Organiser les données par métrique
      const metricsMap = new Map();

      companyDataResults.forEach(({ company, data }) => {
        data.forEach(item => {
          const metricKey = item.metric;
          if (!metricsMap.has(metricKey)) {
            metricsMap.set(metricKey, {
              metric: metricKey,
              unit: item.unit || '',
              companyValues: {},
            });
          }

          // Extraire la valeur numérique des colonnes Q1, Q2, Q3, Q4
          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
          let totalValue = 0;
          let quarterCount = 0;

          quarters.forEach(quarter => {
            if (item[quarter] && item[quarter] !== null) {
              // Extraire le nombre de la chaîne (ex: "7 531 666.67 €" -> 7531666.67)
              const numericValue = parseFloat(
                item[quarter].toString().replace(/[^\d.-]/g, ''),
              );
              if (!isNaN(numericValue)) {
                totalValue += numericValue;
                quarterCount++;
              }
            }
          });

          // Calculer la moyenne si on a des données
          const averageValue = quarterCount > 0 ? totalValue / quarterCount : 0;
          metricsMap.get(metricKey).companyValues[company.id] = {
            value: averageValue,
            name:
              company.denomination ||
              company.name ||
              `Entreprise ${company.id}`,
          };
        });
      });

      // Convertir en tableau pour la comparaison inter-entreprises
      const comparisonArray = Array.from(metricsMap.values()).map(metric => {
        const companyIds = selectedCompanies.sort((a, b) => a - b);
        const firstCompany = companyIds[0];
        const secondCompany = companyIds[1];

        const firstValue = metric.companyValues[firstCompany]?.value || 0;
        const secondValue = metric.companyValues[secondCompany]?.value || 0;
        const firstName =
          metric.companyValues[firstCompany]?.name ||
          `Entreprise ${firstCompany}`;
        const secondName =
          metric.companyValues[secondCompany]?.name ||
          `Entreprise ${secondCompany}`;

        // Calculer l'évolution/différence entre entreprises
        let evolution = 0;
        let evolutionPercent = 0;
        let trend = 'stable';
        let betterCompany = null;

        if (firstValue !== 0) {
          evolution = secondValue - firstValue;
          evolutionPercent =
            ((secondValue - firstValue) / Math.abs(firstValue)) * 100;

          // Déterminer quelle entreprise performe mieux selon la métrique
          // Pour la plupart des métriques, plus c'est élevé, mieux c'est
          // Sauf pour "Argent brûlé" et "Coût d'acquisition" où moins c'est mieux
          const isInverseMetric =
            metric.metric.toLowerCase().includes('argent brûlé') ||
            metric.metric.toLowerCase().includes('coût') ||
            metric.metric.toLowerCase().includes('burn');

          if (isInverseMetric) {
            betterCompany =
              firstValue < secondValue ? firstCompany : secondCompany;
          } else {
            betterCompany =
              firstValue > secondValue ? firstCompany : secondCompany;
          }

          // Seuil plus sensible pour détecter les variations
          if (evolutionPercent > 0.1) {
            trend = 'up';
          } else if (evolutionPercent < -0.1) {
            trend = 'down';
          }
        } else if (secondValue !== 0) {
          trend = 'up';
          evolutionPercent = 100;
          betterCompany = secondCompany;
        }

        return {
          ...metric,
          firstValue,
          secondValue,
          evolution,
          evolutionPercent,
          trend,
          firstCompany: firstName,
          secondCompany: secondName,
          betterCompany,
          firstCompanyId: firstCompany,
          secondCompanyId: secondCompany,
        };
      });

      setComparisonData(comparisonArray);

      // Préparer les données pour le graphique de comparaison inter-entreprises
      const chartDataArray = comparisonArray.map(metric => {
        const chartItem = { metric: metric.metric };
        selectedCompanies.forEach(companyId => {
          const companyInfo = metric.companyValues[companyId];
          if (companyInfo) {
            chartItem[`company_${companyId}`] = companyInfo.value || 0;
          }
        });
        return chartItem;
      });

      // Filtrer les données invalides et trier par nom de métrique pour un affichage cohérent
      const validChartData = chartDataArray
        .filter(item => item.metric && item.metric.trim() !== '')
        .sort((a, b) => a.metric.localeCompare(b.metric));

      console.error('Company comparison chart data prepared:', validChartData); // Debug log
      setChartData(validChartData);
    } catch (error) {
      console.error(
        'Erreur lors du chargement des données de comparaison inter-entreprises:',
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  // Préparer les données pour le graphique radar (normalisées)
  const prepareRadarData = () => {
    if (comparisonData.length === 0) return [];

    return comparisonData.map(metric => ({
      metric: metric.metric,
      evolution: Math.abs(metric.evolutionPercent), // Utiliser la valeur absolue du pourcentage
      trend: metric.trend,
    }));
  };

  // Préparer les données pour le graphique de pourcentages d'évolution
  const preparePercentageData = () => {
    if (comparisonData.length === 0) return [];

    return comparisonData.map(metric => ({
      metric: metric.metric,
      evolution: metric.evolutionPercent,
      trend: metric.trend,
    }));
  };

  // Séparer les métriques par échelle de grandeur
  const prepareSeparatedData = () => {
    if (comparisonData.length === 0)
      return { large: [], medium: [], small: [] };

    const large = [];
    const medium = [];
    const small = [];

    comparisonData.forEach(metric => {
      const maxValue = Math.max(
        Math.abs(metric.oldValue),
        Math.abs(metric.newValue),
      );

      if (maxValue >= 1000000) {
        large.push(metric);
      } else if (maxValue >= 1000) {
        medium.push(metric);
      } else {
        small.push(metric);
      }
    });

    return { large, medium, small };
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

  const getTrendIcon = trend => {
    switch (trend) {
      case 'up':
        return <RiseOutlined className="kpi-trend-up" />;
      case 'down':
        return <FallOutlined className="kpi-trend-down" />;
      default:
        return <MinusOutlined className="kpi-trend-stable" />;
    }
  };

  const renderMetricName = metricName => {
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
      render: renderMetricName,
    },
    {
      title:
        comparisonMode === 'years'
          ? `${comparisonData[0]?.oldestYear || ''}`
          : `${comparisonData[0]?.firstCompany || 'Entreprise 1'}`,
      key: 'firstValue',
      width: 150,
      render: (_, record) => {
        const value = formatValue(
          comparisonMode === 'years' ? record.oldValue : record.firstValue,
          record.unit,
        );

        // Ajouter un indicateur pour la comparaison inter-entreprises
        if (comparisonMode === 'companies' && record.betterCompany) {
          const isBetter = record.betterCompany === record.firstCompanyId;
          return (
            <span
              style={{
                color: isBetter ? '#52c41a' : '#ff4d4f',
                fontWeight: isBetter ? 'bold' : 'normal',
              }}
            >
              {isBetter && '🏆 '}
              {value}
            </span>
          );
        }

        return value;
      },
    },
    {
      title:
        comparisonMode === 'years'
          ? `${comparisonData[0]?.newestYear || ''}`
          : `${comparisonData[0]?.secondCompany || 'Entreprise 2'}`,
      key: 'secondValue',
      width: 150,
      render: (_, record) => {
        const value = formatValue(
          comparisonMode === 'years' ? record.newValue : record.secondValue,
          record.unit,
        );

        // Ajouter un indicateur pour la comparaison inter-entreprises
        if (comparisonMode === 'companies' && record.betterCompany) {
          const isBetter = record.betterCompany === record.secondCompanyId;
          return (
            <span
              style={{
                color: isBetter ? '#52c41a' : '#ff4d4f',
                fontWeight: isBetter ? 'bold' : 'normal',
              }}
            >
              {isBetter && '🏆 '}
              {value}
            </span>
          );
        }

        return value;
      },
    },
    {
      title:
        comparisonMode === 'years'
          ? t('kpi_comparison.evolution')
          : t('kpi_comparison.difference'),
      key: 'evolution',
      width: 120,
      render: (_, record) => (
        <Space>
          {getTrendIcon(record.trend)}
          <span className={`kpi-trend-${record.trend}`}>
            {record.evolution > 0 ? '+' : ''}
            {formatValue(record.evolution, record.unit)}
          </span>
        </Space>
      ),
    },
    {
      title:
        comparisonMode === 'years'
          ? t('kpi_comparison.variation_percent')
          : t('kpi_comparison.difference_percent'),
      key: 'evolutionPercent',
      width: 120,
      render: (_, record) => (
        <Tag
          color={
            record.trend === 'up'
              ? 'green'
              : record.trend === 'down'
                ? 'red'
                : 'default'
          }
        >
          {record.evolutionPercent > 0 ? '+' : ''}
          {record.evolutionPercent.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title:
        comparisonMode === 'years'
          ? t('kpi_comparison.trend')
          : t('kpi_comparison.comparison'),
      key: 'trend',
      width: 100,
      render: (_, record) => {
        const trendText =
          comparisonMode === 'years'
            ? record.trend === 'up'
              ? t('kpi_comparison.trend_up')
              : record.trend === 'down'
                ? t('kpi_comparison.trend_down')
                : t('kpi_comparison.trend_stable')
            : record.trend === 'up'
              ? t('kpi_comparison.superior')
              : record.trend === 'down'
                ? t('kpi_comparison.inferior')
                : t('kpi_comparison.similar');
        return (
          <Tag
            color={
              record.trend === 'up'
                ? 'green'
                : record.trend === 'down'
                  ? 'red'
                  : 'default'
            }
          >
            {trendText}
          </Tag>
        );
      },
    },
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'radar':
        return renderRadarChart();
      case 'percentage':
        return renderPercentageChart();
      case 'separated':
        return renderSeparatedCharts();
      case 'bar':
      default:
        return renderBarChart();
    }
  };

  const renderBarChart = () => {
    if (chartData.length === 0) return null;

    // Vérifier s'il y a des données valides à afficher
    const hasValidData = chartData.some(item =>
      selectedYears.some(
        year =>
          item[`year_${year}`] &&
          !isNaN(item[`year_${year}`]) &&
          item[`year_${year}`] !== 0,
      ),
    );

    if (!hasValidData) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>{t('kpi_comparison.no_valid_data')}</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="metric"
            angle={-45}
            textAnchor="end"
            height={120}
            interval={0}
            fontSize={11}
            width={60}
          />
          <YAxis
            tickFormatter={value => {
              if (Math.abs(value) >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              } else if (Math.abs(value) >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
              }
              return value.toString();
            }}
            domain={['dataMin', 'dataMax']}
          />
          <RechartsTooltip
            formatter={(value, name) => [
              formatValue(value, ''),
              comparisonMode === 'years'
                ? name.replace('year_', t('kpi_comparison.year_prefix') + ' ')
                : name
                    .replace('company_', '')
                    .replace(id.toString(), 'Entreprise courante'),
            ]}
            labelFormatter={label => `${label}`}
          />
          <Legend />
          {comparisonMode === 'years'
            ? selectedYears.map((year, index) => (
                <Bar
                  key={year}
                  dataKey={`year_${year}`}
                  name={`${t('kpi_comparison.year_prefix')} ${year}`}
                  fill={index === 0 ? '#8884d8' : '#82ca9d'}
                />
              ))
            : selectedCompanies.map((companyId, index) => {
                const companyInfo =
                  companyId === parseInt(id)
                    ? availableCompanies.find(c => c.id === parseInt(id))
                        ?.denomination || 'Entreprise courante'
                    : availableCompanies.find(c => c.id === companyId)
                        ?.denomination || `Entreprise ${companyId}`;

                // Couleurs différenciées pour la performance
                let barColor = index === 0 ? '#8884d8' : '#82ca9d';

                // Si on peut déterminer la performance globale, utiliser des couleurs appropriées
                if (comparisonData.length > 0) {
                  const betterCount = comparisonData.filter(
                    metric => metric.betterCompany === companyId,
                  ).length;
                  const totalMetrics = comparisonData.length;
                  const performanceRatio = betterCount / totalMetrics;

                  if (performanceRatio > 0.6) {
                    barColor = '#52c41a'; // Vert pour bonne performance
                  } else if (performanceRatio < 0.4) {
                    barColor = '#ff7875'; // Rouge pour performance plus faible
                  } else {
                    barColor = '#faad14'; // Orange pour performance moyenne
                  }
                }

                return (
                  <Bar
                    key={companyId}
                    dataKey={`company_${companyId}`}
                    name={companyInfo}
                    fill={barColor}
                  />
                );
              })}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderRadarChart = () => {
    const radarData = prepareRadarData();
    if (radarData.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" className="text-xs" />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 'dataMax']}
            tickFormatter={value => `${value.toFixed(1)}%`}
          />
          <Radar
            name={t('kpi_comparison.evolution_percent')}
            dataKey="evolution"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <RechartsTooltip
            formatter={value => [
              `${value.toFixed(1)}%`,
              t('kpi_comparison.absolute_evolution'),
            ]}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderPercentageChart = () => {
    const percentageData = preparePercentageData();
    if (percentageData.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={percentageData}
          margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="metric"
            angle={-45}
            textAnchor="end"
            height={120}
            interval={0}
            fontSize={11}
          />
          <YAxis tickFormatter={value => `${value.toFixed(1)}%`} />
          <RechartsTooltip
            formatter={value => [
              `${value > 0 ? '+' : ''}${value.toFixed(1)}%`,
              t('kpi_comparison.evolution'),
            ]}
          />
          <Legend />
          <Bar dataKey="evolution" name={t('kpi_comparison.evolution_percent')}>
            {percentageData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.evolution > 0
                    ? '#52c41a'
                    : entry.evolution < 0
                      ? '#ff4d4f'
                      : '#d9d9d9'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderSeparatedCharts = () => {
    const { large, medium, small } = prepareSeparatedData();

    const renderSubChart = (data, title, unit = '') => {
      if (data.length === 0) return null;

      const chartData = data.map(metric => ({
        metric: metric.metric,
        ...(comparisonMode === 'years'
          ? {
              [`year_${metric.oldestYear}`]: metric.oldValue,
              [`year_${metric.newestYear}`]: metric.newValue,
            }
          : {
              [`company_${selectedCompanies[0]}`]: metric.firstValue,
              [`company_${selectedCompanies[1]}`]: metric.secondValue,
            }),
      }));

      return (
        <div key={title} style={{ marginBottom: '30px' }}>
          <h5 style={{ textAlign: 'center', marginBottom: '10px' }}>{title}</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="metric"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={10}
              />
              <YAxis
                tickFormatter={value =>
                  unit === 'M'
                    ? `${(value / 1000000).toFixed(1)}M`
                    : unit === 'K'
                      ? `${(value / 1000).toFixed(1)}K`
                      : value.toString()
                }
              />
              <RechartsTooltip
                formatter={(value, name) => [
                  formatValue(value, ''),
                  name.replace('year_', t('kpi_comparison.year_prefix') + ' '),
                ]}
              />
              <Legend />
              {comparisonMode === 'years'
                ? selectedYears.map((year, index) => (
                    <Bar
                      key={year}
                      dataKey={`year_${year}`}
                      name={`${t('kpi_comparison.year_prefix')} ${year}`}
                      fill={index === 0 ? '#8884d8' : '#82ca9d'}
                    />
                  ))
                : selectedCompanies.map((companyId, index) => {
                    const companyInfo =
                      companyId === parseInt(id)
                        ? availableCompanies.find(c => c.id === parseInt(id))
                            ?.denomination || 'Entreprise courante'
                        : availableCompanies.find(c => c.id === companyId)
                            ?.denomination || `Entreprise ${companyId}`;

                    // Couleurs différenciées pour la performance
                    let barColor = index === 0 ? '#8884d8' : '#82ca9d';

                    // Si on peut déterminer la performance globale, utiliser des couleurs appropriées
                    if (comparisonData.length > 0) {
                      const betterCount = comparisonData.filter(
                        metric => metric.betterCompany === companyId,
                      ).length;
                      const totalMetrics = comparisonData.length;
                      const performanceRatio = betterCount / totalMetrics;

                      if (performanceRatio > 0.6) {
                        barColor = '#52c41a'; // Vert pour bonne performance
                      } else if (performanceRatio < 0.4) {
                        barColor = '#ff7875'; // Rouge pour performance plus faible
                      } else {
                        barColor = '#faad14'; // Orange pour performance moyenne
                      }
                    }

                    return (
                      <Bar
                        key={companyId}
                        dataKey={`company_${companyId}`}
                        name={companyInfo}
                        fill={barColor}
                      />
                    );
                  })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    };

    return (
      <div>
        {renderSubChart(large, t('kpi_comparison.important_metrics'), 'M')}
        {renderSubChart(medium, t('kpi_comparison.medium_metrics'), 'K')}
        {renderSubChart(small, t('kpi_comparison.detailed_metrics'), '')}
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (comparisonData.length === 0) return null;

    if (comparisonMode === 'companies') {
      // Pour la comparaison inter-entreprises, montrer quelle entreprise performe mieux
      const companiesPerformance = selectedCompanies.map(companyId => {
        const betterCount = comparisonData.filter(
          metric => metric.betterCompany === companyId,
        ).length;
        const companyInfo =
          companyId === parseInt(id)
            ? availableCompanies.find(c => c.id === parseInt(id))
                ?.denomination || 'Entreprise courante'
            : availableCompanies.find(c => c.id === companyId)?.denomination ||
              `Entreprise ${companyId}`;

        return {
          id: companyId,
          name: companyInfo,
          betterCount,
          performanceRatio: betterCount / comparisonData.length,
        };
      });

      const bestCompany = companiesPerformance.reduce((best, current) =>
        current.betterCount > best.betterCount ? current : best,
      );

      return (
        <Row gutter={16} className="kpi-comparison-container">
          <Col span={8}>
            <Card>
              <Statistic
                title={t('kpi_comparison.best_performing_company')}
                value={bestCompany.name}
                valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                suffix={`(${bestCompany.betterCount}/${comparisonData.length} ${t('kpi_comparison.metrics')})`}
              />
            </Card>
          </Col>
          {companiesPerformance.map(company => (
            <Col span={8} key={company.id}>
              <Card>
                <Statistic
                  title={company.name}
                  value={company.betterCount}
                  valueStyle={{
                    color:
                      company.performanceRatio > 0.6
                        ? '#52c41a'
                        : company.performanceRatio < 0.4
                          ? '#ff4d4f'
                          : '#faad14',
                  }}
                  suffix={`/ ${comparisonData.length} ${t('kpi_comparison.metrics')}`}
                  prefix={
                    company.performanceRatio > 0.6
                      ? '🏆'
                      : company.performanceRatio < 0.4
                        ? '⚠️'
                        : '📊'
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      );
    }

    // Pour la comparaison temporelle (années)
    const upTrends = comparisonData.filter(item => item.trend === 'up').length;
    const downTrends = comparisonData.filter(
      item => item.trend === 'down',
    ).length;
    const stableTrends = comparisonData.filter(
      item => item.trend === 'stable',
    ).length;

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
        </Button>,
      ]}
      destroyOnClose
    >
      <div className="kpi-comparison-container">
        <Space size="large" className="kpi-comparison-controls">
          {/* Sélecteur du mode de comparaison */}
          <div>
            <label className="kpi-comparison-label">
              {t('kpi_comparison.comparison_mode')}:
            </label>
            <Select
              value={comparisonMode}
              onChange={value => {
                setComparisonMode(value);
                setComparisonData([]);
                setChartData([]);
              }}
              style={{ width: 200 }}
              size="middle"
            >
              <Option value="years">{t('kpi_comparison.between_years')}</Option>
              <Option value="companies">
                {t('kpi_comparison.between_companies')}
              </Option>
            </Select>
          </div>

          {/* Contrôles pour la comparaison par années */}
          {comparisonMode === 'years' && (
            <div>
              <label className="kpi-comparison-label">
                {t('kpi_comparison.select_years')}:
              </label>
              <Select
                mode="multiple"
                className="kpi-comparison-select"
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
          )}

          {/* Contrôles pour la comparaison entre entreprises */}
          {comparisonMode === 'companies' && (
            <>
              <div>
                <label className="kpi-comparison-label">
                  {t('kpi_comparison.reference_year')}:
                </label>
                <Select
                  value={selectedYear}
                  onChange={setSelectedYear}
                  placeholder={t('kpi_comparison.select_year_placeholder')}
                  style={{ width: 150 }}
                  size="middle"
                >
                  {availableYears.map(year => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="kpi-comparison-label">
                  {t('kpi_comparison.companies_to_compare')}:
                </label>
                <Select
                  mode="multiple"
                  className="kpi-comparison-select"
                  placeholder={t('kpi_comparison.select_companies_placeholder')}
                  value={selectedCompanies}
                  onChange={setSelectedCompanies}
                  maxTagCount={3}
                >
                  <Option key={parseInt(id)} value={parseInt(id)}>
                    {t('kpi_comparison.current_company')}
                  </Option>
                  {availableCompanies.map(company => (
                    <Option key={company.id} value={company.id}>
                      {company.denomination || `Entreprise ${company.id}`}
                    </Option>
                  ))}
                </Select>
              </div>
            </>
          )}

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

          {viewMode === 'chart' && (
            <div>
              <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
                {t('kpi_comparison.chart_type')}:
              </label>
              <Select
                value={chartType}
                onChange={setChartType}
                style={{ width: 200 }}
                size="middle"
              >
                <Option value="percentage">
                  {t('kpi_comparison.chart_percentage')}
                </Option>
                <Option value="radar">{t('kpi_comparison.chart_radar')}</Option>
                <Option value="separated">
                  {t('kpi_comparison.chart_separated')}
                </Option>
                <Option value="bar">{t('kpi_comparison.chart_bar')}</Option>
              </Select>
            </div>
          )}
        </Space>

        {((comparisonMode === 'years' && selectedYears.length < 2) ||
          (comparisonMode === 'companies' &&
            (selectedCompanies.length < 2 || !selectedYear))) && (
          <Alert
            message={
              comparisonMode === 'years'
                ? t('kpi_comparison.select_two_years')
                : t('kpi_comparison.select_companies_and_year')
            }
            type="warning"
            showIcon
            className="kpi_comparison-alert"
          />
        )}

        {loading ? (
          <div className="kpi-comparison-loading">
            <Spin size="large" />
            <div className="kpi-comparison-loading-text">
              {t('common.loading')}
            </div>
          </div>
        ) : ((comparisonMode === 'years' && selectedYears.length >= 2) ||
            (comparisonMode === 'companies' &&
              selectedCompanies.length >= 2 &&
              selectedYear)) &&
          comparisonData.length > 0 ? (
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
                <h4 className="kpi-comparison-chart-title">
                  {t('kpi_comparison.evolution_chart')}
                </h4>
                {renderChart()}
              </div>
            )}
          </>
        ) : null}
      </div>
    </Modal>
  );
};

export default KpiComparisonModal;
