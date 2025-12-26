export function AcademicYearProvider({ children }) {
  const [academicYear, setAcademicYear] = useState(null);
  const [academicYearId, setAcademicYearId] = useState(null);

  return (
    <AcademicYearContext.Provider value={{
      academicYear,
      setAcademicYear,
      academicYearId,
      setAcademicYearId
    }}>
      {children}
    </AcademicYearContext.Provider>
  );
}
