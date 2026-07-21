import { useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar.js';
import { supabase } from '../lib/supabase.js';

export default function Signup() {
    const [email, setEmail] = useState(''); // store what the user types into email, password input
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    async function signUp() {
        const { error } = await supabase.auth.signUp({ email, password }); // Ask Supabase Auth to create a new account with the entered email and password.

        if (error) {
            setMessage(error.message);
            return;

        }

        setMessage('Account created. You can now log in.');
    }

    return (
        <div className="login-page">
            <NavBar />

            <main className="login-shell">
                <section className="login-card">
                    <h1>Create Account</h1>
                    <p>Create an account to save beans you want to try again or buy later.</p>

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
                        <button onClick={signUp}>Create Account</button>
                    </div>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Log in</Link>
                    </p>

                    {message && <p className="login-message">{message}</p>}

                </section>
            </main>
        </div>
    )
}