import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Drawer, Button, Table, Select, Space, Tooltip, Typography, Radio, Input, message, Spin, Menu, Dropdown, Popover, Modal, Form, InputNumber, Switch, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  updateCols,
  updateRowHeight,
  toggleDraggable,
  toggleResizable,
  addCustomChart
} from '../../../redux/slices/layoutSlice';
import {
  DownOutlined, FilterOutlined, SettingOutlined,
  PlusOutlined, EyeInvisibleOutlined, TableOutlined,
  SortAscendingOutlined, SortDescendingOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

// Données statiques pour les requêtes prédéfinies (utilisées uniquement si directFetchMode = false)
const PREDEFINED_QUERIES = [
  { 
    id: '1', 
    name: 'Revenus mensuels',
    query: 'monthly_revenue',
    description: 'Affiche les revenus mensuels de l\'entreprise au cours des 12 derniers mois',
    data: [
      { month: '2023-06', revenue: 520000 },
      { month: '2023-05', revenue: 480000 },
      { month: '2023-04', revenue: 510000 },
      { month: '2023-03', revenue: 450000 },
      { month: '2023-02', revenue: 430000 },
      { month: '2023-01', revenue: 460000 },
      { month: '2022-12', revenue: 490000 },
      { month: '2022-11', revenue: 470000 },
      { month: '2022-10', revenue: 440000 },
      { month: '2022-09', revenue: 420000 },
      { month: '2022-08', revenue: 430000 },
      { month: '2022-07', revenue: 410000 }
    ]
  },
  { 
    id: '2', 
    name: 'Clients par secteur',
    query: 'clients_by_sector',
    description: 'Répartition des clients par secteur d\'activité',
    data: [
      { sector: 'Technologie', client_count: 45 },
      { sector: 'Santé', client_count: 32 },
      { sector: 'Finance', client_count: 28 },
      { sector: 'Éducation', client_count: 20 },
      { sector: 'Commerce', client_count: 18 },
      { sector: 'Industrie', client_count: 15 }
    ]
  },
  { 
    id: '3', 
    name: 'Croissance ARR',
    query: 'arr_growth', 
    description: 'Évolution de l\'ARR (Annual Recurring Revenue) par trimestre',
    data: [
      { year: 2023, quarter: 'Q2', arr_value: 5200000 },
      { year: 2023, quarter: 'Q1', arr_value: 4800000 },
      { year: 2022, quarter: 'Q4', arr_value: 4500000 },
      { year: 2022, quarter: 'Q3', arr_value: 4200000 },
      { year: 2022, quarter: 'Q2', arr_value: 3900000 },
      { year: 2022, quarter: 'Q1', arr_value: 3600000 },
      { year: 2021, quarter: 'Q4', arr_value: 3400000 },
      { year: 2021, quarter: 'Q3', arr_value: 3100000 }
    ]
  },
  { 
    id: '4', 
    name: 'Top 10 clients',
    query: 'top_clients',
    description: 'Liste des 10 plus grands clients par valeur',
    data: [
      { client_name: 'TechCorp Inc.', annual_value: 450000 },
      { client_name: 'MediHealth Systems', annual_value: 380000 },
      { client_name: 'Finance Partners', annual_value: 320000 },
      { client_name: 'EduLearn Global', annual_value: 290000 },
      { client_name: 'RetailPro', annual_value: 270000 },
      { client_name: 'Manufacturing Plus', annual_value: 240000 },
      { client_name: 'Creative Solutions', annual_value: 210000 },
      { client_name: 'DataSmart Analytics', annual_value: 190000 },
      { client_name: 'GreenEco Innovations', annual_value: 180000 },
      { client_name: 'TransportationNow', annual_value: 170000 }
    ]
  },
  { 
    id: '5', 
    name: 'Évolution des effectifs',
    query: 'headcount',
    description: 'Évolution du nombre d\'employés par trimestre',
    data: [
      { year: 2023, quarter: 'Q2', headcount: 120 },
      { year: 2023, quarter: 'Q1', headcount: 110 },
      { year: 2022, quarter: 'Q4', headcount: 95 },
      { year: 2022, quarter: 'Q3', headcount: 85 },
      { year: 2022, quarter: 'Q2', headcount: 78 },
      { year: 2022, quarter: 'Q1', headcount: 70 },
      { year: 2021, quarter: 'Q4', headcount: 65 },
      { year: 2021, quarter: 'Q3', headcount: 60 }
    ]
  },
  { 
    id: '6', 
    name: 'Investissements',
    query: 'quarterly_investments',
    description: 'Valeur des investissements par trimestre',
    data: [
      { year: 2023, quarter: 'Q2', investment_value: 1200000 },
      { year: 2023, quarter: 'Q1', investment_value: 950000 },
      { year: 2022, quarter: 'Q4', investment_value: 870000 },
      { year: 2022, quarter: 'Q3', investment_value: 920000 },
      { year: 2022, quarter: 'Q2', investment_value: 780000 },
      { year: 2022, quarter: 'Q1', investment_value: 730000 },
      { year: 2021, quarter: 'Q4', investment_value: 650000 },
      { year: 2021, quarter: 'Q3', investment_value: 580000 }
    ]
  },
  { 
    id: '7', 
    name: 'Total investi',
    query: 'total_investment',
    description: 'Montant total investi dans l\'entreprise',
    data: [
      { category: 'Total', total_amount: 8950000, nb_investments: 45, first_investment: '2021-01-15', last_investment: '2023-06-30' },
      { category: 'Seed', total_amount: 3500000, nb_investments: 12, first_investment: '2021-01-15', last_investment: '2021-08-10' },
      { category: 'Series A', total_amount: 5450000, nb_investments: 33, first_investment: '2021-09-22', last_investment: '2023-06-30' }
    ]
  }
];

// Constante pour décider si on utilise l'appel fetch direct ou les données statiques
const USE_DIRECT_FETCH = true;

const GridControls = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id } = useParams(); // Get the company ID from URL
  const { cols, rowHeight, isDraggable, isResizable } = useSelector((state) => state.layout);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState('1');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queryResults, setQueryResults] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [iframeLoading, setIframeLoading] = useState(false);
  
  // Nouveaux états pour les fonctionnalités avancées
  const [calculatedColumns, setCalculatedColumns] = useState([]);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [pivotColumns, setPivotColumns] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortInfo, setSortInfo] = useState(null);
  const [isCalculationModalVisible, setIsCalculationModalVisible] = useState(false);
  const [newCalculation, setNewCalculation] = useState({
    name: '',
    expression: '',
    format: 'default'
  });
  const [displayData, setDisplayData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  
  // Effet pour définir selectedQuery quand selectedQueryId change
  useEffect(() => {
    const query = PREDEFINED_QUERIES.find(q => q.id === selectedQueryId);
    setSelectedQuery(query);
  }, [selectedQueryId]);

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
      // Traitement spécifique pour les données de "Total investi"
      if (selectedQuery && selectedQuery.query === 'total_investment') {
        // Pour total_investment, utiliser un format simplifié avec category et total_amount
        return data.map(item => ({
          name: item.category,
          value: parseFloat(item.total_amount) || 0
        }));
      }
      
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
    setIframeUrl('');
  };
  
  // Fonction pour ajouter un graphique
  const addGraph = (graphData) => {
    try {
      // Générer un ID unique pour le graphique
      const chartId = `custom_${Date.now()}`;
      
      // Transformer les données pour le graphique selon le type de requête
      let chartData = graphData.data;
      
      // Si c'est la requête "Total investi", alors adapter les données
      if (graphData.query === 'total_investment') {
        chartData = graphData.data.map(item => ({
          name: item.category,
          value: parseFloat(item.total_amount) || 0
        }));
        
        // Forcer le type de graphique en barre pour cette requête
        dispatch(addCustomChart({
          companyId: id,
          chartId,
          chartData: chartData,
          chartType: 'bar',
          title: chartTitle || graphData.title
        }));
      } else {
        // Pour les autres requêtes, utiliser le type de graphique sélectionné
        dispatch(addCustomChart({
          companyId: id,
          chartId,
          chartData: chartData,
          chartType,
          title: chartTitle || graphData.title
        }));
      }
      
      message.success(t('metrics.success.chart_added'));
      closeDrawer();
    } catch (error) {
      console.error('Erreur lors de la création du graphique:', error);
      message.error(t('metrics.errors.cannot_create_chart') + error.message);
    }
  };
  
  // Fonction pour exécuter la requête sélectionnée
  const executeQuery = async () => {
    if (selectedQuery) {
      console.log('Exécution de la requête:', selectedQuery.query);
      
      if (USE_DIRECT_FETCH) {
        // Utiliser un appel fetch direct au backend
        setDataLoading(true);
        setErrorMessage(null);
        
        try {
          const url = `/explorer/data/${id}/${selectedQuery.query}`;
          
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          // Vérifier si la réponse est du JSON valide
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Réponse non-JSON reçue: ${contentType}`);
          }
          
          const data = await response.json();
          
          if (response.ok) {
            if (data.error) {
              setErrorMessage(data.error);
              if (data.details) {
                console.error(data.details);
              }
            } else {
              // Adapter au format de réponse du contrôleur qui encapsule les données dans 'results'
              const results = data.results || data;
              setQueryResults(results);
            }
          } else {
            setErrorMessage(`Erreur ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error);
          setErrorMessage(`Erreur lors du chargement des données: ${error.message}`);
          // En mode développement, utiliser les données statiques en cas d'erreur
          if (selectedQuery && selectedQuery.data) {
            console.log("Utilisation des données statiques en mode fallback");
            setQueryResults(selectedQuery.data);
          }
        } finally {
          setDataLoading(false);
        }
      } else {
        // Utiliser les données statiques (mode développement/démo)
        const staticData = selectedQuery.data || [];
        setQueryResults(staticData);
      }
    }
  };
  
  // Fonction pour ajouter un graphique basé sur les données actuelles
  const addGraphFromCurrentData = () => {
    if (USE_DIRECT_FETCH) {
      if (displayData && displayData.length > 0) {
        // Filtrer les colonnes cachées des données avant de les envoyer au graphique
        const cleanData = displayData.map(item => {
          const cleanItem = { ...item };
          hiddenColumns.forEach(col => {
            delete cleanItem[col];
          });
          return cleanItem;
        });
        
        addGraph({
          title: selectedQuery ? selectedQuery.name : 'Graphique personnalisé',
          description: selectedQuery ? selectedQuery.description || '' : '',
          data: cleanData,
          query: selectedQuery ? selectedQuery.query : 'custom',
        });
        message.success(t('metrics.drawer.graph_added'));
      } else {
        message.error(t('metrics.drawer.no_data'));
      }
    } else {
      // Mode données statiques
      if (selectedQuery && selectedQuery.data && selectedQuery.data.length > 0) {
        // Même pour les données statiques, on respecte les colonnes masquées
        const cleanData = selectedQuery.data.map(item => {
          const cleanItem = { ...item };
          hiddenColumns.forEach(col => {
            delete cleanItem[col];
          });
          return cleanItem;
        });
        
        addGraph({
          title: selectedQuery.name,
          description: selectedQuery.description || '',
          data: cleanData,
          query: selectedQuery.query,
        });
        message.success(t('metrics.drawer.graph_added'));
      } else {
        message.error(t('metrics.drawer.no_data'));
      }
    }
  };

  // Appliquer les transformations (filtres, calculs, pivot) aux données
  useEffect(() => {
    if (queryResults && queryResults.length > 0) {
      let processedData = [...queryResults];
      
      // Appliquer les filtres
      if (filters.length > 0) {
        processedData = processedData.filter(item => {
          return filters.every(filter => {
            const value = item[filter.column];
            switch (filter.operator) {
              case 'equals': return value === filter.value;
              case 'contains': return String(value).includes(filter.value);
              case 'greater': return Number(value) > Number(filter.value);
              case 'less': return Number(value) < Number(filter.value);
              default: return true;
            }
          });
        });
      }
      
      // Ajouter les colonnes calculées
      if (calculatedColumns.length > 0) {
        processedData = processedData.map(item => {
          const newItem = { ...item };
          calculatedColumns.forEach(calc => {
            try {
              // Simple évaluation basique pour la démo
              // Dans un environnement réel, il faudrait utiliser une approche plus sécurisée
              // comme une bibliothèque d'expressions mathématiques
              const evalContext = { ...item };
              // Fonction d'évaluation simplifiée qui utilise uniquement le contexte d'objet
              const evalInContext = (expr) => {
                // Remplacer les noms de colonnes par leur valeur
                let processedExpr = expr;
                Object.keys(evalContext).forEach(key => {
                  const regex = new RegExp(`\\b${key}\\b`, 'g');
                  processedExpr = processedExpr.replace(regex, `evalContext["${key}"]`);
                });
                return new Function('evalContext', `return ${processedExpr}`)(evalContext);
              };
              
              newItem[calc.name] = evalInContext(calc.expression);
            } catch (error) {
              console.error(`Erreur dans le calcul de la colonne ${calc.name}:`, error);
              newItem[calc.name] = 'Error';
            }
          });
          return newItem;
        });
      }
      
      // Appliquer le tri
      if (sortInfo) {
        processedData.sort((a, b) => {
          const valueA = a[sortInfo.column];
          const valueB = b[sortInfo.column];
          
          // Tri numérique ou alphabétique selon le type de données
          if (typeof valueA === 'number' && typeof valueB === 'number') {
            return sortInfo.order === 'ascend' ? valueA - valueB : valueB - valueA;
          } else {
            const strA = String(valueA || '');
            const strB = String(valueB || '');
            return sortInfo.order === 'ascend' 
              ? strA.localeCompare(strB) 
              : strB.localeCompare(strA);
          }
        });
      }
      
      // Appliquer le pivot
      if (pivotColumns.length > 0) {
        // Implémentation simplifiée de pivot - créer un tableau pivotant
        const pivotColumn = pivotColumns[0]; // Pour simplifier, on ne gère qu'un seul pivot
        
        if (pivotColumn) {
          // Obtenir les valeurs uniques de la colonne pivot
          const pivotValues = Array.from(new Set(processedData.map(item => item[pivotColumn])));
          
          // Créer un nouvel ensemble de données pivotées
          const pivotedData = [];
          
          // Détecter une colonne de valeur appropriée (numérique de préférence)
          const valueKeys = Object.keys(processedData[0]).filter(key => 
            typeof processedData[0][key] === 'number' && key !== pivotColumn
          );
          
          const valueColumn = valueKeys.length > 0 ? valueKeys[0] : Object.keys(processedData[0])[0];
          
          // Créer des groupes basés sur les autres colonnes
          const groupByColumns = Object.keys(processedData[0])
            .filter(key => key !== pivotColumn && key !== valueColumn);
          
          // Fonction pour créer une clé de groupe
          const getGroupKey = (item, columns) => {
            return columns.map(col => `${col}:${item[col]}`).join('|');
          };
          
          // Grouper les données
          const groupedData = {};
          processedData.forEach(item => {
            const groupKey = getGroupKey(item, groupByColumns);
            const pivotValue = item[pivotColumn];
            const value = item[valueColumn];
            
            if (!groupedData[groupKey]) {
              groupedData[groupKey] = { 
                // Ajouter les colonnes de regroupement au nouvel objet
                ...groupByColumns.reduce((obj, col) => {
                  obj[col] = item[col];
                  return obj;
                }, {})
              };
            }
            
            // Ajouter la valeur pivotée
            groupedData[groupKey][`${pivotValue}_${valueColumn}`] = value;
          });
          
          // Convertir l'objet groupé en tableau
          Object.values(groupedData).forEach(group => {
            pivotedData.push(group);
          });
          
          // Mettre à jour les données si pivot appliqué
          if (pivotedData.length > 0) {
            processedData = pivotedData;
          }
        }
      }
      
      setDisplayData(processedData);
      
      // Mettre à jour les colonnes de la table
      if (processedData.length > 0) {
        const allColumns = Object.keys(processedData[0]).map(key => {
          const isHidden = hiddenColumns.includes(key);
          const isPivot = pivotColumns.includes(key);
          const calculatedColumn = calculatedColumns.find(c => c.name === key);
          
          return {
            title: (
              <div>
                <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                {isPivot && <TableOutlined style={{ marginLeft: 5, color: '#1890ff' }} />}
                {isHidden && <EyeInvisibleOutlined style={{ marginLeft: 5, color: '#ff4d4f' }} />}
                {calculatedColumn && <span style={{ marginLeft: 5, color: '#722ed1' }}>ƒ</span>}
              </div>
            ),
            dataIndex: key,
            key: key,
            sorter: true,
            sortOrder: sortInfo && sortInfo.column === key ? sortInfo.order : null,
            render: (text, record) => {
              // Formatage selon le type de colonne
              if (calculatedColumn) {
                switch (calculatedColumn.format) {
                  case 'percentage':
                    return `${(text * 100).toFixed(2)}%`;
                  case 'currency':
                    return text >= 1000000 
                      ? `${(text/1000000).toFixed(2)} M€` 
                      : `${(text/1000).toFixed(0)} €`;
                  default:
                    return text;
                }
              }
              
              // Formatage par défaut pour les nombres monétaires
              if (typeof text === 'number' && (
                key.includes('revenue') || 
                key.includes('value') || 
                key.includes('amount')
              )) {
                return text >= 1000000 
                  ? `${(text/1000000).toFixed(2)} M€` 
                  : `${(text/1000).toFixed(0)} K€`;
              }
              
              return text;
            },
            onHeaderCell: column => ({
              onClick: () => handleColumnHeaderClick(key)
            }),
            hidden: isHidden
          };
        }).filter(col => !col.hidden);
        
        setTableColumns(allColumns);
      }
    } else {
      setDisplayData([]);
      setTableColumns([]);
    }
  }, [queryResults, calculatedColumns, hiddenColumns, pivotColumns, filters, sortInfo]);
  
  // Gérer le clic sur l'en-tête de colonne (tri)
  const handleColumnHeaderClick = (columnKey) => {
    if (sortInfo && sortInfo.column === columnKey) {
      // Basculer l'ordre ou supprimer le tri
      if (sortInfo.order === 'ascend') {
        setSortInfo({ column: columnKey, order: 'descend' });
      } else {
        setSortInfo(null);
      }
    } else {
      // Nouveau tri
      setSortInfo({ column: columnKey, order: 'ascend' });
    }
  };
  
  // Gérer le clic sur le bouton d'ajout de colonne calculée
  const handleAddCalculatedColumn = () => {
    setIsCalculationModalVisible(true);
  };
  
  // Sauvegarder la nouvelle colonne calculée
  const handleSaveCalculation = () => {
    if (!newCalculation.name.trim() || !newCalculation.expression.trim()) {
      message.error('Le nom et l\'expression sont requis');
      return;
    }
    
    setCalculatedColumns([
      ...calculatedColumns, 
      { ...newCalculation }
    ]);
    
    setIsCalculationModalVisible(false);
    setNewCalculation({ name: '', expression: '', format: 'default' });
    message.success('Colonne calculée ajoutée');
  };
  
  // Gérer l'affichage/masquage d'une colonne
  const toggleColumnVisibility = (columnKey) => {
    if (hiddenColumns.includes(columnKey)) {
      setHiddenColumns(hiddenColumns.filter(key => key !== columnKey));
    } else {
      setHiddenColumns([...hiddenColumns, columnKey]);
    }
  };
  
  // Gérer le pivot d'une colonne
  const toggleColumnPivot = (columnKey) => {
    if (pivotColumns.includes(columnKey)) {
      setPivotColumns(pivotColumns.filter(key => key !== columnKey));
    } else {
      setPivotColumns([...pivotColumns, columnKey]);
    }
  };
  
  // Ajouter un filtre
  const addFilter = (column, operator, value) => {
    setFilters([...filters, { column, operator, value }]);
  };
  
  // Supprimer un filtre
  const removeFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };
  
  // Rendu du menu contextuel pour les colonnes
  const getColumnMenu = (columnKey) => (
    <Menu>
      <Menu.Item 
        key="toggle-visibility" 
        icon={<EyeInvisibleOutlined />}
        onClick={() => toggleColumnVisibility(columnKey)}
      >
        {hiddenColumns.includes(columnKey) 
          ? 'Afficher dans la visualisation' 
          : 'Masquer dans la visualisation'}
      </Menu.Item>
      <Menu.Item 
        key="toggle-pivot" 
        icon={<TableOutlined />}
        onClick={() => toggleColumnPivot(columnKey)}
      >
        {pivotColumns.includes(columnKey) 
          ? 'Supprimer le pivot' 
          : 'Pivoter cette colonne'}
      </Menu.Item>
      <Menu.SubMenu key="filter" icon={<FilterOutlined />} title="Filtrer">
        <Menu.Item key="filter-equals" onClick={() => {
          const value = prompt(`Filtrer ${columnKey} égal à:`);
          if (value !== null) addFilter(columnKey, 'equals', value);
        }}>
          Égal à...
        </Menu.Item>
        <Menu.Item key="filter-contains" onClick={() => {
          const value = prompt(`Filtrer ${columnKey} contient:`);
          if (value !== null) addFilter(columnKey, 'contains', value);
        }}>
          Contient...
        </Menu.Item>
        <Menu.Item key="filter-greater" onClick={() => {
          const value = prompt(`Filtrer ${columnKey} supérieur à:`);
          if (value !== null) addFilter(columnKey, 'greater', value);
        }}>
          Supérieur à...
        </Menu.Item>
        <Menu.Item key="filter-less" onClick={() => {
          const value = prompt(`Filtrer ${columnKey} inférieur à:`);
          if (value !== null) addFilter(columnKey, 'less', value);
        }}>
          Inférieur à...
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item key="sort-asc" icon={<SortAscendingOutlined />} onClick={() => setSortInfo({ column: columnKey, order: 'ascend' })}>
        Trier croissant
      </Menu.Item>
      <Menu.Item key="sort-desc" icon={<SortDescendingOutlined />} onClick={() => setSortInfo({ column: columnKey, order: 'descend' })}>
        Trier décroissant
      </Menu.Item>
    </Menu>
  );

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
            <Button type="primary" onClick={executeQuery} loading={dataLoading}>
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
          >
            {PREDEFINED_QUERIES.map(query => (
              <Option key={query.id} value={query.id}>{t('queries.' + query.id, query.name)}</Option>
            ))}
          </Select>
          
          <div className="bg-gray-50 p-3 rounded mt-2">
            <Text type="secondary">{t('queries.descriptions.' + selectedQuery?.id, selectedQuery?.description)}</Text>
          </div>
        </div>
        
        <div>
          <h4 className="mb-2 font-medium">{t('metrics.drawer.results')}</h4>
          
          {USE_DIRECT_FETCH ? (
            <div className="data-results-container" style={{ minHeight: '300px', position: 'relative' }}>
              {dataLoading && (
                <div className="flex justify-center items-center absolute inset-0 bg-white bg-opacity-80 z-10">
                  <Spin>
                    <div className="p-5">{t('common.loading')}</div>
                  </Spin>
                </div>
              )}
              
              {errorMessage ? (
                <div className="error-message p-4 border border-red-300 rounded bg-red-50">
                  <Text type="danger">{errorMessage}</Text>
                </div>
              ) : queryResults && queryResults.length > 0 ? (
                <div>
                  {/* Barre d'outils pour les fonctionnalités avancées */}
                  <div className="table-toolbar mb-3 flex justify-between items-center">
                    <div className="toolbar-left flex items-center">
                      <Button 
                        type="primary" 
                        ghost 
                        icon={<PlusOutlined />} 
                        size="small"
                        onClick={handleAddCalculatedColumn}
                        className="mr-2"
                      >
                        Ajouter une colonne
                      </Button>
                      
                      <Dropdown 
                        overlay={
                          <Menu>
                            {Object.keys(queryResults[0] || {}).map(key => (
                              <Menu.Item key={key} onClick={() => toggleColumnPivot(key)}>
                                {pivotColumns.includes(key) ? '✓ ' : ''}{key}
                              </Menu.Item>
                            ))}
                          </Menu>
                        }
                      >
                        <Button 
                          ghost 
                          icon={<TableOutlined />}
                          size="small"
                          className="mr-2"
                        >
                          Pivot <DownOutlined />
                        </Button>
                      </Dropdown>
                      
                      <Dropdown
                        overlay={
                          <Menu>
                            {Object.keys(queryResults[0] || {}).map(key => (
                              <Menu.Item key={key} onClick={() => toggleColumnVisibility(key)}>
                                {hiddenColumns.includes(key) ? '❌ ' : '✓ '}{key}
                              </Menu.Item>
                            ))}
                          </Menu>
                        }
                      >
                        <Button 
                          ghost 
                          icon={<EyeInvisibleOutlined />}
                          size="small"
                        >
                          Visibilité <DownOutlined />
                        </Button>
                      </Dropdown>
                    </div>
                    
                    <div className="toolbar-right">
                      {sortInfo && (
                        <Tag 
                          color="blue" 
                          closable 
                          onClose={() => setSortInfo(null)}
                        >
                          <SortAscendingOutlined /> Tri: {sortInfo.column} ({sortInfo.order === 'ascend' ? '↑' : '↓'})
                        </Tag>
                      )}
                      
                      {filters.map((filter, index) => (
                        <Tag 
                          key={index} 
                          color="purple" 
                          closable 
                          onClose={() => removeFilter(index)}
                        >
                          <FilterOutlined /> {filter.column} {filter.operator} "{filter.value}"
                        </Tag>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tableau de données avec colonnes enrichies */}
                  <div className="overflow-auto max-h-96">
                    <Table 
                      dataSource={displayData} 
                      columns={tableColumns.map(col => ({
                        ...col,
                        title: (
                          <Dropdown overlay={getColumnMenu(col.dataIndex)} trigger={['click']}>
                            <div className="column-header cursor-pointer flex items-center">
                              {col.title} <SettingOutlined className="ml-1" />
                            </div>
                          </Dropdown>
                        ),
                      }))}
                      rowKey={(record, index) => index}
                      pagination={false}
                      size="small"
                      bordered
                      onChange={(pagination, filters, sorter) => {
                        if (sorter) {
                          setSortInfo({
                            column: sorter.field,
                            order: sorter.order
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="no-data-message p-4 text-center text-gray-500">
                  {t('metrics.drawer.execute_query')}
                </div>
              )}
            </div>
          ) : (
            // Mode données statiques
            <div className="overflow-auto max-h-96">
              {selectedQuery && selectedQuery.data ? (
                <Table 
                  dataSource={selectedQuery.data} 
                  columns={
                    Object.keys(selectedQuery.data[0] || {}).map(key => ({
                      title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                      dataIndex: key,
                      key: key,
                    }))
                  }
                  rowKey={(record, index) => index}
                  pagination={false}
                  size="small"
                  bordered
                />
              ) : (
                <div className="no-data-message p-4 text-center text-gray-500">
                  {t('metrics.drawer.select_and_execute')}
                </div>
              )}
            </div>
          )}
        </div>
        
        {(queryResults.length > 0 || iframeUrl) && (
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
              {selectedQuery && selectedQuery.query === 'total_investment' ? (
                <div>
                  <Radio.Group value="bar" disabled>
                    <Radio.Button value="bar">{t('metrics.chart_types.bar')}</Radio.Button>
                  </Radio.Group>
                  <Text type="secondary" className="ml-2 text-xs">
                    {t('metrics.type_fixed_for_total_investment', 'Graphique en barres recommandé pour cette visualisation')}
                  </Text>
                </div>
              ) : (
                <Radio.Group onChange={(e) => setChartType(e.target.value)} value={chartType}>
                  <Radio.Button value="bar">{t('metrics.chart_types.bar')}</Radio.Button>
                  <Radio.Button value="line">{t('metrics.chart_types.line')}</Radio.Button>
                  <Radio.Button value="area">{t('metrics.chart_types.area')}</Radio.Button>
                  <Radio.Button value="pie">{t('metrics.chart_types.pie')}</Radio.Button>
                </Radio.Group>
              )}
            </div>
            
            <Button type="primary" onClick={addGraphFromCurrentData}>
              {t('metrics.drawer.add_chart_button')}
            </Button>
          </div>
        )}
      </Drawer>

      {/* Ajouter la modale pour les colonnes calculées */}
      <Modal
        title="Créer une colonne calculée"
        visible={isCalculationModalVisible}
        onOk={handleSaveCalculation}
        onCancel={() => setIsCalculationModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item 
            label="Nom de la colonne" 
            required
            tooltip="Ce nom sera utilisé comme en-tête de colonne"
          >
            <Input 
              value={newCalculation.name}
              onChange={e => setNewCalculation({...newCalculation, name: e.target.value})}
              placeholder="ex: Marge brute"
            />
          </Form.Item>
          
          <Form.Item 
            label="Expression" 
            required
            tooltip="Vous pouvez utiliser les noms des autres colonnes comme variables"
          >
            <Input.TextArea 
              value={newCalculation.expression}
              onChange={e => setNewCalculation({...newCalculation, expression: e.target.value})}
              placeholder="ex: revenue * 0.7"
              rows={4}
            />
          </Form.Item>
          
          <Form.Item label="Format d'affichage">
            <Select
              value={newCalculation.format}
              onChange={value => setNewCalculation({...newCalculation, format: value})}
            >
              <Option value="default">Par défaut</Option>
              <Option value="percentage">Pourcentage</Option>
              <Option value="currency">Devise (€)</Option>
            </Select>
          </Form.Item>
          
          <div className="text-xs text-gray-500 mb-4">
            <p className="font-medium mb-1">Colonnes disponibles:</p>
            <div className="grid grid-cols-3 gap-2">
              {queryResults && queryResults.length > 0 && 
                Object.keys(queryResults[0]).map(key => (
                  <Tag key={key} color="blue" onClick={() => {
                    const expr = newCalculation.expression + ` ${key}`;
                    setNewCalculation({...newCalculation, expression: expr});
                  }} className="cursor-pointer">
                    {key}
                  </Tag>
                ))
              }
            </div>
            <p className="mt-2">Opérateurs: +, -, *, /, {'>'}, {'<'}, ==, !=, &&, ||, ?</p>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default GridControls; 