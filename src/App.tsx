import "./App.css";
import { TaskManager } from "./pages/TaskManager";
import SignIn from "./auth/SignIn";


function App() {
  return (
    <>
      <SignIn />
      <TaskManager />
    </>
  );
}

export default App;
