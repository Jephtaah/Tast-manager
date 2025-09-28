import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { supabase } from "../supabase-client";
import type { Session } from "@supabase/supabase-js";
import "./TaskManager.css";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  email: string;
  image_url: string;
}

export function TaskManager() {
  const [newTask, setNewTask] = useState({ title: "", description: "", email: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [taskImage, setTaskImage] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  }

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

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();
  }, []);

  

  const uploadImage = async (image: File): Promise<string | null> => {
    const filePath = `${image.name}-${Date.now()}`;
    const { error } = await supabase.storage.from("task-images").upload(filePath, image);

    if (error) {
      console.log("Error uploading image");
      return null;
    }

    const { data } = supabase.storage.from("task-images").getPublicUrl(filePath);

    return data.publicUrl;
  }




  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl: string | null = null;
    if (taskImage) {
      imageUrl = await uploadImage(taskImage);
    }

    if (!session?.user) {
      console.error("User not authenticated");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("tasks")
        .update({ title: newTask.title, description: newTask.description, image_url: imageUrl })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        return;
      }
    } else {
      const { error } = await supabase.from("tasks").insert({
        ...newTask,
        email: session.user.email!,
        image_url: imageUrl
      }).single();

      if (error) {
        console.error(error);
        return;
      }
    }

    setNewTask({ title: "", description: "", email: "" });
    setEditingId(null);
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error(error);
      return;
    }
  };

  const editTask = (task: Task) => {
    setNewTask({ title: task.title, description: task.description, email: task.email });
    setEditingId(task.id);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const logOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      window.location.href = '/';
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
  };

  
  useEffect(() => {
    const channel = supabase
      .channel('tasks-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [])

  return (
    <div className="container" ref={formRef}>
      <header className="header">
        <h1>Task Manager</h1>
        <p className="subtitle">Organize your work and stay productive</p>
      </header>

      <div className="task-manager">
        <form className="task-form" onSubmit={handleAddTask}>
          <h2>{editingId ? "Edit Task" : "Create New Task"}</h2>
          <div className="form-group">
            <label htmlFor="title">Task Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter task title..."
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
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
          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              placeholder="Upload an image..."
              className="image-input"
              onChange={handleFileChange}
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
                  <button
                    className="btn-action btn-edit"
                    onClick={() => editTask(task)}
                  >
                    ✎
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={logOut}>
          Logout
        </button>
      </div>
    </div>
  );
}
