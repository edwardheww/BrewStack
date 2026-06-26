import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar.js';
import { supabase } from '../lib/supabase.js';

export default function Login() { // // Login page for both existing users and new users.
    const navigate = useNavigate();
    const [email, setEmail] = useState(''); // store what the user types into email, password input
    const [password, setPassword] = useState(''); 
    const [message, setMessage] = useState('');

    async function signUp() { // creates new acc
        const {error} = await supabase.auth.signUp({ email, password });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage('Account created. Check your email if confirmation is enabled.');
    }
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
                            <button className="secondary-action" onClick={signUp}>Create Account</button>
                        </div>

                        {message && <p className="login-message">{message}</p>}
                    </section>
                </main>
            </div>
        );
    
}