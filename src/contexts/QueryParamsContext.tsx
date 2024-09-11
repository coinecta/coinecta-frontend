import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type QueryParamsMap = { [key: string]: string };

interface QueryParamsContextType {
  queryParams: QueryParamsMap;
  setQueryParam: (key: string, value: string) => void;
}

const QueryParamsContext = createContext<QueryParamsContextType | null>(null);

export const QueryParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryParams, setQueryParams] = useState<QueryParamsMap>({});
  const searchParams = useSearchParams();

  useEffect(() => {
    const params: QueryParamsMap = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    setQueryParams(params);
  }, [searchParams]);

  const setQueryParam = (key: string, value: string) => {
    setQueryParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <QueryParamsContext.Provider value={{ queryParams, setQueryParam }}>
      {children}
    </QueryParamsContext.Provider>
  );
};

export const useQueryParams = (): QueryParamsContextType => {
  const context = useContext(QueryParamsContext);
  if (!context) {
    throw new Error('useQueryParams must be used within a QueryParamsProvider');
  }
  return context;
};