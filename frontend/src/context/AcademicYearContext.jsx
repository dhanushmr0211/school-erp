import { createContext, useContext, useState } from "react";

const AcademicYearContext = createContext(null);

export function AcademicYearProvider({ children }) {
  const [academicYearId, setId] = useState(() => localStorage.getItem("academicYearId"));

  const setAcademicYearId = (id) => {
    setId(id);
    if (id) {
      localStorage.setItem("academicYearId", id);
    } else {
      localStorage.removeItem("academicYearId");
    }
  };

  return (
    <AcademicYearContext.Provider value={{ academicYearId, setAcademicYearId }}>
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  return useContext(AcademicYearContext);
}
