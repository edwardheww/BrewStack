import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { type Bean } from '../types/index.js';

function money(price?: number) {
    if (!price) return 'N/A';
    return `$${price}`;
}

//landing page for brewstack

export default function Home() {
    const [beans, setBeans] = useState<Bean[]>([]);
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/beans`)
        .then(response => response.json())
        .then(data => setBeans(data))
        .catch(error => console.error('Error fetching beans:', error));
    }, []);
    const freshDrops = useMemo(() => beans.slice(0, 3), [beans]);
    return (
        <div className="home-page">
            <header className="site-nav">    {/* Top navigation bar reused */}
                <Link className="brand home-brand" to="/">BrewStack</Link>
                <nav>
                    <Link to="/catalog">Catalog</Link>
                    <a>Roasters</a>
                    <Link to="/find-my-coffee">Find My Bean</Link>
                    <a>Saved Beans</a>
                </nav>
                <button className="search-button" aria-label="Search">⌕</button>
            </header>

            <main>
                <section className="home-hero">
                    <p className="home-eyebrow">Singapore's Specialty Coffee, In One Place</p>
                    <h1>Find the bean that's actually right for you</h1>
                    <p className="home-subtitle">
                        BrewStack maps every roaster, rotating drops, and tasting notes across Singapore, so you can stop guessing and start discovering.
                    </p>

                    <div className="home-actions">
                        <Link className="home-primary" to="/find-my-coffee">Find my coffee</Link>
                        <Link className="home-secondary" to="/catalog">Browse catalog</Link>
                    </div>

                    <div className="home-stats">
                        <div>
                            <strong>10+</strong>
                            <span>Roasters Tracked</span>
                        </div>
                        <div>
                            <strong>200+</strong>
                            <span>Beans Catalogued</span>
                        </div>
                        <div>
                            <strong>Daily</strong>
                            <span>Drop Updates</span>
                        </div>
                    </div>
                </section>


                <section className="home-features">
                    <article>
                        <div className="feature-icon green">✓</div>
                        <h2>Take the bean quiz</h2>
                        <p>Answer a few quick questions on flavour, brew method, and cup profile, then get matched to your taste.</p>
                        <span>Core Feature</span>
                    </article>

                    <article>
                        <div className="feature-icon red">◇</div>\
                         <h2>Explore the map</h2>
                          <p>See every specialty roaster near you, including the small, lesser-marketed ones that are easy to miss.</p>
                          <span>Core Feature</span>
                    </article>

                    <article>
                        <div className="feature-icon brown">☕</div>
                        <h2>Browse fresh drops</h2>
                        <p>Rotating bean offerings from seasonal sourcing and limited releases, tracked and updated as they happen.</p>
                        <span>Core Feature</span>
                    </article>
                </section>


                <section className="fresh-drops-section">
                    <div className="section-heading-row">
                        <p className="home-eyebrow">This Week's Fresh Drops</p>
                        <Link to="/catalog">View full catalog →</Link>
                    </div>

                    <div className="home-drop-grid">
                        {freshDrops.map(bean => (
                            <article className="home-drop-card" key={bean.id}>
                                <div className="home-drop-image">
                                    {bean.imageUrl ? (
                                        <img src={bean.imageUrl} alt={bean.name} />
                                    ) : (
                                        <span>Coffee Image</span>
                                    )}
                                </div>
                                <h3>{bean.name}</h3>
                                <p>{bean.roaster?.name || 'N/A'} — {money(bean.price)}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
     
    );
}