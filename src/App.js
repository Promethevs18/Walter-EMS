import React, { useState, useEffect } from "react";
import "./App.css";
import "./styles.scss";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Employees from "./pages/Employees";
import AddEmployees from "./pages/AddEditEmployee";
import Authentication from "./pages/Auth.js";
import Leave from "./pages/Leave";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import AttendanceList from "./pages/AttendanceList";
import Agency from "./pages/Agency";

function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("Home");

  //eto ang magchecheck if may user na nakalogin
  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });
  }, []);

  //Sya bahala sa logout part
  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
      setActive("Login");
      toast.info("You have successfully logged out");
    });
  };

  return (
    <div className="App">
      <Router>
        <Navbar
          setActive={setActive}
          active={active}
          user={user}
          handleLogout={handleLogout}
        />
        <ToastContainer position="top-center" />
        <Routes setUser={user}>
          <Route
            path="/"
            exact
            element={<Home setActive={setActive} user={user} />}
          />
          <Route
            path="/employees"
            element={<Employees setActive={setActive} user={user} />}
          />
          <Route
            path="/agencies"
            element={<Agency setActive={setActive} user={user} />}
          />
          <Route
            path="/addemployee"
            element={<AddEmployees setActive={setActive} user={user} />}
          />
          <Route
            path="/auth"
            element={<Authentication setActive={setActive} setUser={user} />}
          />
          <Route
            path="/employees/update/:query/:id"
            element={<AddEmployees setActive={setActive} setUser={user} />}
          />
          <Route
            path="/leave"
            exact
            element={<Leave setActive={setActive} user={user} />}
          />
          <Route
            path="/list"
            exact
            element={<AttendanceList setActive={setActive} user={user} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
