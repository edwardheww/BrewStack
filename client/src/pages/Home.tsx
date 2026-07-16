import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { type Bean } from '../types/index.js';
import NavBar from '../components/NavBar.js';

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
            <NavBar />

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
                        <div className="feature-icon green">🗹</div>
                        <h2><a href="/find-my-coffee">Take the bean quiz</a></h2>
                        <p>Answer a few quick questions on flavour, brew method, and cup profile, then get matched to your taste.</p>
                    </article>

                    <article>
                        <div className="feature-icon red">🗺️</div>
                        <h2><a href="/roasters">Explore the map</a></h2>
                        <p>See every specialty roaster near you, including the small, lesser-marketed ones that are easy to miss.</p>
                    </article>

                    <article>
                        <div className="feature-icon brown">☕</div>
                        <h2><a href="/catalog">Browse fresh drops</a></h2>
                        <p>Rotating bean offerings from seasonal sourcing and limited releases, tracked and updated as they happen.</p>
                    </article>
                </section>


                <section className="fresh-drops-section">
                    <div className="section-heading-row">
                        <p className="home-eyebrow">This Week's Fresh Drops</p>
                        <Link to="/catalog">View full catalog →</Link>
                    </div>

                    <div className="home-drop-grid">
                        {freshDrops.map(bean => (  //clicking on the freshdrops goes to the bean's actual website
                            <a
                                className="home-drop-card"
                                key={bean.id}
                                href={bean.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <div className="home-drop-image">
                                    {bean.imageUrl ? (
                                        <img src={bean.imageUrl} alt={bean.name} />
                                    ) : (
                                        <span>Coffee Image</span>
                                    )}
                                </div>
                                <h3>{bean.name}</h3>
                                <p>{bean.roaster?.name || 'N/A'} — {money(bean.price)}</p>
                            </a>
                        ))}
                    </div>
                </section>


                <section className="home-how">
                    <p className="home-eyebrow">How BrewStack Works</p>

                    <div className="how-grid">
                        <article>
                            <span>1</span>
                            <h2>Take the bean quiz</h2>
                            <p>New here, or just not sure what you like? Take the quiz or filter the catalog by roast, origin, and process.</p>
                        </article>

                        <article>
                            <span>2</span>
                            <h2>Discover beans and roasters</h2>
                            <p>See curated picks, browse fresh drops, and find specialty roasters near you.</p>
                        </article>

                        <article>
                            <span>3</span>
                            <h2>Save and shop</h2>
                            <p>Bookmark beans to your list, then head straight to the roaster to buy.</p>
                        </article>
                    </div>
                </section>


                <section className="home-cta">
                    <h2>Stop guessing. Start discovering.</h2>
                    <p>One place for Singapore's specialty coffee — beans, roasters, and everything in between.</p>
                    <Link className="home-primary" to="/find-my-coffee">Find my coffee</Link>
                </section>


                <section className="why-section">
                    <p className="home-eyebrow">Why We Built This</p>
                    <h2>A coffee scene this good shouldn't be this hard to follow</h2>

                    <div className="why-grid">
                        <article>
                            <div className="why-icon red">⌕</div>
                            <h3>Scattered, not searchable</h3>
                            <p>As baristas and coffee drinkers ourselves, we kept hitting the same wall: roaster info, bean offerings, and café details live across dozens of separate Instagram pages and websites, with no single place to compare them.</p>
                        </article>

                        <article>
                            <div className="why-icon brown">↻</div>
                            <h3>Outdated the moment it's posted</h3>
                            <p>Specialty beans rotate constantly with seasonal sourcing and limited drops. A list that's accurate today is stale by next week, leaving drinkers unsure what's actually available right now.</p>
                        </article>

                        <article>
                            <div className="why-icon green">👥</div>
                            <h3>Same names, every time</h3>
                            <p>Without strong marketing budgets, smaller and newer roasters get buried under well-known brands — even when the coffee itself is just as good, or better.</p>
                        </article>
                    </div>

                    <p className="why-close">
                        We built BrewStack to fix this: <strong>one continuously updated, centralised source of truth</strong> for Singapore's specialty coffee scene — helping newcomers learn what they actually like, and giving every local roaster, big or small, an equal shot at being discovered.
                    </p>
                </section>
            </main>
        </div>

    );
}