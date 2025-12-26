import { createContext, useContext, useState } from "react";

const AcademicYearContext = createContext(null);

export function AcademicYearProvider({ children }) {
  const [academicYearId, setAcademicYearId] = useState(null);

  return (
    <AcademicYearContext.Provider value={{ academicYearId, setAcademicYearId }}>
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  return useContext(AcademicYearContext);
}
