import "./App.css";
import { TaskManager } from "./pages/TaskManager";
import { Auth } from "./auth/Auth";
import { useState, useEffect } from "react";
import { supabase } from "./supabase-client";
import type { Session } from "@supabase/supabase-js";


function App() {
  const [session, setSession] = useState<Session | null>(null)

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    setSession(currentSession.data.session);
  }

useEffect(() => {
  fetchSession();

  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => {
    authListener.subscription.unsubscribe();
  }
}, [])
  
  return (
    <div className="app">
      {session ? <TaskManager /> : <Auth />}
    </div>
  );
}

export default App;
