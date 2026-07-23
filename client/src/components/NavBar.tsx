import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

export default function NavBar() {
    const [email, setEmail] = useState<string | null>(null); // Stores the logged-in user's email.

    useEffect(() => { // checks if supabase already has an active session
        supabase.auth.getSession().then(({ data }) => {
            setEmail(data.session?.user.email ?? null);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { 
            setEmail(session?.user.email ?? null);
        });
        
        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);
    
    async function logOut() {
        await supabase.auth.signOut();
        setEmail(null);
    }

    return (
        <header className="site-nav">
            <Link className="brand home-brand" to="/">BrewStack</Link>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/catalog">Catalog</Link>
                <Link to="/roasters">Roasters</Link>
                <Link to="/find-my-coffee">Find My Coffee</Link>
                <Link to="/saved-beans">Saved Beans</Link>
            </nav>
            {email ? (
                <button className="nav-auth-button" onClick={logOut}>Logout</button>
            ) : (
                <Link className="nav-auth-link" to="/login">Login</Link>
            )}
            
        </header>
    );
}