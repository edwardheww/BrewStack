import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar.js';
import { supabase } from '../lib/supabase.js';
import { type SavedBean, type SavedBeanStatus } from '../types/index.js';

function splitNotes(notes?: string) {
    if (!notes) return [];
    return notes.split(/,|;/).map(note => note.trim()).filter(Boolean).slice(0, 4);
}

function money(price?: number) {
    if (!price) return 'N/A';
    return `$${price}`;
}

const statusLabels: Record<SavedBeanStatus, string> = {
    want_to_try: 'Want to try',
    tried: 'Tried',
    loved: 'Loved',
    not_for_me: 'Not for me',
};

const statusOptions: SavedBeanStatus[] = [
    'want_to_try',
    'tried',
    'loved',
    'not_for_me',
];

function BeanImage({ src, alt }: { src?: string; alt: string }) {
    const [failed, setFailed] = useState(false);

    // handles both missing image URLs and broken roaster image links.
    if (!src || failed) {
        return <span>Image unavailable</span>;
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
        />
    );
}

export default function SavedBeans() {  // Fetch saved beans from the backend for the logged-in user
    const [beans, setBeans] = useState<SavedBean[]>([]);
    const [message, setMessage] = useState('Loading saved beans...');
    const [statusFilter, setStatusFilter] = useState<'all' | SavedBeanStatus>('all');

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

    async function updateSavedBean(
        savedBeanId: string,
        updates: Partial<Pick<SavedBean, 'status' | 'notes' | 'rating'>>
    ) { 
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
            setMessage('Log in to manage saved beans.');
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/me/saved-beans/${savedBeanId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            setMessage('Could not update saved bean.');
            return;
        }
        
        setBeans(current => current.map(bean => bean.id === savedBeanId ? { ...bean, ...updates } : bean));
    }

    useEffect(() => {
        loadSavedBeans();
    }, []);

    const visibleBeans = statusFilter === 'all' ? beans : beans.filter(bean => bean.status === statusFilter); // filtering for saved beans stays client

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

                    <div className="saved-filter-bar">
                        <button
                            className={statusFilter === 'all' ? 'saved-filter active' : 'saved-filter'}
                            onClick={() => setStatusFilter('all')}
                            >
                                All
                            </button>
                            
                            {statusOptions.map(status => (
                                <button
                                    key={status}
                                    className={statusFilter === status ? 'saved-filter active' : 'saved-filter'}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {statusLabels[status]}
                                </button>
                            ))}

                    </div>

                    <div className="bean-grid">
                        {visibleBeans.map(bean => {
                            const notes = splitNotes(bean.flavourNotes);

                            return(
                                <article className="bean-card" key={bean.id}>
                                    <div className="bean-image">
                                        <BeanImage src={bean.imageUrl} alt={bean.name} />
                                    </div>

                                    <div className="bean-body">
                                        <div className="bean-title-row">
                                            <div>
                                                <h2>{bean.name}</h2>
                                                <p className="roaster">{bean.roaster?.name || 'N/A'}</p>

                                                {bean.isUnavailable && (
                                                    <p className="saved-unavailable">No longer available from roaster</p>
                                                )}
                                            </div>
                                            <strong className="price">{money(bean.price)}</strong>
                                        </div>

                                        <div className="saved-account-controls">
                                            <label>
                                                <span className="meta-label">Status</span>
                                                <select 
                                                    value={bean.status || 'want_to_try'}
                                                    onChange={event => updateSavedBean(bean.id, {status: event.target.value as SavedBeanStatus,})
                                                    }
                                                >
                                                    {statusOptions.map(status => (
                                                        <option key={status} value={status}>
                                                            {statusLabels[status]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
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

                                        <label className="personal-notes">
                                            <span className="meta-label">Personal Notes</span>
                                            <textarea
                                                value={bean.notes || ''}
                                                placeholder="Add brew notes, thoughts, or whether you would buy this again..."
                                                onChange={event =>
                                                    setBeans(current =>
                                                        current.map(currentBean =>
                                                            currentBean.id === bean.id
                                                            ? { ...currentBean, notes: event.target.value }
                                                            : currentBean
                                                        )
                                                    )
                                                }
                                                // Save notes when the user leaves the textarea instead of on every keystroke
                                                onBlur={event =>
                                                    updateSavedBean(bean.id, {
                                                        notes: event.target.value,
                                                    })
                                                }
                                            />
                                        </label>

                                        <p className="updated">Saved on {new Date(bean.createdAt).toISOString().slice(0, 10)}</p>

                                        <div className="saved-actions">
                                            <a href={bean.url} target="_blank" rel="noreferrer">View Coffee</a>
                                            <button onClick={() => unsaveBean(bean.id)}>Unsave</button>

                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    {beans.length > 0 && visibleBeans.length === 0 && (
                        <p className="saved-message">No saved beans in this status yet.</p>
                    )}
                </section>
            </main>
        </div>
    );
}