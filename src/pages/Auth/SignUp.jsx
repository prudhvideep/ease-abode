import { MdClose } from "react-icons/md";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

const SignUp = () => {
  const navigate = useNavigate();
  const [error, setError] = useState();
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [displayError, setDisplayError] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleUserNameChange = (event) => {
    setUserName(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSignInNavigation = () => {
    navigate("/");
  };

  const handleClose = () => {
    setDisplayError(false);
    setError("");
  };

  const handleSignUp = async () => {
    if (!userName) {
      setError("Username is Required.");
      setDisplayError(true);
      return;
    }

    if (!email) {
      setError("Email is Required.");
      setDisplayError(true);
      return;
    }

    if (!password) {
      setError("Password should not be empty.");
      setDisplayError(true);
      return;
    }

    try {
      const userDetail = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userDetail.user;

      console.log("User created successfully:", user);

      await set(ref(db, 'users/' + user.uid), {
        uid: user.uid,
        email: user.email,
        username: userName
      });

      navigate("/");
    } catch (error) {
      console.log("Error ---> ", error);
      const errorCode = error?.code;
      console.log("Error Code ---> ", errorCode);

      switch (errorCode) {
        case "auth/invalid-email":
          setError("Invalid Email.");
          setDisplayError(true);
          break;
        case "auth/invalid-credential":
          setError("Invalid Credentials.");
          setDisplayError(true);
          break;
        case "auth/email-already-in-use":
          setError("Email already in use.");
          setDisplayError(true);
          break;
        default:
          setError(errorCode);
          setDisplayError(true);
          break;
      }
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-11/12 md:w-8/12 lg:w-1/3 p-6 bg-white rounded-lg shadow-modern-lg hover:shadow-modern-xl">
        <div className="flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold">Create New Account</p>
          <div className="mt-4 w-8/10 lg:w-7/10">
            <p className="font-semibold flex justify-start">User Name</p>
            <input
              value={userName}
              onChange={handleUserNameChange}
              className="mt-2 px-2 w-full h-8 border border-gray-500 rounded-md"
            ></input>
          </div>
          <div className="mt-4 w-8/10 lg:w-7/10">
            <p className="font-semibold flex justify-start">Email Address</p>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="mt-2 px-2 w-full h-8 border border-gray-500 rounded-md"
            ></input>
          </div>
          <div className="mt-4 w-8/10 lg:w-7/10">
            <p className="font-semibold flex justify-start">Password</p>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="mt-2 px-2 w-full h-8 border border-gray-500 rounded-md"
            ></input>
          </div>
          {displayError && (
            <div className="mt-6 p-2 w-8/10 lg:w-7/10 bg-red-100 border border-red-300 rounded-lg relative">
              <div className="flex justify-between">
                <p className="px-2 text-sm text-red-700">{error}</p>
                <MdClose
                  onClick={handleClose}
                  className="text-red-500 hover:text-red-600 hover:scale-105 hover:cursor-pointer"
                />
              </div>
            </div>
          )}
          <div className="mt-6 w-8/10 lg:w-7/10">
            <button
              onClick={handleSignUp}
              className="border p-1 w-full rounded-lg bg-gray-500 text-white font-semibold hover:shadow-md"
            >
              Sign Up
            </button>
          </div>
          <div className="relative mt-4 w-8/10 lg:w-7/10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center ">
              <p className="bg-white px-2 text-gray-500">
                Already have an account?
              </p>
            </div>
          </div>
          <div className="mt-4 mb-2 w-8/10 lg:w-7/10">
            <button
              onClick={handleSignInNavigation}
              className="border p-1 w-full rounded-lg bg-gray-500 text-white font-semibold hover:shadow-md"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
