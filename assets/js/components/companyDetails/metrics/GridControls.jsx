import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Drawer, Button, Table, Select, Space, Tooltip, Typography, Radio, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  updateCols,
  updateRowHeight,
  toggleDraggable,
  toggleResizable,
  addCustomChart
} from '../../../redux/slices/layoutSlice';
import { executeCustomQuery, getPredefinedQueries } from '@/services/company/queryService';

const { Option } = Select;
const { Text } = Typography;

const GridControls = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id } = useParams(); // Get the company ID from URL
  const { cols, rowHeight, isDraggable, isResizable } = useSelector((state) => state.layout);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState('1');
  const [queryResults, setQueryResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [predefinedQueries, setPredefinedQueries] = useState([]);
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);
  
  // Charger les requêtes prédéfinies depuis l'API
  useEffect(() => {
    const loadPredefinedQueries = async () => {
      try {
        setIsLoadingQueries(true);
        const queries = await getPredefinedQueries();
        
        if (queries && queries.length > 0) {
          setPredefinedQueries(queries);
        } else {
          // Utiliser les requêtes par défaut si l'API ne retourne rien
          setPredefinedQueries(defaultPredefinedQueries);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des requêtes prédéfinies:', error);
        setPredefinedQueries(defaultPredefinedQueries);
        message.error(t('metrics.errors.cannot_load_queries'));
      } finally {
        setIsLoadingQueries(false);
      }
    };
    
    // Charger les requêtes lorsque le drawer est ouvert
    if (drawerOpen) {
      loadPredefinedQueries();
    }
  }, [drawerOpen, id, t]);
  
  // Liste des requêtes prédéfinies par défaut (utilisées en cas d'échec de l'API)
  const defaultPredefinedQueries = [
    { 
      id: '1', 
      name: t('metrics.queries.monthly_revenue.name'), 
      description: t('metrics.queries.monthly_revenue.description'),
      query: 'SELECT to_char(k.created_at, \'YYYY-MM\') as month, SUM((k.kpi->>\'revenue\')::numeric) as revenue FROM kpi_data k WHERE k.company_id = ' + id + ' AND k.deleted_at IS NULL GROUP BY month ORDER BY month DESC LIMIT 12'
    },
    { 
      id: '2', 
      name: t('metrics.queries.clients_by_sector.name'), 
      description: t('metrics.queries.clients_by_sector.description'),
      query: 'SELECT c.sector, COUNT(*) as client_count FROM company c WHERE c.id IN (SELECT company_id FROM company_investment WHERE company_id = ' + id + ') AND c.deleted_at IS NULL GROUP BY c.sector ORDER BY client_count DESC'
    },
    { 
      id: '3', 
      name: t('metrics.queries.arr_growth.name'), 
      description: t('metrics.queries.arr_growth.description'),
      query: 'SELECT quarter, year, arr_value FROM metrics WHERE company_id = ' + id + ' AND metric_type = "ARR" ORDER BY year DESC, quarter DESC LIMIT 8'
    },
    { 
      id: '4', 
      name: t('metrics.queries.top_clients.name'), 
      description: t('metrics.queries.top_clients.description'),
      query: 'SELECT client_name, annual_value FROM clients WHERE company_id = ' + id + ' ORDER BY annual_value DESC LIMIT 10'
    },
    { 
      id: '5', 
      name: t('metrics.queries.headcount.name'), 
      description: t('metrics.queries.headcount.description'),
      query: 'SELECT quarter, year, headcount FROM company_stats WHERE company_id = ' + id + ' ORDER BY year DESC, quarter DESC LIMIT 8'
    },
    { 
      id: '6', 
      name: t('metrics.queries.investments.name'), 
      description: t('metrics.queries.investments.description'),
      query: 'SELECT to_char(ci.created_at, \'YYYY-Q\') as quarter, EXTRACT(YEAR FROM ci.created_at) as year, SUM(ci.amount) as investment_value FROM company_investment ci WHERE ci.company_id = ' + id + ' GROUP BY year, quarter ORDER BY year DESC, quarter DESC LIMIT 8'
    }
  ];
  
  // Obtenir la requête sélectionnée
  const getSelectedQuery = () => {
    // D'abord essayer de trouver la requête par ID
    const query = predefinedQueries.find(q => q.id === selectedQueryId);
    
    // Si on trouve une requête, la retourner
    if (query) return query;
    
    // Sinon, prendre la première requête disponible ou la première requête par défaut
    return predefinedQueries[0] || defaultPredefinedQueries[0] || {
      id: 'default',
      name: t('metrics.default_query.name'),
      description: t('metrics.default_query.description'),
      query: 'SELECT * FROM data WHERE company_id = {companyId} LIMIT 10'
    };
  };

  // Récupérer la requête sélectionnée
  const selectedQuery = getSelectedQuery();
  
  // Colonnes pour les résultats (détectées dynamiquement à partir des résultats)
  const generateColumns = (results) => {
    if (!results || results.length === 0) return [];
    
    // Créer des colonnes à partir du premier résultat
    const firstResult = results[0];
    return Object.keys(firstResult).map(key => {
      const column = { 
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), 
        dataIndex: key, 
        key: key 
      };
      
      // Formater certaines colonnes
      if (key.includes('revenue') || key.includes('value') || key.includes('amount')) {
        column.render = val => {
          if (typeof val !== 'number') return val;
          return val >= 1000000 
            ? `${(val/1000000).toFixed(2)} M€` 
            : `${(val/1000).toFixed(0)} K€`;
        };
      }
      
      return column;
    });
  };
  
  // Transformation des données pour les graphiques
  const transformDataForCharts = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('Aucune donnée valide pour créer un graphique');
      return [];
    }

    try {
      // Pour les graphiques en secteurs (pie)
      if (chartType === 'pie') {
        // Détecter automatiquement la colonne de nom et de valeur
        const keys = Object.keys(data[0] || {});
        if (keys.length < 2) {
          console.warn('Données insuffisantes pour créer un graphique (moins de 2 colonnes)');
          return [];
        }

        const valueColumn = keys.find(key => 
          key.includes('count') || 
          key.includes('value') || 
          key.includes('amount') || 
          key.includes('revenue') ||
          typeof data[0][key] === 'number'
        ) || keys[1];
        
        // La colonne de nom est généralement la première colonne qui n'est pas un nombre
        const nameColumn = keys.find(key => 
          key !== valueColumn && 
          (key.includes('name') || 
           key.includes('sector') || 
           key.includes('category') ||
           typeof data[0][key] === 'string')
        ) || keys[0];
        
        return data.map(item => ({
          name: item[nameColumn] ? String(item[nameColumn]) : 'Sans nom',
          value: parseFloat(item[valueColumn]) || 0
        }));
      }
      
      // Pour les graphiques de type bar, line, area
      // Trouver les colonnes de nom et de valeur
      const keys = Object.keys(data[0] || {});
      if (keys.length < 1) {
        console.warn('Données insuffisantes pour créer un graphique (aucune colonne)');
        return [];
      }
      
      // La colonne de valeur est généralement un nombre
      const valueColumns = keys.filter(key => 
        key.includes('count') || 
        key.includes('value') || 
        key.includes('amount') || 
        key.includes('revenue') || 
        key.includes('headcount') ||
        typeof data[0][key] === 'number'
      );
      
      if (valueColumns.length === 0) {
        console.warn('Aucune colonne de valeur numérique trouvée pour le graphique');
        // Utiliser la dernière colonne comme valeur par défaut
        valueColumns.push(keys[keys.length - 1]);
      }
      
      // La colonne de nom est généralement une chaîne ou une date
      const possibleNameColumns = ['month', 'year', 'quarter', 'name', 'sector', 'client_name', 'category'];
      let nameColumn = keys.find(key => possibleNameColumns.some(name => key.includes(name)));
      
      // Si on a deux colonnes associées comme year et quarter, les combiner
      if (keys.includes('year') && keys.includes('quarter')) {
        return data.map(item => {
          const result = { 
            name: item.year && item.quarter ? `${item.year} ${item.quarter}` : 'Non spécifié' 
          };
          
          valueColumns.forEach(valueCol => {
            if (valueCol !== 'year' && valueCol !== 'quarter') {
              result[valueCol] = parseFloat(item[valueCol]) || 0;
            }
          });
          
          return result;
        });
      }
      
      // Si aucune colonne de nom n'est trouvée, utiliser la première colonne qui n'est pas une valeur
      if (!nameColumn) {
        nameColumn = keys.find(key => !valueColumns.includes(key)) || keys[0];
      }
      
      return data.map((item, index) => {
        const result = { 
          name: item[nameColumn] ? String(item[nameColumn]) : `Item ${index + 1}` 
        };
        
        valueColumns.forEach(valueCol => {
          if (valueCol !== nameColumn) {
            result[valueCol] = parseFloat(item[valueCol]) || 0;
          }
        });
        
        return result;
      });
    } catch (error) {
      console.error('Erreur lors de la transformation des données pour le graphique:', error);
      return [];
    }
  };
  
  const showDrawer = () => {
    setDrawerOpen(true);
  };
  
  const closeDrawer = () => {
    setDrawerOpen(false);
  };
  
  const handleQueryChange = (value) => {
    setSelectedQueryId(value);
    setQueryResults([]);
  };
  
  // Exécuter la requête SQL sélectionnée
  const executeQuery = async () => {
    if (!selectedQuery) {
      message.error(t('metrics.errors.select_query'));
      return;
    }

    setIsLoading(true);
    setQueryResults([]); // Réinitialiser les résultats avant de lancer une nouvelle requête

    try {
      // Remplacer les paramètres dans la requête
      let processedQuery = selectedQuery.query;
      
      // Remplacer les paramètres de type {paramName}
      if (processedQuery.includes('{companyId}')) {
        processedQuery = processedQuery.replace(/\{companyId\}/g, id);
      }
      
      // Support pour l'ancien format avec concaténation directe 
      // (pour compatibilité avec les requêtes existantes)
      processedQuery = processedQuery.replace(' + id + ', id);
      
      console.log('Exécution de la requête:', processedQuery);
      
      // Exécuter la requête via l'API
      try {
        const results = await executeCustomQuery(
          processedQuery,
          id,
          selectedQuery.id
        );
        
        // Vérifier que les résultats sont un tableau avant de continuer
        if (Array.isArray(results)) {
          setQueryResults(results);
          
          if (results.length === 0) {
            message.info(t('metrics.info.no_results'));
          }
        } else {
          console.error('Format de résultats invalide:', results);
          message.error(t('metrics.errors.invalid_format'));
          setQueryResults([]);
        }
      } catch (apiError) {
        console.error('Erreur API:', apiError);
        message.error(t('metrics.errors.query_execution') + (apiError.message || t('metrics.errors.unknown')));
        setQueryResults([]);
      }
    } catch (error) {
      console.error('Erreur de traitement de la requête:', error);
      message.error(t('metrics.errors.query_execution'));
      setQueryResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Ajouter un graphique à partir des données actuelles
  const addGraphFromCurrentData = () => {
    if (!queryResults || queryResults.length === 0) {
      message.warning(t('metrics.warnings.execute_query_first'));
      return;
    }
    
    // Générer un ID unique pour le graphique
    const chartId = `custom_${Date.now()}`;
    
    try {
      // Transformer les données pour le graphique
      const transformedData = transformDataForCharts(queryResults);
      
      // Vérifier que les données transformées sont valides
      if (!Array.isArray(transformedData) || transformedData.length === 0) {
        throw new Error(t('metrics.errors.cannot_transform_data'));
      }
      
      // Ajouter le graphique
      dispatch(addCustomChart({
        companyId: id,
        chartId,
        chartData: transformedData,
        chartType,
        title: chartTitle || (selectedQuery ? selectedQuery.name : t('metrics.custom_chart'))
      }));
      
      message.success(t('metrics.success.chart_added'));
      closeDrawer();
    } catch (error) {
      console.error('Erreur lors de la création du graphique:', error);
      message.error(t('metrics.errors.cannot_create_chart') + error.message);
    }
  };

  return (
    <div className="flex items-center space-x-4 mb-2">
      <div>
        <label htmlFor="columns" className="text-sm text-gray-600 mr-2">
          {t('layout.columns')}:
        </label>
        <select
          id="columns"
          className="border border-gray-300 rounded text-sm px-2 py-1"
          value={cols}
          onChange={(e) => dispatch(updateCols(parseInt(e.target.value)))}
        >
          {[1, 2, 3, 4, 6].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => dispatch(toggleDraggable())}
          className={`px-2 py-1 rounded text-xs border ${
            isDraggable ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          } mr-2`}
        >
          {isDraggable ? `✓ ${t('layout.move')}` : t('layout.move')}
        </button>
        
        <button
          onClick={() => dispatch(toggleResizable())}
          className={`px-2 py-1 rounded text-xs border ${
            isResizable ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          } mr-2`}
        >
          {isResizable ? `✓ ${t('layout.resize')}` : t('layout.resize')}
        </button>

        <button
          onClick={showDrawer}
          className="px-2 py-1 rounded text-xs border border-purple-400 bg-purple-50"
        >
          {t('data')}
        </button>
      </div>

      <Drawer
        title={t('metrics.drawer.title')}
        placement="right"
        width={720}
        onClose={closeDrawer}
        open={drawerOpen}
        extra={
          <Space>
            <Button onClick={closeDrawer}>{t('common.close')}</Button>
            <Button type="primary" onClick={executeQuery} loading={isLoading}>
              {t('metrics.drawer.execute')}
            </Button>
          </Space>
        }
      >
        <div className="mb-6">
          <h4 className="mb-2 font-medium">{t('metrics.drawer.select_query')}</h4>
          <Select
            style={{ width: '100%' }}
            value={selectedQueryId}
            onChange={handleQueryChange}
            className="mb-2"
            loading={isLoadingQueries}
          >
            {predefinedQueries.map(query => (
              <Option key={query.id} value={query.id}>{t('queries.' + query.id, query.name)}</Option>
            ))}
          </Select>
          
          <div className="bg-gray-50 p-3 rounded mt-2">
            <Text type="secondary">{t('queries.descriptions.' + selectedQuery?.id, selectedQuery?.description)}</Text>
          </div>
        </div>
        
        <div>
          <h4 className="mb-2 font-medium">{t('metrics.drawer.results')}</h4>
          <Table 
            columns={generateColumns(queryResults)} 
            dataSource={queryResults} 
            rowKey={(record, index) => index}
            loading={isLoading} 
            pagination={{ pageSize: 5 }}
            scroll={{ x: 'max-content' }}
          />
        </div>
        
        {queryResults.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h4 className="mb-4 font-medium">{t('metrics.drawer.add_chart')}</h4>
            
            <div className="mb-3">
              <label htmlFor="chartTitle" className="block text-sm mb-1">{t('metrics.drawer.chart_title')}:</label>
              <Input 
                id="chartTitle"
                placeholder={t('metrics.drawer.chart_title_placeholder')} 
                value={chartTitle} 
                onChange={(e) => setChartTitle(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">{t('metrics.drawer.chart_type')}:</label>
              <Radio.Group onChange={(e) => setChartType(e.target.value)} value={chartType}>
                <Radio.Button value="bar">{t('metrics.chart_types.bar')}</Radio.Button>
                <Radio.Button value="line">{t('metrics.chart_types.line')}</Radio.Button>
                <Radio.Button value="area">{t('metrics.chart_types.area')}</Radio.Button>
                <Radio.Button value="pie">{t('metrics.chart_types.pie')}</Radio.Button>
              </Radio.Group>
            </div>
            
            <Button type="primary" onClick={addGraphFromCurrentData}>
              {t('metrics.drawer.add_chart_button')}
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default GridControls; 