import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
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
  const { data, type } = chartInfo;
  
  // Déterminer les clés à utiliser pour le graphique
  const keys = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'name' && key !== 'label') : [];
  
  // Fonction pour générer un graphique selon le type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              {keys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              {keys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]} 
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              {keys.map((key, index) => (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
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
                dataKey={keys[0]}
                nameKey="name"
                label={(entry) => entry.name}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">{t('metrics.unsupported_chart_type')}</p>
          </div>
        );
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-slate-200">
        <h3 className="text-sm font-medium">{chartInfo.title || t('metrics.custom_chart')}</h3>
      </div>
      <div className="flex-grow">
        {renderChart()}
      </div>
    </div>
  );
};

export default CustomChartComponent; 