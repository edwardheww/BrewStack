import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar.js';
import { supabase } from '../lib/supabase.js';
import { type Bean } from '../types/index.js';

function splitNotes(notes?: string) {
    if (!notes) return [];
    return notes.split(/,|;/).map(note => note.trim()).filter(Boolean).slice(0, 4);
}

function money(price?: number) {
    if (!price) return 'N/A';
    return `$${price}`;
}

function updatedDate(updatedAt?: Date | string) {
    if (!updatedAt) return 'Updated date unavailable';

    return `Updated on ${new Date(updatedAt).toISOString().slice(0, 10)}`;
}

export default function SavedBeans() {  // Fetch saved beans from the backend for the logged-in user
    const [beans, setBeans] = useState<Bean[]>([]);
    const [message, setMessage] = useState('Loading saved beans...');

    async function loadSavedBeans() { // Fetch saved beans from the backend for the logged-in user
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
            setMessage('Log in to view your saved beans.');
            setBeans([]);
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/me/saved-beans`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },

        });

        if (!response.ok) {
            setMessage('Could not load saved beans.');
            return;
        }

        const savedBeans = await response.json();  // The backend returns normal Bean objects, so the page can render them like catalog cards
        setBeans(savedBeans);
        setMessage(savedBeans.length ? '' : 'No saved beans yet.');
    }

    async function unsaveBean(beanId: string) { // Remove one bean from the user's saved list
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
            setMessage('Log in to manage saved beans.');
            return;
        }

        await fetch(`${import.meta.env.VITE_API_URL}/me/saved-beans/${beanId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setBeans(current => current.filter(bean => bean.id !== beanId));
    }

    useEffect(() => {
        loadSavedBeans();
    }, []);

    return (
        <div className="catalog_page">
            <NavBar />

            <main className="catalog-shell saved-shell">
                <section className="catalog-main">
                    <div className="page-heading">
                        <h1>Saved Beans</h1>
                        <p>Keep track of coffees you want to try again or buy later.</p>
                    </div>

                    {message && <p className="saved-message">{message}</p>}

                    <div className="bean-grid">
                        {beans.map(bean => {
                            const notes = splitNotes(bean.flavourNotes);

                            return(
                                <article className="bean-card" key={bean.id}>
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
                                                <h2>{bean.name}</h2>
                                                <p className="roaster">{bean.roaster?.name || 'N/A'}</p>
                                            </div>
                                            <strong className="price">{money(bean.price)}</strong>
                                        </div>

                                        <p className="origin">{bean.region || 'N/A'}</p>

                                        <div className="meta-grid">
                                            <div>
                                                <span className="meta-label">Roast</span>
                                                <span className="soft-badge">{bean.roastLevel ?? 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="meta-label">Process</span>
                                                <span className="soft-badge">{bean.processingMethod ?? 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="meta-label">Varietal</span>
                                                <span className="soft-badge">{bean.varietal ?? 'N/A'}</span>                                              
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

                                        <p className="updated">{updatedDate(bean.updatedAt)}</p>

                                        <div className="saved-actions">
                                            <a href={bean.url} target="_blank" rel="noreferrer">View Coffee</a>
                                            <button onClick={() => unsaveBean(bean.id)}>Unsave</button>

                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}