import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Drawer,
  Button,
  Table,
  Select,
  Space,
  Tooltip,
  Typography,
  Radio,
  Input,
  message,
  Spin,
  Menu,
  Dropdown,
  Modal,
  Form,
  Switch,
  Tag,
  Popconfirm,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { updateCols, addCustomChart } from '../../../redux/slices/layoutSlice';
import {
  DownOutlined,
  FilterOutlined,
  SettingOutlined,
  PlusOutlined,
  EyeInvisibleOutlined,
  TableOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
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
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getAllCompanies } from '@/services/company/companyService';
import '../../../../css/components/metrics.css';

const { Option } = Select;
const { Text } = Typography;

// Palettes de couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF'];

// Liste des requêtes disponibles (récupérées depuis le backend)
const AVAILABLE_QUERIES = [
  { id: 'monthly_revenue', name: 'Revenus par période' },
  { id: 'clients_by_sector', name: 'Portefeuille par secteur' },
  { id: 'burn_rate_evolution', name: 'Évolution Argent brûlé' },
  { id: 'top_clients', name: 'Top investissements' },
  { id: 'headcount', name: "Évolution nombre d'employés" },
  { id: 'quarterly_investments', name: 'Investissements trimestriels' },
  { id: 'total_investment', name: 'Synthèse investissements' },
  { id: 'kpi_analysis_by_period', name: 'Analyse KPI globale' },
];

const GridControls = ({
  drawerOpen,
  onShowDrawer,
  onCloseDrawer,
  ...props
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id } = useParams(); // Get the company ID from URL
  const { cols } = useSelector(state => state.layout);
  const [selectedQueryId, setSelectedQueryId] = useState('monthly_revenue');
  const [queryResults, setQueryResults] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [chartTitle, setChartTitle] = useState('');

  // Nouveaux états pour les fonctionnalités avancées
  const [calculatedColumns, setCalculatedColumns] = useState([]);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [pivotColumns, setPivotColumns] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortInfo, setSortInfo] = useState(null);
  const [isCalculationModalVisible, setIsCalculationModalVisible] =
    useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [originalColumnName, setOriginalColumnName] = useState('');
  const [newCalculation, setNewCalculation] = useState({
    name: '',
    expression: '',
    format: 'default',
    externalSource: false,
    externalCompanyId: null,
  });
  const [displayData, setDisplayData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);

  // Nouveaux états pour la personnalisation du graphique
  const [selectedXAxis, setSelectedXAxis] = useState('');
  const [selectedYAxes, setSelectedYAxes] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  // Nouveaux états pour la gestion des entreprises externes
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Effet pour charger la liste des entreprises
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const data = await getAllCompanies();
        // Filtrer pour ne pas inclure l'entreprise courante
        const filteredCompanies = data.filter(
          company => company.id !== parseInt(id),
        );
        setCompanies(filteredCompanies);
      } catch (error) {
        console.error('Erreur lors de la récupération des entreprises:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    // Charger les entreprises uniquement lorsque le modal est ouvert
    if (isCalculationModalVisible) {
      fetchCompanies();
    }
  }, [isCalculationModalVisible, id]);

  const handleQueryChange = value => {
    setSelectedQueryId(value);
    setQueryResults([]);
    setErrorMessage(null);
  };

  // Fonction pour déterminer les colonnes numériques pour l'axe Y
  const getNumericColumns = data => {
    if (!data || data.length === 0) return [];

    const result = [];
    const firstItem = data[0];

    Object.keys(firstItem).forEach(key => {
      // Vérifier si c'est une colonne numérique
      const isNumeric =
        typeof firstItem[key] === 'number' ||
        (typeof firstItem[key] === 'string' &&
          !isNaN(parseFloat(firstItem[key])));

      if (isNumeric) {
        result.push(key);
      }
    });

    return result;
  };

  // Fonction pour déterminer les colonnes potentielles pour l'axe X
  const getNonNumericColumns = data => {
    if (!data || data.length === 0) return [];

    const result = [];
    const firstItem = data[0];

    Object.keys(firstItem).forEach(key => {
      // Ajouter toutes les colonnes comme potentielles colonnes X (même numériques)
      // car on peut vouloir un axe X numérique
      result.push(key);
    });

    return result;
  };

  // Effet pour mettre à jour la prévisualisation quand les paramètres changent
  useEffect(() => {
    if (
      displayData &&
      displayData.length > 0 &&
      selectedXAxis &&
      selectedYAxes.length > 0
    ) {
      // Préparer les données pour la prévisualisation
      const formattedData = displayData.map(item => {
        const newItem = { name: item[selectedXAxis] };

        selectedYAxes.forEach(yAxis => {
          if (item[yAxis] !== undefined) {
            newItem[yAxis] = parseFloat(item[yAxis]) || 0;
          }
        });

        return newItem;
      });

      setPreviewData(formattedData);
    }
  }, [displayData, selectedXAxis, selectedYAxes, chartType]);

  // Effet pour définir les axes par défaut quand les données changent
  useEffect(() => {
    if (displayData && displayData.length > 0) {
      const nonNumericCols = getNonNumericColumns(displayData);
      const numericCols = getNumericColumns(displayData);

      // Définir l'axe X par défaut (priorité aux colonnes non numériques)
      if (nonNumericCols.length > 0) {
        // Chercher d'abord des colonnes qui sont généralement utilisées comme axe X
        const commonXColumns = [
          'month',
          'year',
          'quarter',
          'name',
          'sector',
          'client_name',
          'category',
          'period',
        ];
        const defaultX =
          nonNumericCols.find(col =>
            commonXColumns.some(name => col.includes(name)),
          ) || nonNumericCols[0];
        setSelectedXAxis(defaultX);
      }

      // Définir l'axe Y par défaut (première colonne numérique)
      if (numericCols.length > 0) {
        setSelectedYAxes([numericCols[0]]);
      }
    }
  }, [displayData]);

  // Fonction pour ajouter un graphique
  const addGraph = graphData => {
    try {
      // Générer un ID unique pour le graphique
      const chartId = `custom_${Date.now()}`;

      // S'assurer que la structure de données correspond exactement à celle utilisée dans la prévisualisation
      // et inclut uniquement les colonnes sélectionnées pour X et Y
      const finalChartData = graphData.data.map(item => {
        const newItem = {};
        // Conserver la propriété "name" qui est utilisée pour l'axe X
        newItem.name = item.name;

        // N'inclure que les colonnes Y sélectionnées
        selectedYAxes.forEach(yAxis => {
          if (item[yAxis] !== undefined) {
            newItem[yAxis] = item[yAxis];
          }
        });

        return newItem;
      });

      // Transmettre les données avec le type spécifié, en conservant exactement le même format
      dispatch(
        addCustomChart({
          companyId: id,
          chartId,
          chartData: finalChartData,
          chartType: graphData.type || chartType,
          title: chartTitle || graphData.title,
          columnsMetadata: graphData.columnsMetadata || {}, // Ajouter les métadonnées des colonnes
          // Ajouter des informations supplémentaires pour garantir la cohérence
          xAxisKey: selectedXAxis,
          yAxisKeys: selectedYAxes,
        }),
      );

      message.success(t('metrics.success.chart_added'));
      onCloseDrawer();
    } catch (error) {
      console.error('Erreur lors de la création du graphique:', error);
      message.error(t('metrics.errors.cannot_create_chart') + error.message);
    }
  };

  // Fonction pour exécuter la requête sélectionnée
  const executeQuery = async () => {
    if (!selectedQueryId) {
      message.error(t('metrics.drawer.select_query_first'));
      return;
    }

    setDataLoading(true);
    setErrorMessage(null);

    try {
      const url = `/explorer/data/${id}/${selectedQueryId}`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
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
      console.error('Erreur lors du chargement des données:', error);
      setErrorMessage(
        `Erreur lors du chargement des données: ${error.message}`,
      );
    } finally {
      setDataLoading(false);
    }
  };

  // Fonction pour ajouter un graphique basé sur les données actuelles
  const addGraphFromCurrentData = () => {
    if (
      displayData &&
      displayData.length > 0 &&
      selectedXAxis &&
      selectedYAxes.length > 0
    ) {
      // Préparer les données pour le graphique avec les axes sélectionnés
      const chartData = displayData.map(item => {
        const newItem = { name: item[selectedXAxis] };

        selectedYAxes.forEach(yAxis => {
          if (item[yAxis] !== undefined) {
            newItem[yAxis] = parseFloat(item[yAxis]) || 0;
          }
        });

        return newItem;
      });

      // Créer un objet metadata pour identifier les colonnes calculées
      const columnsMetadata = {};

      // Identifier les colonnes calculées sélectionnées
      calculatedColumns.forEach(calc => {
        if (selectedYAxes.includes(calc.name)) {
          columnsMetadata[calc.name] = {
            isCalculated: true,
            format: calc.format,
            expression: calc.expression,
          };
        }
      });

      const queryName =
        AVAILABLE_QUERIES.find(q => q.id === selectedQueryId)?.name ||
        'Graphique personnalisé';

      addGraph({
        title: chartTitle || queryName,
        description: `Données de ${queryName}`,
        data: chartData,
        query: selectedQueryId,
        columnsMetadata: columnsMetadata, // Ajouter les métadonnées des colonnes
        type: chartType, // Spécifier le type de graphique sélectionné
      });
      message.success(t('metrics.drawer.graph_added'));
    } else {
      message.error(t('metrics.drawer.missing_axes'));
    }
  };

  // Étendre les opérateurs de filtre pour les colonnes calculées
  const addFilter = (column, operator, value) => {
    // Vérifier si la colonne est une colonne calculée ou externe
    const isCalculated = calculatedColumns.some(calc => calc.name === column);

    // Convertir la valeur en nombre si nécessaire et possible
    let processedValue = value;
    if (
      operator === 'greater' ||
      operator === 'less' ||
      operator === 'equals_number'
    ) {
      processedValue = !isNaN(Number(value)) ? Number(value) : value;
    }

    // Ajouter des métadonnées sur le type de colonne pour un filtrage optimal
    setFilters([
      ...filters,
      {
        column,
        operator,
        value: processedValue,
        isCalculated: isCalculated,
        columnType: isCalculated
          ? calculatedColumns.find(calc => calc.name === column)?.format ||
            'default'
          : 'default',
      },
    ]);
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

            // Si la valeur est undefined ou null, appliquer une logique spéciale
            if (value === undefined || value === null) {
              // Pour l'opérateur 'equals', true si la valeur du filtre est également vide
              if (
                filter.operator === 'equals' &&
                (filter.value === '' || filter.value === null)
              ) {
                return true;
              }
              // Pour les autres opérateurs, une valeur manquante ne correspond pas au filtre
              return false;
            }

            // Logique de filtrage améliorée
            switch (filter.operator) {
              case 'equals':
                // Si les deux valeurs sont numériques, comparer les nombres
                if (typeof value === 'number' && !isNaN(Number(filter.value))) {
                  return Number(value) === Number(filter.value);
                }
                // Sinon comparer les chaînes de caractères
                return (
                  String(value).toLowerCase() ===
                  String(filter.value).toLowerCase()
                );

              case 'equals_number':
                return Number(value) === Number(filter.value);

              case 'not_equals':
                // Si les deux valeurs sont numériques, comparer les nombres
                if (typeof value === 'number' && !isNaN(Number(filter.value))) {
                  return Number(value) !== Number(filter.value);
                }
                // Sinon comparer les chaînes de caractères
                return (
                  String(value).toLowerCase() !==
                  String(filter.value).toLowerCase()
                );

              case 'contains':
                return String(value)
                  .toLowerCase()
                  .includes(String(filter.value).toLowerCase());

              case 'not_contains':
                return !String(value)
                  .toLowerCase()
                  .includes(String(filter.value).toLowerCase());

              case 'greater':
                return Number(value) > Number(filter.value);

              case 'greater_equal':
                return Number(value) >= Number(filter.value);

              case 'less':
                return Number(value) < Number(filter.value);

              case 'less_equal':
                return Number(value) <= Number(filter.value);

              case 'between':
                if (Array.isArray(filter.value) && filter.value.length === 2) {
                  const [min, max] = filter.value;
                  return (
                    Number(value) >= Number(min) && Number(value) <= Number(max)
                  );
                }
                return true;

              case 'starts_with':
                return String(value)
                  .toLowerCase()
                  .startsWith(String(filter.value).toLowerCase());

              case 'ends_with':
                return String(value)
                  .toLowerCase()
                  .endsWith(String(filter.value).toLowerCase());

              default:
                return true;
            }
          });
        });
      }

      // Ajouter les colonnes calculées
      if (calculatedColumns.length > 0) {
        processedData = processedData.map((item, index) => {
          const newItem = { ...item };

          calculatedColumns.forEach(calc => {
            try {
              if (calc.isExternal) {
                // Pour les colonnes provenant de sources externes
                // Récupérer la valeur correspondante dans les données externes
                const externalDataEntry =
                  calc.externalData &&
                  calc.externalData[index % calc.externalData.length];

                if (externalDataEntry) {
                  // Choisir la première valeur numérique disponible dans l'objet de données externes
                  const numericKeys = Object.keys(externalDataEntry).filter(
                    key =>
                      typeof externalDataEntry[key] === 'number' ||
                      (typeof externalDataEntry[key] === 'string' &&
                        !isNaN(externalDataEntry[key])),
                  );

                  if (numericKeys.length > 0) {
                    newItem[calc.name] = parseFloat(
                      externalDataEntry[numericKeys[0]],
                    );
                  } else {
                    newItem[calc.name] = 0;
                  }
                } else {
                  newItem[calc.name] = 0;
                }
              } else {
                // Code existant pour les colonnes calculées normales
                const evalContext = { ...item };

                // Convertir les chaînes numériques en nombres pour le calcul
                Object.keys(evalContext).forEach(key => {
                  if (
                    typeof evalContext[key] === 'string' &&
                    !isNaN(evalContext[key])
                  ) {
                    evalContext[key] = parseFloat(evalContext[key]);
                  }
                });

                // Fonction d'évaluation simplifiée qui utilise uniquement le contexte d'objet
                const evalInContext = expr => {
                  // Remplacer les noms de colonnes par leur valeur
                  let processedExpr = expr;
                  Object.keys(evalContext).forEach(key => {
                    const regex = new RegExp(`\\b${key}\\b`, 'g');
                    processedExpr = processedExpr.replace(
                      regex,
                      `evalContext["${key}"]`,
                    );
                  });

                  try {
                    const result = new Function(
                      'evalContext',
                      `return ${processedExpr}`,
                    )(evalContext);
                    // S'assurer que le résultat est un nombre valide
                    return isNaN(result) ? 0 : result;
                  } catch (error) {
                    console.error("Erreur d'évaluation:", error);
                    return 0;
                  }
                };

                newItem[calc.name] = evalInContext(calc.expression);
              }
            } catch (error) {
              console.error(
                `Erreur dans le calcul de la colonne ${calc.name}:`,
                error,
              );
              newItem[calc.name] = 0; // Utiliser 0 au lieu de 'Error' pour garantir un nombre
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
            return sortInfo.order === 'ascend'
              ? valueA - valueB
              : valueB - valueA;
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
          // Créer un nouvel ensemble de données pivotées
          const pivotedData = [];

          // Détecter une colonne de valeur appropriée (numérique de préférence)
          const valueKeys = Object.keys(processedData[0]).filter(
            key =>
              typeof processedData[0][key] === 'number' && key !== pivotColumn,
          );

          const valueColumn =
            valueKeys.length > 0
              ? valueKeys[0]
              : Object.keys(processedData[0])[0];

          // Créer des groupes basés sur les autres colonnes
          const groupByColumns = Object.keys(processedData[0]).filter(
            key => key !== pivotColumn && key !== valueColumn,
          );

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
                }, {}),
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
        const allColumns = Object.keys(processedData[0])
          .map(key => {
            const isHidden = hiddenColumns.includes(key);
            const isPivot = pivotColumns.includes(key);
            const calculatedColumn = calculatedColumns.find(
              c => c.name === key,
            );

            return {
              title: (
                <div className="grid-controls-header">
                  <div>
                    <span>
                      {key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    {isPivot && (
                      <TableOutlined className="grid-controls-icon grid-controls-icon-primary" />
                    )}
                    {isHidden && (
                      <EyeInvisibleOutlined className="grid-controls-icon grid-controls-icon-danger" />
                    )}
                    {calculatedColumn && (
                      <span className="grid-controls-icon grid-controls-icon-purple">
                        ƒ
                      </span>
                    )}
                  </div>
                  {calculatedColumn && (
                    <div className="grid-controls-actions">
                      <Tooltip title={t('data_explorer.edit_column')}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={e => {
                            e.stopPropagation();
                            editCalculatedColumn(key);
                          }}
                          className="grid-controls-action-btn"
                        />
                      </Tooltip>
                      <Tooltip title={t('data_explorer.delete_column')}>
                        <Popconfirm
                          title={t('data_explorer.confirm_delete_column')}
                          description={t('data_explorer.delete_column_warning')}
                          onConfirm={e => {
                            e.stopPropagation();
                            removeCalculatedColumn(key);
                          }}
                          okText={t('common.yes')}
                          cancelText={t('common.no')}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={e => e.stopPropagation()}
                            className="grid-controls-action-btn grid-controls-action-btn-danger"
                          />
                        </Popconfirm>
                      </Tooltip>
                    </div>
                  )}
                </div>
              ),
              dataIndex: key,
              key: key,
              sorter: true,
              sortOrder:
                sortInfo && sortInfo.column === key ? sortInfo.order : null,
              render: text => {
                // Formatage selon le type de colonne
                if (calculatedColumn) {
                  // S'assurer que la valeur est un nombre
                  const numValue =
                    typeof text === 'number' ? text : parseFloat(text) || 0;

                  switch (calculatedColumn.format) {
                    case 'percentage':
                      return `${(numValue * 100).toFixed(2)}%`;
                    case 'currency':
                      return numValue >= 1000000
                        ? `${(numValue / 1000000).toFixed(2)} M€`
                        : `${(numValue / 1000).toFixed(0)} €`;
                    default:
                      return typeof numValue === 'number' ? numValue : text;
                  }
                }

                // Formatage par défaut pour les nombres monétaires
                if (
                  typeof text === 'number' &&
                  (key.includes('revenue') ||
                    key.includes('value') ||
                    key.includes('amount'))
                ) {
                  return text >= 1000000
                    ? `${(text / 1000000).toFixed(2)} M€`
                    : `${(text / 1000).toFixed(0)} K€`;
                }

                return text;
              },
              onHeaderCell: column => ({
                onClick: () => handleColumnHeaderClick(column.dataIndex),
              }),
              hidden: isHidden,
            };
          })
          .filter(col => !col.hidden);

        setTableColumns(allColumns);
      }
    } else {
      setDisplayData([]);
      setTableColumns([]);
    }
  }, [
    queryResults,
    calculatedColumns,
    hiddenColumns,
    pivotColumns,
    filters,
    sortInfo,
  ]);

  // Gérer le clic sur l'en-tête de colonne (tri)
  const handleColumnHeaderClick = columnKey => {
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
    setIsEditingColumn(false);
    setOriginalColumnName('');
    setNewCalculation({
      name: '',
      expression: '',
      format: 'default',
      externalSource: false,
      externalCompanyId: null,
    });
    setIsCalculationModalVisible(true);
  };

  // Modifier handleSaveCalculation pour gérer les sources externes (RESTAURÉ)
  const handleSaveCalculation = async () => {
    if (!newCalculation.name.trim()) {
      message.error(t('data_explorer.name_required'));
      return;
    }

    // Si c'est une source externe mais aucune entreprise n'est sélectionnée
    if (newCalculation.externalSource && !newCalculation.externalCompanyId) {
      message.error(t('data_explorer.company_required'));
      return;
    }

    // Si c'est une source externe, charger les données
    if (newCalculation.externalSource && newCalculation.externalCompanyId) {
      try {
        // Utiliser la même requête que celle sélectionnée actuellement
        const queryId = selectedQueryId;
        const externalData = await fetchExternalCompanyData(
          newCalculation.externalCompanyId,
          queryId,
        );

        if (!externalData || externalData.length === 0) {
          message.error(t('data_explorer.no_external_data'));
          return;
        }

        // Vérifier si on édite une colonne existante ou on en ajoute une nouvelle
        const existingColumnIndex = isEditingColumn
          ? calculatedColumns.findIndex(
              calc => calc.name === originalColumnName,
            )
          : -1;

        if (existingColumnIndex !== -1) {
          // Modifier la colonne existante
          const updatedColumns = [...calculatedColumns];
          updatedColumns[existingColumnIndex] = {
            name: newCalculation.name,
            format: newCalculation.format,
            isExternal: true,
            externalCompanyId: newCalculation.externalCompanyId,
            externalQuery: queryId,
            externalData: externalData,
          };
          setCalculatedColumns(updatedColumns);
          message.success(t('data_explorer.column_updated'));
        } else {
          // Ajouter une nouvelle colonne calculée spéciale pour les données externes
          setCalculatedColumns([
            ...calculatedColumns,
            {
              name: newCalculation.name,
              format: newCalculation.format,
              isExternal: true,
              externalCompanyId: newCalculation.externalCompanyId,
              externalQuery: queryId,
              externalData: externalData,
            },
          ]);
          message.success(t('data_explorer.column_added'));
        }

        setIsCalculationModalVisible(false);
        setIsEditingColumn(false);
        setOriginalColumnName('');
        setNewCalculation({
          name: '',
          expression: '',
          format: 'default',
          externalSource: false,
          externalCompanyId: null,
        });
      } catch (error) {
        console.error("Erreur lors de l'ajout de la colonne externe:", error);
        message.error(t('data_explorer.external_data_error'));
      }
    } else {
      // Cas normal avec une expression à évaluer
      if (!newCalculation.expression.trim()) {
        message.error(t('data_explorer.expression_required'));
        return;
      }

      // Vérifier si on édite une colonne existante ou on en ajoute une nouvelle
      const existingColumnIndex = isEditingColumn
        ? calculatedColumns.findIndex(calc => calc.name === originalColumnName)
        : -1;

      if (existingColumnIndex !== -1) {
        // Modifier la colonne existante
        const updatedColumns = [...calculatedColumns];
        updatedColumns[existingColumnIndex] = {
          ...newCalculation,
          isExternal: false,
        };
        setCalculatedColumns(updatedColumns);
        message.success(t('data_explorer.column_updated'));
      } else {
        // Ajouter une nouvelle colonne
        setCalculatedColumns([
          ...calculatedColumns,
          { ...newCalculation, isExternal: false },
        ]);
        message.success(t('data_explorer.column_added'));
      }

      setIsCalculationModalVisible(false);
      setIsEditingColumn(false);
      setOriginalColumnName('');
      setNewCalculation({
        name: '',
        expression: '',
        format: 'default',
        externalSource: false,
        externalCompanyId: null,
      });
    }
  };

  // Fonction pour charger les données d'une entreprise externe
  const fetchExternalCompanyData = async (companyId, queryId) => {
    if (!companyId || !queryId) return null;

    try {
      const url = `/explorer/data/${companyId}/${queryId}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error(data.error, data.details);
        return null;
      }

      return data.results || [];
    } catch (error) {
      console.error('Erreur lors du chargement des données externes:', error);
      return null;
    }
  };

  // Gérer l'affichage/masquage d'une colonne
  const toggleColumnVisibility = columnKey => {
    if (hiddenColumns.includes(columnKey)) {
      setHiddenColumns(hiddenColumns.filter(key => key !== columnKey));
    } else {
      setHiddenColumns([...hiddenColumns, columnKey]);
    }
  };

  // Gérer le pivot d'une colonne
  const toggleColumnPivot = columnKey => {
    if (pivotColumns.includes(columnKey)) {
      setPivotColumns(pivotColumns.filter(key => key !== columnKey));
    } else {
      setPivotColumns([...pivotColumns, columnKey]);
    }
  };

  // Supprimer un filtre
  const removeFilter = index => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  // Améliorer le menu contextuel pour les colonnes
  const getColumnMenu = columnKey => {
    // Déterminer si c'est une colonne numérique
    const isNumeric =
      displayData &&
      displayData.length > 0 &&
      (typeof displayData[0][columnKey] === 'number' ||
        !isNaN(Number(displayData[0][columnKey])));

    return (
      <Menu>
        <Menu.Item
          key="toggle-visibility"
          icon={<EyeInvisibleOutlined />}
          onClick={() => toggleColumnVisibility(columnKey)}
        >
          {hiddenColumns.includes(columnKey)
            ? t('data_explorer.show_in_visualization')
            : t('data_explorer.hide_from_visualization')}
        </Menu.Item>

        <Menu.Item
          key="toggle-pivot"
          icon={<TableOutlined />}
          onClick={() => toggleColumnPivot(columnKey)}
        >
          {pivotColumns.includes(columnKey)
            ? t('data_explorer.remove_pivot')
            : t('data_explorer.add_pivot')}
        </Menu.Item>

        <Menu.SubMenu
          key="filter"
          icon={<FilterOutlined />}
          title={t('data_explorer.filter')}
        >
          {/* Filtres de texte (pour toutes les colonnes) */}
          <Menu.Item
            key="filter-equals"
            onClick={() => {
              const value = prompt(
                `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.equals')}`,
              );
              if (value !== null) addFilter(columnKey, 'equals', value);
            }}
          >
            {t('data_explorer.equals')}
          </Menu.Item>

          <Menu.Item
            key="filter-not-equals"
            onClick={() => {
              const value = prompt(
                `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.not_equals')}`,
              );
              if (value !== null) addFilter(columnKey, 'not_equals', value);
            }}
          >
            {t('data_explorer.not_equals')}
          </Menu.Item>

          <Menu.Item
            key="filter-contains"
            onClick={() => {
              const value = prompt(
                `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.contains')}`,
              );
              if (value !== null) addFilter(columnKey, 'contains', value);
            }}
          >
            {t('data_explorer.contains')}
          </Menu.Item>

          <Menu.Item
            key="filter-not-contains"
            onClick={() => {
              const value = prompt(
                `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.not_contains')}`,
              );
              if (value !== null) addFilter(columnKey, 'not_contains', value);
            }}
          >
            {t('data_explorer.not_contains')}
          </Menu.Item>

          {/* Filtres spécifiques aux colonnes numériques */}
          {isNumeric && (
            <>
              <Menu.Divider />

              <Menu.Item
                key="filter-equals-number"
                onClick={() => {
                  const value = prompt(
                    `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.equals_number')}`,
                  );
                  if (value !== null && !isNaN(Number(value)))
                    addFilter(columnKey, 'equals_number', Number(value));
                }}
              >
                {t('data_explorer.equals_number')}
              </Menu.Item>

              <Menu.Item
                key="filter-greater"
                onClick={() => {
                  const value = prompt(
                    `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.greater_than')}`,
                  );
                  if (value !== null && !isNaN(Number(value)))
                    addFilter(columnKey, 'greater', Number(value));
                }}
              >
                {t('data_explorer.greater_than')}
              </Menu.Item>

              <Menu.Item
                key="filter-greater-equal"
                onClick={() => {
                  const value = prompt(
                    `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.greater_equal')}`,
                  );
                  if (value !== null && !isNaN(Number(value)))
                    addFilter(columnKey, 'greater_equal', Number(value));
                }}
              >
                {t('data_explorer.greater_equal')}
              </Menu.Item>

              <Menu.Item
                key="filter-less"
                onClick={() => {
                  const value = prompt(
                    `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.less_than')}`,
                  );
                  if (value !== null && !isNaN(Number(value)))
                    addFilter(columnKey, 'less', Number(value));
                }}
              >
                {t('data_explorer.less_than')}
              </Menu.Item>

              <Menu.Item
                key="filter-less-equal"
                onClick={() => {
                  const value = prompt(
                    `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.less_equal')}`,
                  );
                  if (value !== null && !isNaN(Number(value)))
                    addFilter(columnKey, 'less_equal', Number(value));
                }}
              >
                {t('data_explorer.less_equal')}
              </Menu.Item>

              <Menu.Item
                key="filter-between"
                onClick={() => {
                  const minValue = prompt(
                    `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.between_min')}`,
                  );
                  if (minValue !== null && !isNaN(Number(minValue))) {
                    const maxValue = prompt(
                      `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.between_max')}`,
                    );
                    if (maxValue !== null && !isNaN(Number(maxValue))) {
                      addFilter(columnKey, 'between', [
                        Number(minValue),
                        Number(maxValue),
                      ]);
                    }
                  }
                }}
              >
                {t('data_explorer.between')}
              </Menu.Item>
            </>
          )}

          {/* Filtres spécifiques aux colonnes de texte */}
          {!isNumeric && (
            <>
              <Menu.Divider />

              <Menu.Item
                key="filter-starts-with"
                onClick={() => {
                  const value = prompt(
                    `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.starts_with')}`,
                  );
                  if (value !== null)
                    addFilter(columnKey, 'starts_with', value);
                }}
              >
                {t('data_explorer.starts_with')}
              </Menu.Item>

              <Menu.Item
                key="filter-ends-with"
                onClick={() => {
                  const value = prompt(
                    `${t('data_explorer.filter')} ${columnKey} ${t('data_explorer.ends_with')}`,
                  );
                  if (value !== null) addFilter(columnKey, 'ends_with', value);
                }}
              >
                {t('data_explorer.ends_with')}
              </Menu.Item>
            </>
          )}
        </Menu.SubMenu>

        <Menu.Item
          key="sort-asc"
          icon={<SortAscendingOutlined />}
          onClick={() => setSortInfo({ column: columnKey, order: 'ascend' })}
        >
          {t('data_explorer.sort_ascending')}
        </Menu.Item>

        <Menu.Item
          key="sort-desc"
          icon={<SortDescendingOutlined />}
          onClick={() => setSortInfo({ column: columnKey, order: 'descend' })}
        >
          {t('data_explorer.sort_descending')}
        </Menu.Item>
      </Menu>
    );
  };

  // Améliorer le rendu des filtres actifs dans la barre d'outils
  const renderActiveFilters = () => {
    if (filters.length === 0) return null;

    return (
      <div className="active-filters mb-2 flex flex-wrap">
        {filters.map((filter, index) => {
          // Déterminer le texte à afficher pour l'opérateur
          let operatorText = '';
          switch (filter.operator) {
            case 'equals':
              operatorText = '=';
              break;
            case 'equals_number':
              operatorText = '=';
              break;
            case 'not_equals':
              operatorText = '≠';
              break;
            case 'contains':
              operatorText = t('data_explorer.contains_short');
              break;
            case 'not_contains':
              operatorText = t('data_explorer.not_contains_short');
              break;
            case 'greater':
              operatorText = '>';
              break;
            case 'greater_equal':
              operatorText = '≥';
              break;
            case 'less':
              operatorText = '<';
              break;
            case 'less_equal':
              operatorText = '≤';
              break;
            case 'between':
              operatorText = t('data_explorer.between_short');
              break;
            case 'starts_with':
              operatorText = t('data_explorer.starts_with_short');
              break;
            case 'ends_with':
              operatorText = t('data_explorer.ends_with_short');
              break;
            default:
              operatorText = filter.operator;
          }

          // Pour l'opérateur between, afficher les deux valeurs
          let valueText = '';
          if (
            filter.operator === 'between' &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            valueText = `${filter.value[0]} - ${filter.value[1]}`;
          } else {
            valueText = filter.value;
          }

          return (
            <Tag
              key={index}
              color="purple"
              closable
              onClose={() => removeFilter(index)}
              className="mr-1 mb-1"
            >
              <FilterOutlined />{' '}
              <strong>
                {filter.column
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())}
              </strong>{' '}
              {operatorText} &quot;{valueText}&quot;
            </Tag>
          );
        })}

        {filters.length > 0 && (
          <Button
            size="small"
            type="text"
            onClick={() => setFilters([])}
            className="text-purple-600 hover:text-purple-800"
          >
            {t('data_explorer.clear_all_filters')}
          </Button>
        )}
      </div>
    );
  };

  // Fonction pour générer un aperçu du graphique
  const renderChartPreview = () => {
    if (
      !previewData ||
      previewData.length === 0 ||
      !selectedXAxis ||
      selectedYAxes.length === 0
    ) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded border border-gray-200">
          <p className="text-gray-400">{t('metrics.chart_preview.no_data')}</p>
        </div>
      );
    }

    // Déterminer si les colonnes sont calculées pour leur appliquer un style spécial
    const isCalculatedColumn = columnName => {
      return calculatedColumns.some(calc => calc.name === columnName);
    };

    // Obtenir le format d'une colonne calculée
    const getCalculatedColumnFormat = columnName => {
      const column = calculatedColumns.find(calc => calc.name === columnName);
      return column ? column.format : 'default';
    };

    // Formateur pour les tooltips
    const tooltipFormatter = (value, name) => {
      // Si c'est une colonne calculée, utiliser son format
      if (isCalculatedColumn(name)) {
        const format = getCalculatedColumnFormat(name);
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

    switch (chartType) {
      case 'bar':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={previewData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <RechartsTooltip formatter={tooltipFormatter} />
                <Legend />
                {selectedYAxes.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    // Ajouter un style spécial pour les colonnes calculées
                    strokeDasharray={isCalculatedColumn(key) ? '3 3' : '0'}
                    strokeWidth={isCalculatedColumn(key) ? 2 : 0}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'line':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={previewData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <RechartsTooltip formatter={tooltipFormatter} />
                <Legend />
                {selectedYAxes.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index % COLORS.length]}
                    activeDot={{ r: 8 }}
                    // Ajouter un style spécial pour les colonnes calculées
                    strokeDasharray={isCalculatedColumn(key) ? '5 5' : '0'}
                    strokeWidth={isCalculatedColumn(key) ? 2 : 1}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'area':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={previewData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <RechartsTooltip formatter={tooltipFormatter} />
                <Legend />
                {selectedYAxes.map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    // Ajouter un style spécial pour les colonnes calculées
                    strokeDasharray={isCalculatedColumn(key) ? '5 5' : '0'}
                    strokeWidth={isCalculatedColumn(key) ? 2 : 1}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'pie':
        // Pour un camembert, nous utilisons seulement la première colonne Y sélectionnée
        if (selectedYAxes.length > 0) {
          return (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={previewData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={selectedYAxes[0]}
                    nameKey="name"
                    label={entry => entry.name}
                  >
                    {previewData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={tooltipFormatter} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          );
        }
        return null;

      case 'radar':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={80} data={previewData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <RechartsTooltip formatter={tooltipFormatter} />
                {selectedYAxes.map((key, index) => (
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
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded border border-gray-200">
            <p className="text-gray-400">
              {t('metrics.chart_preview.invalid_type')}
            </p>
          </div>
        );
    }
  };

  // Supprimer une colonne calculée
  const removeCalculatedColumn = columnName => {
    setCalculatedColumns(
      calculatedColumns.filter(calc => calc.name !== columnName),
    );
    message.success(t('data_explorer.column_removed'));
  };

  // Éditer une colonne calculée
  const editCalculatedColumn = columnName => {
    const columnToEdit = calculatedColumns.find(
      calc => calc.name === columnName,
    );
    if (columnToEdit) {
      setIsEditingColumn(true);
      setOriginalColumnName(columnName);
      setNewCalculation({ ...columnToEdit });
      setIsCalculationModalVisible(true);
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
          onChange={e => dispatch(updateCols(parseInt(e.target.value)))}
        >
          {[1, 2, 3, 4, 6].map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        {/* Les fonctionnalités Move et Resize sont automatiques selon le mode édition */}

        <button
          onClick={onShowDrawer}
          className="px-2 py-1 rounded text-xs border border-purple-400 bg-purple-50"
        >
          {t('data')}
        </button>
      </div>

      <Drawer
        title={t('metrics.drawer.title')}
        placement="right"
        width={720}
        onClose={onCloseDrawer}
        open={drawerOpen}
        extra={
          <Space>
            <Button onClick={onCloseDrawer}>{t('common.close')}</Button>
            <Button type="primary" onClick={executeQuery} loading={dataLoading}>
              {t('metrics.drawer.execute')}
            </Button>
          </Space>
        }
      >
        <div className="mb-6">
          <h4 className="mb-2 font-medium">
            {t('metrics.drawer.select_query')}
          </h4>
          <Select
            className="grid-controls-select-full"
            value={selectedQueryId}
            onChange={handleQueryChange}
          >
            {AVAILABLE_QUERIES.map(query => (
              <Option key={query.id} value={query.id}>
                {query.name}
              </Option>
            ))}
          </Select>

          <div className="bg-gray-50 p-3 rounded mt-2">
            <Text type="secondary">
              {AVAILABLE_QUERIES.find(q => q.id === selectedQueryId)?.name}
            </Text>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium">{t('metrics.drawer.results')}</h4>

          <div
            className="data-results-container"
            style={{ minHeight: '300px', position: 'relative' }}
          >
            {dataLoading && (
              <div className="flex justify-center items-center absolute inset-0 bg-white bg-opacity-80 z-10">
                <Spin>
                  <div className="p-5">{t('common.loading')}</div>
                </Spin>
              </div>
            )}

            {errorMessage ? (
              <div className="error-message p-4 border border-red-300 rounded bg-red-50">
                <Text type="danger">
                  {t('errors.custom_error', { error: errorMessage })}
                </Text>
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
                      {t('data_explorer.add_column')}
                    </Button>

                    <Dropdown
                      overlay={
                        <Menu>
                          {Object.keys(queryResults[0] || {}).map(key => (
                            <Menu.Item
                              key={key}
                              onClick={() => toggleColumnPivot(key)}
                            >
                              {pivotColumns.includes(key) ? '✓ ' : ''}
                              {key}
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
                        {t('data_explorer.pivot')} <DownOutlined />
                      </Button>
                    </Dropdown>

                    <Dropdown
                      overlay={
                        <Menu>
                          {Object.keys(queryResults[0] || {}).map(key => (
                            <Menu.Item
                              key={key}
                              onClick={() => toggleColumnVisibility(key)}
                            >
                              {hiddenColumns.includes(key) ? '❌ ' : '✓ '}
                              {key}
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
                        {t('data_explorer.visibility')} <DownOutlined />
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
                        <SortAscendingOutlined /> {t('data_explorer.sort')}{' '}
                        {sortInfo.column} (
                        {sortInfo.order === 'ascend' ? '↑' : '↓'})
                      </Tag>
                    )}

                    {/* Utilisation du nouveau composant pour afficher les filtres actifs */}
                    {renderActiveFilters()}
                  </div>
                </div>

                {/* Tableau de données avec colonnes enrichies */}
                <div className="overflow-auto max-h-96">
                  <Table
                    dataSource={displayData}
                    columns={tableColumns.map(col => ({
                      ...col,
                      title: (
                        <Dropdown
                          overlay={getColumnMenu(col.dataIndex)}
                          trigger={['click']}
                        >
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
                          order: sorter.order,
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
        </div>

        {queryResults.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h4 className="mb-4 font-medium">
              {t('metrics.drawer.add_chart')}
            </h4>

            <div className="mb-3">
              <label htmlFor="chartTitle" className="block text-sm mb-1">
                {t('metrics.drawer.chart_title')}:
              </label>
              <Input
                id="chartTitle"
                placeholder={t('metrics.drawer.chart_title_placeholder')}
                value={chartTitle}
                onChange={e => setChartTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">
                {t('metrics.drawer.chart_type')}:
              </label>
              <Radio.Group
                onChange={e => setChartType(e.target.value)}
                value={chartType}
              >
                <Radio.Button value="bar">
                  {t('metrics.chart_types.bar')}
                </Radio.Button>
                <Radio.Button value="line">
                  {t('metrics.chart_types.line')}
                </Radio.Button>
                <Radio.Button value="area">
                  {t('metrics.chart_types.area')}
                </Radio.Button>
                <Radio.Button value="pie">
                  {t('metrics.chart_types.pie')}
                </Radio.Button>
                <Radio.Button value="radar">
                  {t('metrics.chart_types.radar')}
                </Radio.Button>
              </Radio.Group>
            </div>

            {/* Nouvelle section pour la sélection des axes */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">
                  {t('metrics.drawer.x_axis')}:
                </label>
                <Select
                  className="grid-controls-select-full"
                  value={selectedXAxis}
                  onChange={setSelectedXAxis}
                  placeholder={t('metrics.drawer.select_x_axis')}
                >
                  {displayData &&
                    displayData.length > 0 &&
                    getNonNumericColumns(displayData).map(column => (
                      <Option key={column} value={column}>
                        {column
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, l => l.toUpperCase())}
                      </Option>
                    ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  {t('metrics.drawer.y_axes')}:
                </label>
                <Select
                  mode="multiple"
                  className="grid-controls-select-full"
                  placeholder={t('metrics.drawer.select_y_axes')}
                  value={selectedYAxes}
                  onChange={setSelectedYAxes}
                  maxTagCount={3}
                >
                  {displayData &&
                    displayData.length > 0 &&
                    getNumericColumns(displayData).map(column => (
                      <Option key={column} value={column}>
                        {column
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, l => l.toUpperCase())}
                      </Option>
                    ))}
                </Select>
              </div>
            </div>

            {/* Section de prévisualisation du graphique */}
            <div className="mb-4">
              <label className="block text-sm mb-1">
                {t('metrics.drawer.chart_preview')}:
              </label>
              <div className="border border-gray-200 rounded p-2 bg-white">
                {renderChartPreview()}
              </div>
            </div>

            <Button type="primary" onClick={addGraphFromCurrentData}>
              {t('metrics.drawer.add_chart_button')}
            </Button>
          </div>
        )}
      </Drawer>

      {/* Ajouter la modale pour les colonnes calculées */}
      <Modal
        title={t('data_explorer.create_calculated_column')}
        visible={isCalculationModalVisible}
        onOk={handleSaveCalculation}
        onCancel={() => {
          setIsCalculationModalVisible(false);
          setIsEditingColumn(false);
          setOriginalColumnName('');
          setNewCalculation({
            name: '',
            expression: '',
            format: 'default',
            externalSource: false,
            externalCompanyId: null,
          });
        }}
        width={600}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item
            label={t('data_explorer.column_name')}
            required
            tooltip={t('data_explorer.column_name_placeholder')}
          >
            <Input
              value={newCalculation.name}
              onChange={e =>
                setNewCalculation({ ...newCalculation, name: e.target.value })
              }
              placeholder={t('data_explorer.column_name_placeholder')}
            />
          </Form.Item>

          {/* Ajouter un switch pour choisir entre expression et source externe */}
          <Form.Item label={t('data_explorer.data_source')}>
            <Switch
              checked={newCalculation.externalSource}
              onChange={checked =>
                setNewCalculation({
                  ...newCalculation,
                  externalSource: checked,
                })
              }
              checkedChildren={t('data_explorer.external_company')}
              unCheckedChildren={t('data_explorer.formula')}
            />
            <span className="ml-2 text-xs text-gray-500">
              {newCalculation.externalSource
                ? t('data_explorer.external_company_help')
                : t('data_explorer.formula_help')}
            </span>
          </Form.Item>

          {newCalculation.externalSource ? (
            <Form.Item
              label={t('data_explorer.select_company')}
              required
              tooltip={t('data_explorer.select_company_help')}
            >
              <Select
                placeholder={t('data_explorer.select_company_placeholder')}
                value={newCalculation.externalCompanyId}
                onChange={value =>
                  setNewCalculation({
                    ...newCalculation,
                    externalCompanyId: value,
                  })
                }
                loading={loadingCompanies}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {companies.map(company => (
                  <Option key={company.id} value={company.id}>
                    {company.denomination || company.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              label={t('data_explorer.expression')}
              required={!newCalculation.externalSource}
              tooltip={t('data_explorer.expression_placeholder')}
            >
              <Input.TextArea
                value={newCalculation.expression}
                onChange={e =>
                  setNewCalculation({
                    ...newCalculation,
                    expression: e.target.value,
                  })
                }
                placeholder={t('data_explorer.expression_placeholder')}
                rows={4}
                disabled={newCalculation.externalSource}
              />
            </Form.Item>
          )}

          <Form.Item label={t('data_explorer.display_format')}>
            <Select
              value={newCalculation.format}
              onChange={value =>
                setNewCalculation({ ...newCalculation, format: value })
              }
            >
              <Option value="default">
                {t('data_explorer.format_default')}
              </Option>
              <Option value="percentage">
                {t('data_explorer.format_percentage')}
              </Option>
              <Option value="currency">
                {t('data_explorer.format_currency')}
              </Option>
            </Select>
          </Form.Item>

          {!newCalculation.externalSource && (
            <div className="text-xs text-gray-500 mb-4">
              <p className="font-medium mb-1">
                {t('data_explorer.available_columns')}:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {queryResults &&
                  queryResults.length > 0 &&
                  Object.keys(queryResults[0]).map(key => (
                    <Tag
                      key={key}
                      color="blue"
                      onClick={() => {
                        // Ajouter le nom de colonne avec un espace avant s'il n'y en a pas déjà un
                        const currentExpr = newCalculation.expression;
                        const expr = currentExpr.endsWith(' ')
                          ? `${currentExpr}${key}`
                          : `${currentExpr} ${key}`.trim();
                        setNewCalculation({
                          ...newCalculation,
                          expression: expr,
                        });
                      }}
                      className="cursor-pointer"
                    >
                      {key}
                    </Tag>
                  ))}
              </div>
              <p className="mt-2">{t('data_explorer.operators')}</p>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default GridControls;
