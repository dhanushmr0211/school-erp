import { createContext, useContext, useState } from "react";

const AcademicYearContext = createContext(null);

export function AcademicYearProvider({ children }) {
  const [academicYear, setAcademicYear] = useState(null);

  return (
    <AcademicYearContext.Provider
      value={{ academicYear, setAcademicYear }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  return useContext(AcademicYearContext);
}
