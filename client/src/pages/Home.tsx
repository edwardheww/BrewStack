import { Link } from 'react-router-dom';

//landing page for brewstack

export default function Home() {
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
            </main>
        </div>
     
    );
}