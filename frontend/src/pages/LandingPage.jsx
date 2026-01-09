import { useState, useEffect } from "react";
import { User, ChevronDown, GraduationCap, BookOpen, Users, LogIn, ArrowRight, Send, MapPin, Phone, Mail, Navigation, Menu, X, Facebook, Instagram, Linkedin, Twitter, Dribbble } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function LandingPage() {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [typewriterText, setTypewriterText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [currentLang, setCurrentLang] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
    const [isEntering, setIsEntering] = useState(false);

    const texts = ["15 years", "2010"];
    const descriptions = [
        '"We are committed to the overall development of children through quality, value-based education in a safe environment."',
        '"ನಾವು ಭದ್ರ ಮತ್ತು ಸಹಾಯಕ ವಾತಾವರಣದಲ್ಲಿ ಗುಣಮಟ್ಟದ ಹಾಗೂ ಮೌಲ್ಯಾಧಾರಿತ ಶಿಕ್ಷಣದ ಮೂಲಕ ಮಕ್ಕಳ ಸಮಗ್ರ ಬೆಳವಣಿಗೆಗೆ ಬದ್ಧರಾಗಿದ್ದೇವೆ."'
    ];

    // Typewriter effect
    useEffect(() => {
        const currentText = texts[loopNum % texts.length];

        let timeout;

        if (!isDeleting && typewriterText === currentText) {
            // Finished typing, pause then start deleting
            timeout = setTimeout(() => setIsDeleting(true), 3000);
        } else if (isDeleting && typewriterText === "") {
            // Finished deleting, move to next text
            timeout = setTimeout(() => {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }, 1000);
        } else {
            // Continue typing or deleting - faster typing speed
            const typeSpeed = isDeleting ? 120 : 130;
            timeout = setTimeout(() => {
                if (isDeleting) {
                    setTypewriterText(currentText.substring(0, typewriterText.length - 1));
                } else {
                    setTypewriterText(currentText.substring(0, typewriterText.length + 1));
                }
            }, typeSpeed);
        }

        return () => clearTimeout(timeout);
    }, [typewriterText, isDeleting, loopNum]);

    // Language switching effect
    useEffect(() => {
        const interval = setInterval(() => {
            setFadeOut(true);
            setTimeout(() => {
                setCurrentLang((prev) => (prev + 1) % descriptions.length);
                setIsEntering(true);
                setTimeout(() => {
                    setFadeOut(false);
                    setTimeout(() => {
                        setIsEntering(false);
                    }, 100);
                }, 50);
            }, 800);
        }, 6000);

        return () => clearInterval(interval);
    }, []);

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
            {/* Navbar */}
            {/* Navbar */}
            <nav style={{
                position: "fixed", top: 0, width: "100%", zIndex: 100,
                background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(8px)",
                borderBottom: "1px solid var(--border-soft)"
            }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
                    {/* Brand */}
                    <div className="flex items-center gap-md">
                        <img src="/logo.png" alt="Logo" style={{ width: "45px", height: "45px" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                            <h1 style={{ fontSize: "1.5rem", margin: 0, color: "#4f46e5", fontWeight: 700, lineHeight: 1.2 }}>
                                Anikethana <span style={{ color: "#4338ca", display: "none" }} className="md:inline">Educational Institution</span>
                            </h1>
                            <p style={{ fontSize: "0.75rem", margin: 0, color: "#64748b", fontWeight: 300, letterSpacing: "0.5px" }}>
                                An English Medium School
                            </p>
                        </div>
                    </div>


                    {/* Right Side Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>

                        {/* Admission Now (Visible always, slightly adjusted for mobile) */}
                        <button
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                            className="btn"
                            style={{
                                padding: "0.5rem 0.5rem",
                                borderRadius: "0.5rem",
                                background: "#f59e0b",
                                color: "white",
                                fontWeight: 600,
                                border: "none",
                                boxShadow: "0 2px 4px rgba(245, 158, 11, 0.3)",
                                fontSize: "0.9rem"
                            }}
                        >
                            Admission Now
                        </button>

                        {/* Login Button (Visible always) */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="btn"
                                style={{
                                    padding: "0.5rem",
                                    borderRadius: "2rem",
                                    gap: "0.5rem",
                                    background: "white",
                                    border: "1px solid #e2e8f0",
                                    color: "#475569",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                                }}
                            >
                                <User size={20} />
                                <span className="hidden md:inline">Login</span>
                                <ChevronDown size={16} className="hidden md:block" />
                            </button>

                            {dropdownOpen && (
                                <div className="card" style={{
                                    position: "absolute", top: "120%", right: 0, width: "220px", padding: "0.5rem",
                                    display: "flex", flexDirection: "column", gap: "0.25rem", zIndex: 101,
                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                                }}>
                                    <RoleOption label="Admin Login" icon={<BookOpen size={16} />} onClick={() => handleLogin('ADMIN')} />
                                    <RoleOption label="Faculty Login" icon={<Users size={16} />} onClick={() => handleLogin('FACULTY')} />
                                    <RoleOption label="Student Login" icon={<GraduationCap size={16} />} onClick={() => {
                                        setDropdownOpen(false);
                                        handleLogin('STUDENT');
                                    }} />
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle (3 lines) */}
                        <button
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                background: "none", border: "none", color: "#1e293b", cursor: "pointer",
                                padding: "0.25rem", display: "flex", alignItems: "center"
                            }}
                        >
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="md:hidden animate-fade-in" style={{
                        position: "absolute", top: "100%", left: 0, width: "100%",
                        background: "white", borderBottom: "1px solid var(--border-soft)",
                        padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}>
                        {["About Us", "Contact", "Gallery"].map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    if (item === "Contact") {
                                        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                                    } else if (item === "About Us") {
                                        document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                                    } else if (item === "Gallery") {
                                        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                style={{
                                    background: "none", border: "none", fontSize: "1.1rem", fontWeight: 600,
                                    color: "#1e293b", textAlign: "left", padding: "0.5rem",
                                    borderBottom: "1px solid #f1f5f9"
                                }}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Hero */}
            <header className="container" style={{ paddingTop: "12rem", paddingBottom: "6rem", textAlign: "center" }}>
                <div className="animate-fade-in stagger-1">
                    <h2 style={{ fontSize: "4.5rem", lineHeight: 1.1, marginBottom: "1.5rem", color: "#1e293b", fontWeight: 800 }}>
                        Excellence in <span style={{ color: "#6366f1" }}>Education</span> since{" "}
                        <span style={{
                            color: "#f59e0b",
                            borderRight: "2px solid #f59e0b",
                            paddingRight: "5px",
                            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "inline-block",
                            opacity: typewriterText.length > 0 ? 1 : 0.2,
                            transform: typewriterText.length > 0 ? "translateY(0)" : "translateY(2px)",
                            filter: typewriterText.length > 0 ? "blur(0px)" : "blur(0.5px)"
                        }}>
                            {typewriterText}
                        </span>
                    </h2>
                </div>

                <p
                    className="text-gray animate-fade-in stagger-2"
                    style={{
                        fontSize: "1.25rem",
                        maxWidth: "700px",
                        margin: "0 auto 3rem",
                        lineHeight: 1.6,
                        fontStyle: "italic",
                        transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
                        opacity: fadeOut ? 0 : 1,
                        transform: fadeOut ? "translateY(-20px)" : (isEntering ? "translateY(20px)" : "translateY(0)")
                    }}
                >
                    {descriptions[currentLang]}
                </p>

                <div className="animate-fade-in stagger-3">
                    <button
                        onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                        className="btn"
                        style={{
                            fontSize: "1.1rem",
                            padding: "1rem 2.5rem",
                            background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)"
                        }}
                    >
                        Explore Campus
                    </button>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="container" style={{ paddingBottom: "5rem" }}>
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <h3 style={{ fontSize: "0.875rem", color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "0.5rem" }}>
                        About Our School
                    </h3>
                    <h2 style={{ fontSize: "2.5rem", color: "#1e293b", fontWeight: 800 }}>
                        Where Potential Meets Opportunity
                    </h2>
                </div>

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
            <section id="gallery" className="container" style={{ paddingBottom: "5rem" }}>
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
            {/* Contact Section */}
            <section id="contact" className="container" style={{ paddingBottom: "5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>

                    {/* Left: Contact Form */}
                    <div>
                        <div className="card" style={{ padding: "2rem", height: "100%", borderTop: "4px solid var(--royal-blue)" }}>
                            <h3 className="text-royal" style={{ fontSize: "1.75rem", marginBottom: "2rem", fontWeight: 700 }}>Write a Message</h3>
                            <ContactForm />
                        </div>
                    </div>

                    {/* Right: Location & Info */}
                    <div>
                        <div className="card" style={{ padding: "2rem", height: "100%", borderTop: "4px solid var(--rose)" }}>
                            <h3 className="text-royal" style={{ fontSize: "1.75rem", marginBottom: "2rem", fontWeight: 700 }}>Our Location</h3>

                            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <div style={{
                                        width: "48px", height: "48px", borderRadius: "50%", background: "#ef4444",
                                        display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0
                                    }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "#1f2937" }}>Address</h4>
                                        <p className="text-gray" style={{ lineHeight: 1.5 }}>
                                            Chikkamagalur, Kadur Rd,<br />
                                            9th Cross, Karnataka<br />
                                            Pin Code: 577138
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <div style={{
                                        width: "48px", height: "48px", borderRadius: "50%", background: "#ef4444",
                                        display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0
                                    }}>
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "#1f2937" }}>Phone Number</h4>
                                        <p className="text-gray">7411291438</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <div style={{
                                        width: "48px", height: "48px", borderRadius: "50%", background: "#ef4444",
                                        display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0
                                    }}>
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "#1f2937" }}>Email Address</h4>
                                        <p className="text-gray" style={{ wordBreak: "break-all" }}>aesanikethanaschool@gmail.com</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <div style={{
                                        width: "48px", height: "48px", borderRadius: "50%", background: "#ef4444",
                                        display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0
                                    }}>
                                        <Navigation size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "#1f2937" }}>Google Maps</h4>
                                        <a
                                            href="https://maps.app.goo.gl/CAW4i7gLEbWX7bXZ8?g_st=aw"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-royal hover:underline"
                                            style={{ color: "var(--royal-blue)" }}
                                        >
                                            View Location
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: "1px solid var(--glass-border)", padding: "3rem 1rem", background: "rgba(30, 43, 119, 0.85)" }}>
                <div className="container text-center">
                    <div className="flex items-center justify-center gap-sm mb-md opacity-50">
                        <img src="/logo.png" alt="Logo" style={{ width: "30px", filter: "grayscale(1)" }} />
                        <span style={{ fontWeight: 700, color: "white" }}>Anikethana</span>
                    </div>

                    {/* Social Media Icons */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: "48px", height: "48px", borderRadius: "8px",
                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", transition: "all 0.3s",
                                background: "rgba(255, 255, 255, 0.1)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                                e.currentTarget.style.borderColor = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                            }}
                        >
                            <Facebook size={20} />
                        </a>

                        <a
                            href="https://dribbble.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: "48px", height: "48px", borderRadius: "8px",
                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", transition: "all 0.3s",
                                background: "rgba(255, 255, 255, 0.1)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                                e.currentTarget.style.borderColor = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                            }}
                        >
                            <Dribbble size={20} />
                        </a>

                        <a
                            href="https://www.instagram.com/anikethana2010?igsh=MWo0NWdqZmJrcTg2Yg=="
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: "48px", height: "48px", borderRadius: "8px",
                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", transition: "all 0.3s",
                                background: "rgba(255, 255, 255, 0.1)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                                e.currentTarget.style.borderColor = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                            }}
                        >
                            <Instagram size={20} />
                        </a>

                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: "48px", height: "48px", borderRadius: "8px",
                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", transition: "all 0.3s",
                                background: "rgba(255, 255, 255, 0.1)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                                e.currentTarget.style.borderColor = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                            }}
                        >
                            <Linkedin size={20} />
                        </a>

                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: "48px", height: "48px", borderRadius: "8px",
                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", transition: "all 0.3s",
                                background: "rgba(255, 255, 255, 0.1)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                                e.currentTarget.style.borderColor = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                            }}
                        >
                            <Twitter size={20} />
                        </a>
                    </div>

                    <p className="text-white" style={{ fontSize: "0.9rem" }}>© 2025 Anikethana Education Society. All rights reserved.</p>
                </div>
            </footer>
        </div >
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
                    placeholder="your name"
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
