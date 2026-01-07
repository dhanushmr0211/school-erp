import { useState } from "react";
import { User, ChevronDown, GraduationCap, BookOpen, Users, LogIn, ArrowRight, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function LandingPage() {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogin = (role) => {
        navigate(`/login?role=${role}`);
    };
    /* ... existing code ... */
    function RoleOption({ label, icon, onClick }) {
        return (
            <button
                onClick={onClick}
                style={{
                    display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem",
                    background: "transparent", border: "none", color: "var(--text-secondary)",
                    width: "100%", textAlign: "left", cursor: "pointer", borderRadius: "0.5rem",
                    transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--royal-light)"; e.currentTarget.style.color = "var(--royal-blue)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
                <div className={`icon-container ${label.includes("Student") ? "text-accent" : label.includes("Faculty") ? "text-rose" : "text-violet"}`} style={{ display: 'flex' }}>
                    {icon}
                </div>
                {label}
            </button>
        );
    }

    return (
        <div className="animate-fade-in" style={{ minHeight: "100vh" }}>
            {/* Navbar */}
            <nav style={{
                position: "fixed", top: 0, width: "100%", zIndex: 100,
                background: "rgba(162, 136, 209, 0.85)", backdropFilter: "blur(12px)",
                borderBottom: "1px solid var(--glass-border)"
            }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
                    <div className="flex items-center gap-md">
                        <img src="/logo.png" alt="Logo" style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid var(--accent-violet)" }} />
                        <h1 style={{ fontSize: "1.25rem", margin: 0, background: "none", WebkitTextFillColor: "white" }}>
                            Anikethana <span className="text-violet">Education</span>
                        </h1>
                    </div>

                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="btn btn-secondary"
                            style={{ padding: "0.5rem 1rem", borderRadius: "2rem", gap: "0.5rem" }}
                        >
                            <User size={18} />
                            <span>Portal Login</span>
                            <ChevronDown size={16} />
                        </button>

                        {dropdownOpen && (
                            <div className="card" style={{
                                position: "absolute", top: "120%", right: 0, width: "220px", padding: "0.5rem",
                                display: "flex", flexDirection: "column", gap: "0.25rem", zIndex: 101
                            }}>
                                <RoleOption label="Admin Login" icon={<BookOpen size={16} />} onClick={() => handleLogin('ADMIN')} />
                                <RoleOption label="Faculty Login" icon={<Users size={16} />} onClick={() => handleLogin('FACULTY')} />
                                <RoleOption label="Student Login" icon={<GraduationCap size={16} />} onClick={() => handleLogin('STUDENT')} />
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <header className="container" style={{ paddingTop: "10rem", paddingBottom: "5rem", textAlign: "center" }}>
                <div className="animate-fade-in stagger-1">
                    <span className="badge badge-blue" style={{ marginBottom: "1rem", display: "inline-block" }}>Excellence Since 2010</span>
                    <h2 style={{ fontSize: "4rem", lineHeight: 1.1, marginBottom: "1.5rem" }}>
                        The Future of <br />
                        <span className="text-violet">Learning</span> & <span className="text-rose">Innovation</span>
                    </h2>
                </div>

                <p className="text-gray animate-fade-in stagger-2" style={{ fontSize: "1.25rem", maxWidth: "700px", margin: "0 auto 2.5rem" }}>
                    Empowering the next generation with world-class facilities and a holistic approach to education.
                </p>

                <div className="animate-fade-in stagger-3">
                    <button
                        onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                        className="btn btn-primary"
                        style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}
                    >
                        Explore Campus <ArrowRight size={18} />
                    </button>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="container" style={{ paddingBottom: "5rem" }}>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem"
                }}>
                    <FeatureCard
                        icon={<BookOpen size={32} className="text-violet" />}
                        title="Modern Curriculum"
                        desc="A forward-looking curriculum that blends tradition with future-ready skills."
                    />
                    <FeatureCard
                        icon={<Users size={32} className="text-rose" />}
                        title="Expert Faculty"
                        desc="Dedicated mentors who guide students towards their valid career paths."
                    />
                    <FeatureCard
                        icon={<GraduationCap size={32} className="text-accent" />}
                        title="Holistic Growth"
                        desc="A perfect balance of Sports, Arts, and Academics for total development."
                    />
                </div>
            </section>

            {/* Gallery Section */}
            <section className="container" style={{ paddingBottom: "5rem" }}>
                <h3 style={{ textAlign: "center", marginBottom: "3rem" }}>Campus Life</h3>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem"
                }}>
                    {["Library", "Science Lab", "Sports Complex", "Pool", "Auditorium", "Art Studio"].map((item, i) => (
                        <div key={i} className="card" style={{
                            height: "200px", display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(255,255,255,0.03)"
                        }}>
                            <span className="text-gray" style={{ fontWeight: 600 }}>{item}</span>
                        </div>
                    ))}
                </div>
            </section>


            {/* Contact Section */}
            <section className="container" style={{ paddingBottom: "5rem" }}>
                <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Get in Touch</h3>
                    <ContactForm />
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: "1px solid var(--glass-border)", padding: "3rem 1rem", background: "rgba(217, 119, 232, 0.85)" }}>
                <div className="container text-center">
                    <div className="flex items-center justify-center gap-sm mb-md opacity-50">
                        <img src="/logo.png" alt="Logo" style={{ width: "30px", filter: "grayscale(1)" }} />
                        <span style={{ fontWeight: 700, color: "white" }}>Anikethana</span>
                    </div>
                    <p className="text-gray" style={{ fontSize: "0.9rem" }}>© 2025 Anikethana Educational Institution. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}


function FeatureCard({ icon, title, desc }) {
    return (
        <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.5rem", display: "inline-block" }}>
                {icon}
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{title}</h3>
            <p className="text-gray" style={{ fontSize: "0.95rem" }}>{desc}</p>
        </div>
    );
}

function ContactForm() {
    const [formData, setFormData] = useState({ name: "", phone: "", query: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from("contact_queries").insert([
            { name: formData.name, phone: formData.phone, query: formData.query }
        ]);

        setLoading(false);

        if (error) {
            alert("Error sending message: " + error.message);
        } else {
            alert("Message sent successfully!");
            setFormData({ name: "", phone: "", query: "" });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label className="text-sm font-semibold text-gray-400">Your Name</label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                />
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-400">Phone Number</label>
                <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                />
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-400">Query</label>
                <textarea
                    required
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    placeholder="How can we help you?"
                    rows={4}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border-soft)" }}
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center' }}
            >
                {loading ? "Sending..." : <>Send Message <Send size={18} /></>}
            </button>
        </form>
    );
}
