import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";
import "./App.css";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

function App() {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const { error, data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error fetching tasks");
      return;
    }

    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  console.log(tasks);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("tasks").insert(newTask).single();

    if (error) {
      console.error(error);
    }

    setNewTask({ title: "", description: "" });
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    fetchTasks();
  };

  const 

  return (
    <div className="container">
      <header className="header">
        <h1>Task Manager</h1>
        <p className="subtitle">Organize your work and stay productive</p>
      </header>

      <form className="task-form" onSubmit={handleAddTask}>
        <h2>Create New Task</h2>
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter task title..."
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Describe your task..."
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="textarea"
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Add Task
        </button>
      </form>

      <div className="tasks-section">
        <div className="section-header">
          <h2>Your Tasks</h2>
          <span className="task-count">{tasks.length} tasks</span>
        </div>

        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <div className="status-indicator pending"></div>
                <span className="task-date">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
              </div>

              <div className="task-actions">
                <button className="btn-action btn-complete">✓</button>
                <button className="btn-action btn-edit">✎</button>
                <button className="btn-action btn-delete" onClick={() => deleteTask(task.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
