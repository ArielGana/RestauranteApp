import React, { createContext, useState, useContext } from "react";

const ComandaContext = createContext();

export const ComandaProvider = ({ children }) => {
  const [comandaDetails, setComandaDetails] = useState({});

  return (
    <ComandaContext.Provider value={{ comandaDetails, setComandaDetails }}>
      {children}
    </ComandaContext.Provider>
  );
};

export const useComanda = () => useContext(ComandaContext);
