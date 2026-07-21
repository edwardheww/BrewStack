import { useState } from 'react';
import NavBar from '../components/NavBar.js';
import { supabase } from '../lib/supabase.js';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() { // // Login page for both existing users 
    const navigate = useNavigate();
    const [email, setEmail] = useState(''); // store what the user types into email, password input
    const [password, setPassword] = useState(''); 
    const [message, setMessage] = useState('');

        async function logIn() { //login to existing acc
            const {error} = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                setMessage(error.message);
                return;
            }
             navigate('/catalog');
        }

        return (
            <div className="login-page">
                <NavBar />

                <main className = "login-shell">
                    <section className="login-card">
                        <h1>Log In</h1>
                        <p>Save beans, follow roasters, and keep track of coffees you want to try.</p>

                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email"
                            type="email"
                        />

                        <input 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            type="password"
                        />

                        <div className="login-actions">
                            <button onClick={logIn}>Log In</button>
                            
                        </div>

                        <p className="auth-switch">
                            New to BrewStack? <Link to="/signup">Create an account</Link>
                        </p>

                        {message && <p className="login-message">{message}</p>}
                    </section>
                </main>
            </div>
        );
    
}