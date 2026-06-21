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
                </section>
            </main>
        </div>
     
    );
}