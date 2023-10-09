import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import { Link } from "react-router-dom";
import * as MdIcons from "react-icons/md";
import "./Navbar.css";
import { IconContext } from "react-icons";

const Navbar = ({ user, handleLogout }) => {
  const [sidebar, setSidebar] = useState(false);
  const showSidebar = () => setSidebar(!sidebar);

  const [active, setActive] = useState("Home");

  const handleActive = (choice) => {
    setActive(choice);
  };

  const userId = user?.uid;

  const handleRoute = () => {
    window.location.href = "https://employee-management-syst-efd3d.web.app/";
  };
  return (
    <>
      <IconContext.Provider value={{ color: "#0000cd" }}>
        <div className="navbar">
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={showSidebar} />
            <img
              onClick={() => handleRoute()}
              className="walterLogo"
              alt={"Walter Mart"}
              src="https://firebasestorage.googleapis.com/v0/b/employee-management-syst-efd3d.appspot.com/o/walter.png?alt=media&token=d9434953-0f67-4c7b-a568-4eb68096ea9a"
            />
          </Link>
        </div>
        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            <li
              className={`nav-text ${active === "Home" ? "active" : ""}`}
              onClick={() => handleActive("Home")}
            >
              <Link to={"/"}>
                {<AiIcons.AiFillHome />}
                <span>{"Home"}</span>
              </Link>
            </li>
            {user?.uid != null && (
              <li
                className={`nav-text ${active === "Employees" ? "active" : ""}`}
                onClick={() => handleActive("Employees")}
              >
                <Link to={"/employees"}>
                  {<IoIcons.IoIosPaper />}
                  <span>{"Employees"}</span>
                </Link>
              </li>
            )}
            {user?.uid != null && (
              <li
                className={`nav-text ${active === "Agencies" ? "active" : ""}`}
                onClick={() => handleActive("Agencies")}
              >
                <Link to={"/agencies"}>
                  {<IoIcons.IoIosPaper />}
                  <span>{"Agencies"}</span>
                </Link>
              </li>
            )}
            <li
              className={`nav-text ${
                active === "Attendance List" ? "active" : ""
              }`}
              onClick={() => handleActive("Attendance List")}
            >
              <Link to={"/list"}>
                {<IoIcons.IoIosPaper />}
                <span>{"Attendance List"}</span>
              </Link>
            </li>
            {"Nf2Nwq2svgdWOYOzBBLtkEMqvPH3" === user?.uid && (
              <li
                className={`nav-text ${
                  active === "Add Employee" ? "active" : ""
                }`}
                onClick={() => handleActive("Add Employee")}
              >
                <Link to={"/addemployee"}>
                  {<IoIcons.IoMdPersonAdd />}
                  <span>{"Add Employee"}</span>
                </Link>
              </li>
            )}
            {"Nf2Nwq2svgdWOYOzBBLtkEMqvPH3" === user?.uid && (
              <li
                className={`nav-text ${active === "Set Leave" ? "active" : ""}`}
                onClick={() => handleActive("Set Leave")}
              >
                <Link to={"/leave"}>
                  {<IoIcons.IoMdPersonAdd />}
                  <span>{"Set Leave"}</span>
                </Link>
              </li>
            )}
            {userId ? (
              <li
                className={`nav-text ${active === "Logout" ? "active" : ""}`}
                onClick={handleLogout}
              >
                <Link to={"/auth"}>
                  {<IoIcons.IoMdLogIn />}
                  <span>Logout</span>
                </Link>
              </li>
            ) : (
              <li className={`nav-text ${active === "Login" ? "active" : ""}`}>
                <Link to={"/auth"}>
                  {<IoIcons.IoMdLogOut />}
                  <span>Login</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
};

export default Navbar;
