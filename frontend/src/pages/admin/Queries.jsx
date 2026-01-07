import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Loader2, Trash2 } from "lucide-react";

export default function Queries() {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("contact_queries")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching queries:", error);
        } else {
            setQueries(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this query?")) return;

        const { error } = await supabase
            .from("contact_queries")
            .delete()
            .eq("id", id);

        if (error) {
            alert("Error deleting query");
        } else {
            setQueries(queries.filter(q => q.id !== id));
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-royal-blue" /></div>;
    }

    return (
        <div className="animate-fade-in">
            <h2 className="mb-6">Public Inquiries</h2>

            {queries.length === 0 ? (
                <div className="text-center p-8 text-gray-500 card">
                    No inquiries found.
                </div>
            ) : (
                <div className="grid gap-4">
                    {queries.map((q) => (
                        <div key={q.id} className="card relative">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-royal-blue">{q.name}</h3>
                                    <p className="text-sm text-gray-500">{q.phone}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(q.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700 mt-2 bg-gray-50 p-3 rounded-md">
                                {q.query}
                            </p>

                            <button
                                onClick={() => handleDelete(q.id)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete Query"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
