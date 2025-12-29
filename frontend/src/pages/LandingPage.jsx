
import { useState } from "react";
import { User, ChevronDown, GraduationCap, BookOpen, Users, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogin = (role) => {
        // We can pass role via state or just let them login generically
        // For now, generic login is fine as the Login page handles all.
        // If customization is needed, we'd pass state: { role }
        navigate("/login");
    };

    return (
        <div style={{
            backgroundColor: "#f8fafc",
            color: "#1e293b",
            minHeight: "100vh",
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header / Navbar */}
            <nav style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid #e2e8f0",
                position: "sticky",
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem 1rem"
                }}>
                    <div className="flex items-center gap-sm">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid #4f46e5"
                            }}
                        />
                        <h1 style={{ fontSize: "1.5rem", margin: 0, color: "#0f172a" }}>
                            Anikethana <span style={{ color: "#4f46e5" }}>Educationational Institution</span>
                        </h1>
                    </div>

                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                background: "white",
                                border: "1px solid #e2e8f0",
                                padding: "0.5rem 1rem",
                                borderRadius: "2rem",
                                cursor: "pointer",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                                color: "#334155",
                                fontWeight: 600
                            }}
                        >
                            <User size={20} />
                            <span>Login Portal</span>
                            <ChevronDown size={16} />
                        </button>

                        {dropdownOpen && (
                            <div style={{
                                position: "absolute",
                                top: "120%",
                                right: 0,
                                background: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.75rem",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                width: "200px",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <RoleOption label="Admin Login" icon={<BookOpen size={16} />} onClick={() => handleLogin('ADMIN')} />
                                <RoleOption label="Faculty Login" icon={<Users size={16} />} onClick={() => handleLogin('FACULTY')} />
                                <RoleOption label="Student Login" icon={<GraduationCap size={16} />} onClick={() => handleLogin('STUDENT')} />
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)",
                padding: "6rem 1rem",
                textAlign: "center"
            }}>
                <div className="container">
                    <h2 style={{
                        fontSize: "3.5rem",
                        color: "#1e293b",
                        marginBottom: "1.5rem",
                        lineHeight: 1.2
                    }}>
                        Excellence in <span style={{ color: "#4f46e5" }}>Education since 15 years</span>
                    </h2>
                    <p style={{
                        fontSize: "1.25rem",
                        color: "#64748b",
                        maxWidth: "700px",
                        margin: "0 auto 3rem auto"
                    }}>
                        Empowering the next generation of leaders with world-class facilities,
                        experienced faculty, and a holistic approach to learning.
                    </p>
                    <div className="flex justify-center gap-md">
                        <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="btn btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>
                            Explore Campus
                        </button>
                    </div>
                </div>
            </header>

            {/* About Section */}
            <section style={{ padding: "5rem 1rem", background: "white" }}>
                <div className="container">
                    <div className="flex flex-col items-center text-center">
                        <span style={{ color: "#4f46e5", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.9rem" }}>
                            About Our School
                        </span>
                        <h3 style={{ fontSize: "2.5rem", color: "#0f172a", marginTop: "0.5rem" }}>
                            Where Potential Meets Opportunity
                        </h3>
                        <p style={{ maxWidth: "800px", color: "#475569", marginTop: "1.5rem", fontSize: "1.1rem" }}>
                            Founded in 1995, EduPrime International has been a beacon of academic excellence.
                            We offer a comprehensive curriculum that blends traditional values with modern
                            teaching methodologies. Our campus spans 20 acres of lush greenery, providing
                            an ideal environment for intellectual and physical growth.
                        </p>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section style={{ padding: "5rem 1rem", background: "#f8fafc" }}>
                <div className="container">
                    <div className="text-center mb-xl">
                        <h3 style={{ fontSize: "2.25rem", color: "#0f172a", marginBottom: "3rem" }}>
                            Campus Life & Gallery
                        </h3>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "2rem"
                    }}>
                        <GalleryItem color="#dbeafe" title="Modern Library" />
                        <GalleryItem color="#e0e7ff" title="Science Labs" />
                        <GalleryItem color="#f3e8ff" title="Sports Complex" />
                        <GalleryItem color="#ffedd5" title="Art Studio" />
                        <GalleryItem color="#dcfce7" title="Smart Classrooms" />
                        <GalleryItem color="#fce7f3" title="Auditorium" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: "#1e293b", color: "#cbd5e1", padding: "4rem 1rem" }}>
                <div className="container text-center">
                    <div className="flex items-center justify-center gap-sm mb-md">
                        <GraduationCap size={40} color="#818cf8" />
                        <h2 style={{ color: "white", margin: 0, fontSize: "1.5rem" }}>EduPrime International</h2>
                    </div>
                    <p>© 2024 EduPrime International School. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function RoleOption({ label, icon, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                border: "none",
                background: "transparent",
                color: "#1e293b",
                fontSize: "0.95rem",
                width: "100%",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
            onMouseLeave={(e) => e.target.style.background = "transparent"}
        >
            <div style={{ color: "#4f46e5" }}>{icon}</div>
            {label}
        </button>
    );
}

function GalleryItem({ color, title }) {
    return (
        <div style={{
            background: color,
            height: "250px",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease",
            cursor: "pointer"
        }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
            <h4 style={{ color: "#334155", fontSize: "1.25rem" }}>{title}</h4>
        </div>
    );
}
