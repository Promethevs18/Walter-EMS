import React, { useState } from "react";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Auth = ({ setUser }) => {
  const [state, setState] = useState(initialState);
  const { email, password } = state;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (email && password) {
      const { user } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      ).catch((error) => {
        toast.error(error.message);
        setUser(user);
      });
    } else {
      return toast.error("All fields are mandatory to fill");
    }
    toast.success("You have successfully logged in");
    navigate("/");
  };

  return (
    <div className="login">
      <div className="container-fluid mb-4">
        <div className="container">
          <div className="col-12 text-center">
            <div className="text-center heading py-2">Log in</div>
          </div>
          <div className="row h-100 justify-content-center align-items-center">
            <div className="col-10 col-md8 col-lg-6">
              <form className="row" onSubmit={handleAuth}>
                <div className="col-12 py-3">
                  <input
                    type="email"
                    className="form-control input-text-box"
                    placeholder="your email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12 py-3">
                  <input
                    type="password"
                    className="form-control input-text-box"
                    placeholder="Your Password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12 py-3 text-center">
                  <button className={"btn btn-sign-up"} type="submit">
                    Log In
                  </button>
                </div>
              </form>
              <p>Log in using the credentials the developers gave you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
