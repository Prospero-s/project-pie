import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Palettes de couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF'];

const CustomChartComponent = ({ chartId }) => {
  const { t } = useTranslation();
  const { id } = useParams(); // ID de l'entreprise
  const { customCharts } = useSelector(state => state.layout);

  // Si pas de données pour cette entreprise ou ce graphique, retourner null
  if (!customCharts[id] || !customCharts[id][chartId]) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">{t('metrics.no_data')}</p>
      </div>
    );
  }

  const chartInfo = customCharts[id][chartId];
  const { data, type, columnsMetadata = {}, xAxisKey, yAxisKeys } = chartInfo;

  // Déterminer automatiquement les clés de données si pas spécifiées
  const dataKeys =
    yAxisKeys.length > 0
      ? yAxisKeys
      : Object.keys(data[0]).filter(key => key !== xAxisKey);

  // Formateur pour les tooltips
  const tooltipFormatter = (value, name) => {
    // Si c'est une colonne calculée, utiliser son format
    if (columnsMetadata[name] && columnsMetadata[name].isCalculated) {
      const format = columnsMetadata[name].format;
      switch (format) {
        case 'percentage':
          return [`${(value * 100).toFixed(2)}%`, name];
        case 'currency':
          return value >= 1000000
            ? [`${(value / 1000000).toFixed(2)} M€`, name]
            : [`${(value / 1000).toFixed(0)} k€`, name];
        default:
          return [value, name];
      }
    }

    // Formatage par défaut pour les valeurs monétaires
    if (
      name.includes('revenue') ||
      name.includes('value') ||
      name.includes('amount')
    ) {
      return value >= 1000000
        ? [`${(value / 1000000).toFixed(2)} M€`, name]
        : [`${(value / 1000).toFixed(0)} k€`, name];
    }

    return [value, name];
  };

  // Fonction pour générer un graphique selon le type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis
                tickFormatter={value =>
                  value >= 1000000
                    ? `${(value / 1000000).toFixed(1)}M€`
                    : `${(value / 1000).toFixed(0)}k€`
                }
              />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[index % COLORS.length]}
                  // Ajouter un style spécial pour les colonnes calculées
                  strokeDasharray={
                    columnsMetadata[key] && columnsMetadata[key].isCalculated
                      ? '3 3'
                      : '0'
                  }
                  strokeWidth={
                    columnsMetadata[key] && columnsMetadata[key].isCalculated
                      ? 2
                      : 0
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 8 }}
                  // Ajouter un style spécial pour les colonnes calculées
                  strokeDasharray={
                    columnsMetadata[key] && columnsMetadata[key].isCalculated
                      ? '5 5'
                      : '0'
                  }
                  strokeWidth={
                    columnsMetadata[key] && columnsMetadata[key].isCalculated
                      ? 2
                      : 1
                  }
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  // Ajouter un style spécial pour les colonnes calculées
                  strokeDasharray={
                    columnsMetadata[key] && columnsMetadata[key].isCalculated
                      ? '5 5'
                      : '0'
                  }
                  strokeWidth={
                    columnsMetadata[key] && columnsMetadata[key].isCalculated
                      ? 2
                      : 1
                  }
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        // Pour un camembert, nous utilisons la première colonne Y sélectionnée
        if (dataKeys.length > 0) {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey={dataKeys[0]}
                  nameKey="name"
                  label={entry => entry.name}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          );
        }
        return null;

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius={80} data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <Tooltip formatter={tooltipFormatter} />
              {dataKeys.map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.2}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">
              {t('metrics.unsupported_chart_type')}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-slate-200">
        <h3 className="text-sm font-medium">
          {chartInfo.title || t('metrics.custom_chart')}
        </h3>
      </div>
      <div className="flex-grow">{renderChart()}</div>
    </div>
  );
};

export default CustomChartComponent;
