import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import Loader from '@/components/common/Loader';

interface LoadingContextType {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoadingState] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((value: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log('Loading state changed:', value);
      setLoadingState(value);
    }, 300); // Délai de 300ms
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading ? <Loader /> : children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
