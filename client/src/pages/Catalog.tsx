import { useState, useEffect, useMemo} from 'react';
import { type Bean } from '../types/index.js';

const sampleOrigins = [ // hardcoded sample origins for testing purposes
  'Colombia, Cauca',
  'Ethiopia, Yirgacheffe',
  'Guatemala, Huehuetenango',
  'Costa Rica, Tarrazu',
  'Rwanda, Nyamasheke',
  'Tanzania, Arusha',
];

function splitNotes( notes?: string) {
    if (!notes) return [];
    return notes.split(/,|;/).map(note => note.trim()).filter(Boolean).slice(0, 4); // Limit to 4 notes
}

function money(price?: number) {
    if (!price) return 'N/A';
    return `$${price}`;
}

function NavBar() {
    return (
        <header className="site-nav">
            <div className="brand">BrewStack</div>
            <nav>
                <a>Catalog</a>
                <a>Roasters</a>
                <a>Tasting Notes</a>
                <a> Saved Beans</a>
            </nav>
            <button className="search-button" aria-label="Search">⌕</button>
        </header>
    );
}

function FilterBar() {
    const filters = ['Roaster', 'Origin', 'Roast Level', 'Process', 'Tasting Notes', 'Price'];

    return (
        <div className="filter-bar">
            {filters.map(filter => (
                <button key={filter} className="filter-button">
                    <span>{filter}</span>
                    <span className="filter-arrow">▾</span>
                </button>
            ))}
        </div>
    );
}

function BeanCard({ bean, index }: { bean: Bean; index: number }) {
    const notes = splitNotes(bean.flavourNotes);
    const origin = sampleOrigins[index % sampleOrigins.length]; // Assign a random sample origin based on index for POC purposes

    return (
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

                <p className="updated">Updated recently</p>
            </div>
        </article>
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

                {(popularNotes.length > 0 ? popularNotes : [['jasmine', 24], ['blueberry', 18], ['chocolate', 31], ['stone fruit', 15], ] as [string, number][] ).map(([note, count]) => ( 
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

    useEffect(() => {
        fetch('http://localhost:3000/beans')
            .then(response => response.json())
            .then(data => setBeans(data.filter((bean: Bean) => bean.flavourNotes)))
            .catch(error => console.error('Error fetching beans:', error));
    }, []);

    return (
        <div className="catalog_page">
            <NavBar/>

            <main className="catalog-shell">
                <section className="catalog-main">
                    <div className="page-heading">
                        <h1>Bean Catalog</h1>
                        <p>Track fresh drops, tasting notes, origins, and roasters in one place.</p>
                    </div>

                    <FilterBar/>

                    <div className="bean-grid">
                        {beans.map((bean, index) => (
                            <BeanCard key={bean.id} bean={bean} index={index} />
                        ))}
                    </div>
                </section>

                <Sidebar beans={beans} />
            </main>
        </div>
    );
}


                