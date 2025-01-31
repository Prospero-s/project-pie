import React, { createContext, useContext, useState } from 'react';

const RedirectContext = createContext();

export const RedirectProvider = ({ children }) => {
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  return (
    <RedirectContext.Provider value={{ isCheckingRedirect, setIsCheckingRedirect }}>
      {children}
    </RedirectContext.Provider>
  );
};

export const useRedirect = () => useContext(RedirectContext);