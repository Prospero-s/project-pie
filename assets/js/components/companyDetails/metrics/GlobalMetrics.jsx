import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Button, message } from 'antd';
import { EditOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  removeCustomChart,
  setDraggable,
  setResizable,
} from '../../../redux/slices/layoutSlice';
import RadarChartComponent from '@/components/graphes/RadarChartComponent';
import BarChartMixedComponent from '@/components/graphes/BarChartMixedComponent';
import AreaChartInteractiveComponent from '@/components/graphes/AreaChartInteractiveComponent';
import LineChartLabelComponent from '@/components/graphes/LineChartLabel';
import CustomChartComponent from './customCharts/CustomChartComponent';
import { CloseOutlined } from '@ant-design/icons';
import GridControls from './GridControls';
import '../../../../css/components/metrics.css';

// Import required CSS
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Default layout configuration for the charts
const defaultLayoutConfig = {
  radar: { i: 'radar', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 1, maxW: 3 },
  barMixed: {
    i: 'barMixed',
    x: 1,
    y: 0,
    w: 1,
    h: 2,
    minW: 1,
    minH: 1,
    maxW: 3,
  },
  lineLabel: {
    i: 'lineLabel',
    x: 2,
    y: 0,
    w: 1,
    h: 2,
    minW: 1,
    minH: 1,
    maxW: 3,
  },
  areaInteractive: {
    i: 'areaInteractive',
    x: 0,
    y: 2,
    w: 3,
    h: 2,
    minW: 1,
    minH: 1,
    maxW: 3,
  },
};

// Style pour les conteneurs de graphiques
const chartContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const GlobalMetrics = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { t } = useTranslation();
  const { customCharts } = useSelector(state => state.layout);

  // États locaux pour la gestion de la disposition
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(defaultLayoutConfig);
  const [tempLayout, setTempLayout] = useState(defaultLayoutConfig);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Configuration de la grille
  const [gridConfig, setGridConfig] = useState({
    cols: 3,
    rowHeight: 200,
    isDraggable: false,
    isResizable: false,
  });

  // Get custom charts for this company
  const companyCustomCharts =
    id && customCharts[id] ? Object.keys(customCharts[id]) : [];

  // Clé localStorage pour cette compagnie
  const getLayoutStorageKey = companyId => `layout_company_${companyId}`;
  const getGridConfigStorageKey = companyId =>
    `grid_config_company_${companyId}`;

  // Charger la disposition depuis localStorage au montage
  useEffect(() => {
    if (id) {
      try {
        const savedLayout = localStorage.getItem(getLayoutStorageKey(id));
        const savedGridConfig = localStorage.getItem(
          getGridConfigStorageKey(id),
        );

        if (savedLayout) {
          const parsedLayout = JSON.parse(savedLayout);
          setCurrentLayout(parsedLayout);
          setTempLayout(parsedLayout);
        }

        if (savedGridConfig) {
          const parsedGridConfig = JSON.parse(savedGridConfig);
          setGridConfig(prev => ({ ...prev, ...parsedGridConfig }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la disposition:', error);
        message.error('Erreur lors du chargement de la disposition');
      }
    }
  }, [id]);

  // Convert the layout object to an array format required by react-grid-layout
  const layoutArray = Object.values(isEditMode ? tempLayout : currentLayout);

  // Sauvegarder la disposition dans localStorage
  const saveLayout = () => {
    if (!id) return;

    try {
      localStorage.setItem(getLayoutStorageKey(id), JSON.stringify(tempLayout));
      localStorage.setItem(
        getGridConfigStorageKey(id),
        JSON.stringify({
          cols: gridConfig.cols,
          rowHeight: gridConfig.rowHeight,
        }),
      );

      setCurrentLayout(tempLayout);
      setIsEditMode(false);
      setHasUnsavedChanges(false);

      // Désactiver automatiquement draggable et resizable dans Redux
      dispatch(setDraggable(false));
      dispatch(setResizable(false));
      message.success(t('layout.layout_saved_successfully'));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      message.error(t('layout.error_saving_layout'));
    }
  };

  // Activer le mode édition
  const enterEditMode = () => {
    setTempLayout({ ...currentLayout });
    setIsEditMode(true);

    // Activer automatiquement draggable et resizable dans Redux
    dispatch(setDraggable(true));
    dispatch(setResizable(true));
    setGridConfig(prev => ({
      ...prev,
      isDraggable: true,
      isResizable: true,
    }));
    message.info(t('layout.edit_mode_activated'));
  };

  // Annuler les modifications
  const cancelEdit = () => {
    setTempLayout({ ...currentLayout });
    setIsEditMode(false);
    setHasUnsavedChanges(false);

    // Désactiver automatiquement draggable et resizable dans Redux
    dispatch(setDraggable(false));
    dispatch(setResizable(false));
    setGridConfig(prev => ({
      ...prev,
      isDraggable: false,
      isResizable: false,
    }));
    message.info(t('layout.changes_cancelled'));
  };

  // Handle layout changes (seulement en mode édition)
  const handleLayoutChange = layout => {
    if (!isEditMode) return;

    const updatedLayouts = {};
    layout.forEach(item => {
      const currentItem = tempLayout[item.i];
      updatedLayouts[item.i] = {
        ...item,
        minW: currentItem?.minW ?? 1,
        minH: currentItem?.minH ?? 1,
        maxW: currentItem?.maxW ?? 3,
      };
    });

    setTempLayout(updatedLayouts);
    setHasUnsavedChanges(true);
  };

  // Handle removing a custom chart
  const handleRemoveChart = chartId => {
    dispatch(
      removeCustomChart({
        companyId: id,
        chartId,
      }),
    );
  };

  // Réinitialiser au layout par défaut
  const resetToDefault = () => {
    setTempLayout({ ...defaultLayoutConfig });
    setHasUnsavedChanges(true);
    message.info('Disposition réinitialisée au layout par défaut');
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        {/* Grid Controls */}
        <GridControls />

        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={enterEditMode}
            >
              {t('layout.edit_layout')}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={resetToDefault} disabled={!hasUnsavedChanges}>
                {t('layout.reset')}
              </Button>

              <Button icon={<UndoOutlined />} onClick={cancelEdit}>
                {t('common.cancel')}
              </Button>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={saveLayout}
                disabled={!hasUnsavedChanges}
              >
                {t('layout.save')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {isEditMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-600" />
            <span className="text-blue-800 font-medium">
              Mode édition actif
            </span>
            {hasUnsavedChanges && (
              <span className="text-orange-600 text-sm">
                • Modifications non sauvegardées
              </span>
            )}
          </div>
          <p className="text-blue-700 text-sm mt-1">
            {t('layout.drag_drop_instruction')}
          </p>
        </div>
      )}

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layoutArray }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: gridConfig.cols, md: 3, sm: 2, xs: 1, xxs: 1 }}
        rowHeight={gridConfig.rowHeight}
        isDraggable={gridConfig.isDraggable}
        isResizable={gridConfig.isResizable}
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        useCSSTransforms={true}
      >
        <div
          key="radar"
          style={chartContainerStyle}
          className={`chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm ${isEditMode ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}
        >
          <RadarChartComponent />
        </div>
        <div
          key="barMixed"
          style={chartContainerStyle}
          className={`chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm ${isEditMode ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}
        >
          <BarChartMixedComponent />
        </div>
        <div
          key="lineLabel"
          style={chartContainerStyle}
          className={`chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm ${isEditMode ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}
        >
          <LineChartLabelComponent />
        </div>
        <div
          key="areaInteractive"
          style={chartContainerStyle}
          className={`chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm ${isEditMode ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}
        >
          <AreaChartInteractiveComponent />
        </div>

        {/* Render custom charts */}
        {companyCustomCharts.map(chartId => (
          <div
            key={chartId}
            style={chartContainerStyle}
            className={`chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm ${isEditMode ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}
          >
            <div
              className="chart-close-btn"
              onClick={e => {
                e.stopPropagation();
                handleRemoveChart(chartId);
              }}
            >
              <CloseOutlined />
            </div>
            <CustomChartComponent chartId={chartId} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </>
  );
};

export default GlobalMetrics;
