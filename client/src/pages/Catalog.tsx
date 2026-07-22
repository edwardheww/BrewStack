import { useState, useEffect, useMemo } from 'react';
import { type Bean } from '../types/index.js';
import NavBar from '../components/NavBar.js';
import { supabase } from '../lib/supabase.js';

function splitNotes(notes?: string) {
    if (!notes) return [];
    return notes.split(/,|;/).map(note => note.trim()).filter(Boolean).slice(0, 4); // Limit to 4 notes
}

function money(price?: number) {
    if (!price) return 'N/A';
    return `$${price}`;
}

function updatedDate(updatedAt?: Date | string) {
    if (!updatedAt) return 'Updated date unavailable';

    return `Updated on ${new Date(updatedAt).toISOString().slice(0, 10)}`;
}

type Filters = {
    roaster: string;
    origin: string;
    roastLevel: string;
    process: string;
};

function FilterBar({ filters, setFilters,
}: {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {

    return (
        <div className="filter-bar">
            <select className="filter-button" value={filters.roaster} onChange={e => setFilters({ ...filters, roaster: e.target.value })}>
                <option value="">--Roaster--</option>
                <option value="Tiong Hoe">Tiong Hoe</option>
                <option value="HomeGround">HomeGround</option>
                <option value="Nylon">Nylon</option>
                <option value="Alchemist">Alchemist</option>
                <option value="Community Coffee">Community Coffee</option>
                <option value="Kyuukei Coffee">Kyuukei Coffee</option>
            </select>
            <select className="filter-button" value={filters.origin} onChange={e => setFilters({ ...filters, origin: e.target.value })}>
                <option value="">--Origin--</option>
                <option value="Colombia">Colombia</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Peru">Peru</option>
                <option value="Brazil">Brazil</option>
            </select>
            <select className="filter-button" value={filters.roastLevel} onChange={e => setFilters({ ...filters, roastLevel: e.target.value })}>
                <option value="">--Roast Level--</option>
                <option value="Filter">Filter</option>
                <option value="Espresso">Espresso</option>
                <option value="Light">Light</option>
                <option value="Medium">Medium</option>
                <option value="Dark">Dark</option>
            </select>
            <select className="filter-button" value={filters.process} onChange={e => setFilters({ ...filters, process: e.target.value })}>
                <option value="">--Process--</option>
                <option value="Washed">Washed</option>
                <option value="Natural">Natural</option>
                <option value="Honey">Honey</option>
            </select>
        </div>


    );
}

function BeanCard({ bean }: { bean: Bean; }) {
    const notes = splitNotes(bean.flavourNotes);
    const origin = bean.region?.trim() || 'N/A';
    const [savedMessage, setSavedMessage] = useState('');

    async function saveBean(event: React.MouseEvent) {  // Save the current bean for the logged-in user
        event.preventDefault();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/me/saved-beans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ beanId: bean.id }),
        });

        if (response.ok) {
            setSavedMessage('Saved!');
            setTimeout(() => setSavedMessage(''), 2000);
        }
        else {
            setSavedMessage('Could not save.');
        }
    }

    return (
        <a
            className="bean-card-link" // clicking on each product opens the actual roaster's product page in a new tab
            href={bean.url}
            target="_blank"
            rel="noreferrer"
        >

            <article className="bean-card">
                <div className="bean-image">
                    {bean.imageUrl ? (
                        <img src={bean.imageUrl} alt={bean.name} />
                    ) : (
                        <span>Coffee Image</span>
                    )}
                </div>

                <div className="bean-body">
                    <div className="bean-title-row">
                        <div>
                            <h2> {bean.name} </h2>
                            <p className="roaster"> {bean.roaster?.name || 'N/A'} </p>
                        </div>
                        <strong className="price"> {money(bean.price)} </strong>
                    </div>

                    <p className="origin"> {origin} </p>

                    <div className="meta-grid">
                        <div>
                            <span className="meta-label">Roast</span>
                            <span className="soft-badge">{bean.roastLevel ?? 'N/A,POC'}</span>
                        </div>
                        <div>
                            <span className="meta-label">Process</span>
                            <span className="soft-badge">{bean.processingMethod ?? 'N/A,POC'}</span>
                        </div>
                        <div>
                            <span className="meta-label">Varietal</span>
                            <span className="soft-badge">{bean.varietal ?? 'N/A,POC'}</span>
                        </div>
                    </div>

                    <div className="notes-block">
                        <span className="meta-label">Tasting Notes</span>
                        <div className="note-list">
                            {notes.length > 0 ? notes.map(note => (
                                <span key={note} className="note-pill">{note}</span>
                            )) : <span className="note-pill">N/A</span>}

                        </div>
                    </div>

                    <div className="save-feedback-row">
                        <button className="save-bean-button" onClick={saveBean}>Save Bean</button>
                        {savedMessage && <span className="save-feedback">{savedMessage}</span>}
                    </div>
                    <p className="updated">{updatedDate(bean.updatedAt)}</p>
                </div>
            </article>
        </a>
    );
}

function Sidebar({ beans }: { beans: Bean[] }) {
    const popularNotes = useMemo(() => {
        const counts = new Map<string, number>();

        beans.forEach(bean => {
            splitNotes(bean.flavourNotes).forEach(note => {
                counts.set(note, (counts.get(note) || 0) + 1);
            });
        });

        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
    }, [beans]);

    return (
        <aside className="sidebar">
            <section className="side-panel">
                <h3>Fresh Drops</h3>
                {beans.slice(0, 3).map(bean => (
                    <div className="fresh-item" key={bean.id}>
                        <strong>{bean.name}</strong>
                        <span>{bean.roaster?.name || 'N/A'}</span>
                    </div>
                ))}
            </section>

            <section className="side-panel">
                <h3>Popular Notes</h3>

                {(popularNotes.length > 0 ? popularNotes : [['jasmine', 24], ['blueberry', 18], ['chocolate', 31], ['stone fruit', 15],] as [string, number][]).map(([note, count]) => (
                    <div className="note-count" key={note}>
                        <span>{note}</span>
                        <strong>{count}</strong>
                    </div>
                ))}
            </section>

            <section className="side-panel">
                <h3>Roasters to Follow</h3>
                <p>New micro-roasters focusing on single-origin, direct-trade relationships.</p>
            </section>
        </aside>
    );
}

export default function Catalog() {
    const [beans, setBeans] = useState<Bean[]>([]);
    const [searchQuery, setSearchQuery] = useState(''); // store what user types in the search bar

    const [filters, setFilters] = useState<Filters>({
        roaster: '',
        origin: '',
        roastLevel: '',
        process: '',
    });

    function buildBeansUrl() {
        const params = new URLSearchParams();

        if (searchQuery.trim()) { // add query only if user typed something
            params.set('search', searchQuery.trim());
        }

        if (filters.roaster) {
            params.set('roaster', filters.roaster);
        }

        if (filters.origin) {
            params.set('origin', filters.origin);
        }

        if (filters.roastLevel) {
            params.set('roastLevel', filters.roastLevel);
        }

        if (filters.process) {
            params.set('process', filters.process);
        }

        const queryString = params.toString();
        return `${import.meta.env.VITE_API_URL}/beans${queryString ? `?${queryString}` : ''}`;
    }
    

    function fetchBeans() { // Fetch beans based on current search and filter criteria
        fetch(buildBeansUrl())
            .then(response => response.json())
            .then(data => setBeans(data))
            .catch(error => console.error('Error fetching beans:', error));
    }

    // filtering now happening through backend, so we can just fetch beans whenever searchQuery or filters change
    useEffect(() => {
        fetchBeans();
    }, [searchQuery, filters]);

    // Subsequent fetches should db update mid-browsing.
    useEffect(() => {
        const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/events`);
        eventSource.onopen = () => console.log('SSE connected');
        eventSource.onmessage = (e) => console.log('SSE message:', e.data);
        eventSource.onerror = (e) => console.log('SSE error:', e);
        eventSource.onmessage = () => {
            fetch(`${import.meta.env.VITE_API_URL}/beans`)
                fetchBeans();
        };
        return () => eventSource.close();
    }, []);


    return (
        <div className="catalog_page">
            <NavBar />

            <main className="catalog-shell">
                <section className="catalog-main">
                    <div className="page-heading">
                        <h1>Bean Catalog</h1>
                        <p>Track fresh drops, tasting notes, origins, and roasters in one place.</p>
                    </div>

                    <div className="catalog-search">
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by bean name, roaster, or origin..."
                            type = "search"
                        />

                        {searchQuery && (
                            <button type="button" onClick={() => setSearchQuery('')}>
                                Clear
                            </button>
                        )}
                    </div>

                    <FilterBar filters={filters} setFilters={setFilters} />

                    {beans.length > 0 ? (
                        <div className="bean-grid">
                            {beans.map(bean => (
                                <BeanCard key={bean.id} bean={bean} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-catalog">
                            <h2>No Beans Found</h2>
                            <p>Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </section>

                <Sidebar beans={beans} />
            </main>
        </div>
    );
}


