import Dashboard from "./components/Dashboard";
import PasswordReset from "./pages/Auth/PasswordReset";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Routes } from "react-router-dom";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/passwordreset" element={<PasswordReset />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
