import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminStats } from "../../services/adminApi";
import { fetchStudents } from "../../services/adminStudentApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { Users, Layers, BookOpen, Search, Mail } from "lucide-react";

export default function AdminDashboard() {
    const { academicYearId } = useAcademicYear();
    const [searchQuery, setSearchQuery] = useState("");

    const isYearLoaded = academicYearId && academicYearId !== "null" && academicYearId !== "undefined";

    // Standardized Stats Fetch with Caching
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['adminStats', academicYearId],
        queryFn: () => fetchAdminStats(academicYearId),
        enabled: !!isYearLoaded,
    });

    // Optimized Search List Fetch (only name, id, admission_number)
    const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
        queryKey: ['studentsSearchList', academicYearId],
        queryFn: () => fetchStudents(academicYearId, { fields: 'id,name,admission_number,dob', limit: 1000 }),
        enabled: !!isYearLoaded,
    });

    const allStudents = studentsResponse?.data || [];

    const filteredResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return allStudents.filter(s => 
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.admission_number?.toString().includes(searchQuery)
        ).slice(0, 5);
    }, [searchQuery, allStudents]);

    const loading = statsLoading;

    const dashboardStats = stats || { students: 0, classes: 0, faculty: 0, queries: 0 };

    const StatCardSkeleton = () => (
        <div className="card animate-pulse" style={{ flex: 1, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e2e8f0', margin: '0 auto 1.5rem' }}></div>
            <div style={{ width: '60px', height: '32px', background: '#e2e8f0', margin: '0 auto 0.5rem', borderRadius: '4px' }}></div>
            <div style={{ width: '100px', height: '16px', background: '#e2e8f0', margin: '0 auto', borderRadius: '4px' }}></div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
            <div className="page-header flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ marginBottom: "0.5rem", fontSize: '2rem' }}>Dashboard Overview</h1>
                    <p className="text-gray" style={{ margin: 0, fontSize: '1.1rem' }}>Welcome to the Anikethana Education Society administration portal.</p>
                </div>
                <span className="badge badge-blue" style={{ padding: '0.5rem 0.5rem', fontSize: '0.9rem' }}>Academic Year Active</span>
            </div>

            {/* Public Queries Card (if there are any) */}
            {dashboardStats.queries > 0 && (
                <Link to="/admin/queries" className="card animate-fade-in" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
                    border: '1px solid #fecaca',
                    marginBottom: '2.5rem',
                    textDecoration: 'none'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '12px' }}>
                            <Mail size={24} className="text-red-500" />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#991b1b' }}>Pending Public Inquiries</h4>
                            <p className="text-gray" style={{ margin: 0, fontSize: '0.9rem' }}>You have {dashboardStats.queries} new queries from the website.</p>
                        </div>
                    </div>
                    <span className="btn btn-secondary" style={{ padding: '8px 16px', background: 'white' }}>View All</span>
                </Link>
            )}

            {/* Quick Search Widget */}
            <div className="card animate-fade-in" style={{ animationDelay: '0.02s', marginBottom: '2.5rem', padding: '1.5rem 2rem' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                    <Search size={22} className="text-gray" style={{ position: 'absolute', top: '12px', left: '16px' }} />
                    <input 
                        type="text" 
                        placeholder="🔍 Quick Search: Find any student by name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '12px 16px 12px 48px',
                            fontSize: '1.05rem',
                            outline: 'none',
                        }}
                    />
                </div>
                
                {searchQuery.trim().length > 0 && (
                    <div style={{ 
                        marginTop: '1rem', 
                        background: 'var(--card-bg, #fff)', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border-color, #e2e8f0)',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {studentsLoading && (
                                <li style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>Searching...</li>
                            )}
                            {!studentsLoading && filteredResults.map(student => (
                                <li key={student.id} style={{ 
                                    padding: '12px 16px', 
                                    borderBottom: '1px solid var(--border-color, #e2e8f0)', 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong style={{ fontSize: '1.1rem' }}>{student.name}</strong> 
                                        <span className="text-gray text-sm" style={{ marginLeft: '10px' }}>
                                            Admission No: {student.admission_number || '-'} 
                                            {student.dob && ` | DOB: ${student.dob}`}
                                        </span>
                                    </div>
                                    <Link to={`/admin/students?id=${student.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                        Go to Profile
                                    </Link>
                                </li>
                            ))}
                            {!studentsLoading && filteredResults.length === 0 && (
                                <li style={{ padding: '16px', color: '#9ca3af', textAlign: 'center' }}>
                                    No students found matching "{searchQuery}"
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-lg" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        {/* Faculty Card */}
                        <div className="card animate-fade-in" 
                            style={{ 
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2.5rem 1.5rem',
                                animationDelay: '0.05s',
                                textAlign: 'center'
                            }}>
                            <div style={{ padding: '1.25rem', background: 'var(--royal-light)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                <Users size={40} className="text-royal" />
                            </div>
                            <h2 className="text-4xl font-bold" style={{ marginBottom: '0.5rem' }}>{dashboardStats.faculty}</h2>
                            <p className="text-gray" style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Faculty</p>
                        </div>

                        {/* Classes Card */}
                        <div className="card animate-fade-in" 
                            style={{ 
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2.5rem 1.5rem',
                                animationDelay: '0.1s',
                                textAlign: 'center'
                            }}>
                            <div style={{ padding: '1.25rem', background: '#ecfccb', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                <Layers size={40} style={{ color: '#65a30d' }} />
                            </div>
                            <h2 className="text-4xl font-bold" style={{ marginBottom: '0.5rem' }}>{dashboardStats.classes}</h2>
                            <p className="text-gray" style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Classes</p>
                        </div>

                        {/* Students Card */}
                        <div className="card animate-fade-in" 
                            style={{ 
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2.5rem 1.5rem',
                                animationDelay: '0.15s',
                                textAlign: 'center'
                            }}>
                            <div style={{ padding: '1.25rem', background: '#e0f2fe', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                <BookOpen size={40} style={{ color: '#0284c7' }} />
                            </div>
                            <h2 className="text-4xl font-bold" style={{ marginBottom: '0.5rem' }}>{dashboardStats.students}</h2>
                            <p className="text-gray" style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Students</p>
                        </div>
                    </>
                )}
            </div>

            <div className="card animate-fade-in" style={{ animationDelay: '0.2s', marginTop: '2.5rem', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <Link to="/admin/students" className="btn btn-primary" style={{
                        padding: '0.875rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}>
                        <Users size={20} /> Manage Students
                    </Link>
                    <Link to="/admin/classes" className="btn btn-secondary" style={{
                        padding: '0.875rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}>
                        <Layers size={20} /> Manage Classes
                    </Link>
                    <Link to="/admin/reports" className="btn btn-secondary" style={{
                        padding: '0.875rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}>
                        <BookOpen size={20} /> View Reports
                    </Link>
                </div>
            </div>
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}>
                        <BookOpen size={20} /> Generate Reports
                    </a>
                </div>
            </div>
        </div>
    );
}
