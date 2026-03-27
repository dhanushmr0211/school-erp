import { useEffect, useState } from "react";
import { fetchAdminStats } from "../../services/adminApi";
import { fetchStudents } from "../../services/adminStudentApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { Users, Layers, BookOpen, Search } from "lucide-react";

export default function AdminDashboard() {
    const { academicYearId } = useAcademicYear();
    const [stats, setStats] = useState({ students: 0, classes: 0, faculty: 0 });
    const [searchQuery, setSearchQuery] = useState("");
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (academicYearId && academicYearId !== "null" && academicYearId !== "undefined") {
            loadStats();
        }
    }, [academicYearId]);

    async function loadStats() {
        try {
            // fetchAdminStats now returns optimized object: { students: count, classes: count, faculty: count }
            const data = await fetchAdminStats(academicYearId);
            setStats({
                students: data.students || 0,
                classes: data.classes || 0,
                faculty: data.faculty || 0,
            });

            // Fetch students for quick search functionality
            const studentsData = await fetchStudents(academicYearId);
            setAllStudents(studentsData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-gray">Loading stats...</div>;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
            <div className="page-header flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ marginBottom: "0.5rem", fontSize: '2rem' }}>Dashboard Overview</h1>
                    <p className="text-gray" style={{ margin: 0, fontSize: '1.1rem' }}>Welcome to the Anikethana Education Society administration portal.</p>
                </div>
                <span className="badge badge-blue" style={{ padding: '0.5rem 0.5rem', fontSize: '0.9rem' }}>Academic Year Active</span>
            </div>

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
                            {allStudents.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(student => (
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
                                    <a href="/admin/students" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                        Go to Profile
                                    </a>
                                </li>
                            ))}
                            {allStudents.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                <li style={{ padding: '16px', color: '#9ca3af', textAlign: 'center' }}>
                                    No students found matching "{searchQuery}"
                                </li>
                            )}
                            {allStudents.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase())).length > 5 && (
                                <li style={{ padding: '10px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                    <a href="/admin/students" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.9rem' }}>
                                        See all {allStudents.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase())).length} results...
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-lg" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
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
                    <h2 className="text-4xl font-bold" style={{ marginBottom: '0.5rem' }}>{stats.faculty}</h2>
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
                    <h2 className="text-4xl font-bold" style={{ marginBottom: '0.5rem' }}>{stats.classes}</h2>
                    <p className="text-gray" style={{ fontWeight: 600, fontSize: '1.1rem' }}>Existing Classes</p>
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
                    <div style={{ padding: '1.25rem', background: '#fffbeb', borderRadius: '50%', marginBottom: '1.5rem' }}>
                        <Users size={40} className="text-gold" />
                    </div>
                    <h2 className="text-4xl font-bold" style={{ marginBottom: '0.5rem' }}>{stats.students}</h2>
                    <p className="text-gray" style={{ fontWeight: 600, fontSize: '1.1rem' }}>All Students</p>
                </div>
            </div>

            <div className="card animate-fade-in" style={{ animationDelay: '0.2s', marginTop: '2.5rem', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <a href="/admin/students" className="btn btn-primary" style={{
                        padding: '0.875rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}>
                        <Users size={20} /> Manage Students
                    </a>
                    <a href="/admin/classes" className="btn btn-secondary" style={{
                        padding: '0.875rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}>
                        <Layers size={20} /> Manage Classes
                    </a>
                    <a href="/admin/reports" className="btn btn-secondary" style={{
                        padding: '0.875rem 1.5rem',
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
