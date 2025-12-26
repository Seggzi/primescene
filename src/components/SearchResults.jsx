import { useEffect, useState } from 'react';

function SearchResults({ query }) {
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const fetchSearch = async () => {
            try {
                const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (err) {
                console.error(err);
            }
        };

        const debounce = setTimeout(fetchSearch, 300); // debounce 300ms
        return () => clearTimeout(debounce);
    }, [query]);

    if (!query.trim()) return null;

    if (results.length === 0) {
        return <div className="text-white text-center py-8">No results found</div>;
    }

    // <div
    //     key={item.id}
    //     className="flex items-center gap-4 px-4 py-3 hover:bg-white/10 transition cursor-pointer"
    //     onClick={() => {
    //         setSearchOpen(false);
    //         setQuery('');
    //         window.dispatchEvent(new CustomEvent('openMovieModal', { detail: item }));
    //     }}
    // >
    //     {/* image and text */}
    // </div>

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-8">
            {results.map(item => (
                <div key={item.id} className="group cursor-pointer">
                    <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Image'}
                        alt={item.title || item.name}
                        className="rounded-lg shadow-lg group-hover:scale-105 transition"
                    />
                    <p className="text-white text-center mt-2 text-sm line-clamp-2">
                        {item.title || item.name}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default SearchResults;