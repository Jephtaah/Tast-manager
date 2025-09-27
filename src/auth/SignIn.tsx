import React, { useState, FormEvent } from 'react';
import './SignIn.css';
import { supabase } from '../supabase-client';


const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSignUp) {
      await supabase.auth.signUp({ email, password });
    } else {
      await supabase.auth.signInWithPassword({ email, password });
    }
  }

  return (
    <form className="container" onSubmit={handleSubmit}>
      <div className="header">
        <h1>{isSignUp ? "Sign Up" : "Sign In"}</h1>
        <p className="subtitle">{isSignUp ? "Welcome! Please sign up to your account." : "Welcome back! Please sign in to your account."}</p>
      </div>

      <div className="signin-form">
        <h2>Enter your credentials</h2>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn">
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>

        <div className="toggle-mode">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="btn-link"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </form>
  );
};

export default SignIn;