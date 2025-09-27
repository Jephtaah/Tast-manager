import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase-client";
import "./TaskManager.css";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
}


export  function TaskManager() {
const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

    if (editingId) {
      const { error } = await supabase
        .from("tasks")
        .update(newTask)
        .eq("id", editingId);

      if (error) {
        console.error(error);
        return;
      }
    } else {
      const { error } = await supabase.from("tasks").insert(newTask).single();

      if (error) {
        console.error(error);
        return;
      }
    }

    setNewTask({ title: "", description: "" });
    setEditingId(null);
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    fetchTasks();
  };

  const editTask = (task: Task) => {
    setNewTask({ title: task.title, description: task.description });
    setEditingId(task.id);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };



  return (
    <div className="container" ref={formRef}>
      <header className="header">
        <h1>Task Manager</h1>
        <p className="subtitle">Organize your work and stay productive</p>
      </header>

      <form className="task-form" onSubmit={handleAddTask}>
        <h2>{editingId ? "Edit Task" : "Create New Task"}</h2>
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Describe your task..."
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="textarea"
          />
        </div>
        <button className="btn btn-primary" type="submit">
          {editingId ? "Edit Task" : "Add Task"}
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
                <button className="btn-action btn-edit" onClick={() => editTask(task)}>✎</button>
                <button className="btn-action btn-delete" onClick={() => deleteTask(task.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}