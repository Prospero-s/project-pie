import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/index';
import { Spin } from 'antd';

export const ReduxProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<Spin size="large" />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
