import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Loader2, Trash2 } from "lucide-react";
import { useAcademicYear } from "../../context/AcademicYearContext";

export default function Queries() {
    const { academicYearId } = useAcademicYear();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    useEffect(() => {
        if (academicYearId) {
            setPage(0);
            setQueries([]);
            fetchQueries(0);
        }
    }, [academicYearId]);

    const fetchQueries = async (pageNum) => {
        setLoading(true);
        const from = pageNum * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from("contact_queries")
            .select("*", { count: "exact" })
            .eq("academic_year_id", academicYearId)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching queries:", error);
        } else {
            if (pageNum === 0) {
                setQueries(data || []);
            } else {
                setQueries(prev => [...prev, ...(data || [])]);
            }
            setHasMore(data?.length === pageSize);
        }
        setLoading(false);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchQueries(nextPage);
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
                    No inquiries found for this academic year.
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {queries.map((q) => (
                            <div key={q.id} className="card relative hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-royal-blue">{q.name}</h3>
                                        <p className="text-sm text-gray-600 font-medium">{q.phone}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">
                                        {new Date(q.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-100 italic">
                                    "{q.query}"
                                </p>

                                <button
                                    onClick={() => handleDelete(q.id)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="Delete Query"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="btn btn-secondary px-8 py-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Load More Inquiries"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
