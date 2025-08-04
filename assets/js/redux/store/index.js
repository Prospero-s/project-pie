import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import layoutReducer from '../slices/layoutSlice';

// Configuration pour la persistence
const persistConfig = {
  key: 'layout',
  storage,
  // Optionnel: on peut spécifier quelles parties de l'état sauvegarder
  whitelist: [
    'layoutsByCompany',
    'defaultLayout',
    'customCharts',
    'cols',
    'rowHeight',
    'isDraggable',
    'isResizable',
  ],
};

// Créer le reducer persisté
const persistedLayoutReducer = persistReducer(persistConfig, layoutReducer);

export const store = configureStore({
  reducer: {
    layout: persistedLayoutReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
