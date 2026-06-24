import { Link } from 'react-router-dom';

export default function NavBar() {
    return (
        <header className="site-nav">
            <Link className="brand home-brand" to="/">BrewStack</Link>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/catalog">Catalog</Link>
                <Link to="/roasters">Roasters</Link>
                <Link to="/find-my-coffee">Find My Coffee</Link>
                <a> Saved Beans</a>
            </nav>
            <button className="search-button" aria-label="Search">⌕</button>
        </header>
    );
}