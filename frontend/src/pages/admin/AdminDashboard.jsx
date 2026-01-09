import { useEffect, useState } from "react";
import { fetchAdminStats } from "../../services/adminApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { Users, Layers, BookOpen } from "lucide-react";

export default function AdminDashboard() {
    const { academicYearId } = useAcademicYear();
    const [stats, setStats] = useState({ students: 0, classes: 0, faculty: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (academicYearId) {
            loadStats();
        }
    }, [academicYearId]);

    async function loadStats() {
        try {
            // fetchAdminStats returns [students, classes, faculty] arrays
            const [students, classes, faculty] = await fetchAdminStats(academicYearId);
            setStats({
                students: students.length,
                classes: classes.length,
                faculty: faculty.length,
            });
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
                    <p className="text-gray" style={{ margin: 0, fontSize: '1.1rem' }}>Welcome to the Anikethana administration portal.</p>
                </div>
                <span className="badge badge-blue" style={{ padding: '0.5rem 0.5rem', fontSize: '0.9rem' }}>Academic Year Active</span>
            </div>

            <div className="flex gap-md" style={{ flexWrap: 'wrap', gap: '2rem' }}>
                <div className="card flex flex-col items-center justify-center p-8 animate-fade-in" style={{ flex: 1, animationDelay: '0.05s', minWidth: '250px' }}>
                    <div style={{ padding: '1.25rem', background: 'var(--royal-light)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                        <Users size={40} className="text-royal" />
                    </div>
                    <h2 className="text-4xl font-bold" style={{ marginBottom: '0.5rem' }}>{stats.students}</h2>
                    <p className="text-gray" style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Students</p>
                </div>

                <div className="card flex flex-col items-center justify-center p-8 animate-fade-in" style={{ flex: 1, animationDelay: '0.1s', minWidth: '250px' }}>
                    <div style={{ padding: '1.25rem', background: '#ecfccb', borderRadius: '50%', marginBottom: '1.5rem' }}>
                        <Layers size={40} style={{ color: '#65a30d' }} />
                    </div>
                    <h2 className="text-4xl font-bold" style={{ marginBottom: '0.5rem' }}>{stats.classes}</h2>
                    <p className="text-gray" style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Classes</p>
                </div>

                <div className="card flex flex-col items-center justify-center p-8 animate-fade-in" style={{ flex: 1, animationDelay: '0.15s', minWidth: '250px' }}>
                    <div style={{ padding: '1.25rem', background: '#fffbeb', borderRadius: '50%', marginBottom: '1.5rem' }}>
                        <BookOpen size={40} className="text-gold" />
                    </div>
                    <h2 className="text-4xl font-bold" style={{ marginBottom: '0.5rem' }}>{stats.faculty}</h2>
                    <p className="text-gray" style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Faculty</p>
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
