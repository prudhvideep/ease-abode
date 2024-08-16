import Dashboard from "./components/Dashboard";
import Roomates from "./pages/Roomates";
import PasswordReset from "./pages/Auth/PasswordReset";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/roomates" element={<Roomates />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/passwordreset" element={<PasswordReset />} />
      </Routes>
    </Router>
  );
}

export default App;
