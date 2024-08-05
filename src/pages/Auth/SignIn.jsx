import React, { useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { MdClose } from "react-icons/md";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { auth } from "../../firebase/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [displayError, setDisplayError] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleClose = () => {
    setDisplayError(false);
    setError("");
  };

  const handleSignIn = async () => {
    if (!email || !password) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);

      navigate("/dashboard");
    } catch (error) {
      console.log("Error --> ", error);
      const errorCode = error?.code;
      switch (errorCode) {
        case "auth/invalid-credential":
          setError("The credentials does not exist.");
          setDisplayError(true);
          break;
        default:
          setError("Unexpected error.");
          setDisplayError(true);
          break;
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      // const userName = result.user.displayName;

      navigate("/dashboard");
    } catch (error) {
      const errorCode = error?.code;
      switch (errorCode) {
        case "auth/popup-closed-by-user":
          setError("Popup closed by the user.");
          setDisplayError(true);
          break;
        case "auth/cancelled-popup-request":
          setError("Popup Cancelled by the user.");
          setDisplayError(true);
          break;
        case "auth/user-not-found":
          setError("This email address is not registered.");
          setDisplayError(true);
          break;
        case "auth/wrong-password":
          setError(
            "The password is invalid or the user does not have a password."
          );
          setDisplayError(true);
          break;
        case "auth/invalid-credential":
          setError("The email or password combination is invalid.");
          setDisplayError(true);
          break;
        default:
          setError(errorCode);
          setDisplayError(true);
          break;
      }
    }
  };

  const handleGithubSignIn = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);

      navigate("/dashboard");
    } catch (error) {
      const errorCode = error?.code;
      switch (errorCode) {
        case "auth/account-exists-with-different-credential":
          setError("Account exists with different credential.");
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
    <div className="relative w-screen min-h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      <div className="w-11/12 md:w-8/12 lg:w-1/3 bg-white rounded-lg shadow-modern-lg hover:shadow-modern-xl p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="mt-8 w-10 h-10 bg-gray-700 rounded-lg border">
            <GoHomeFill className="ml-auto mr-auto mt-1 text-white text-3xl" />
          </div>
          <p className="mt-8 text-2xl font-semibold">Sign in to Ease Abode</p>
          <p className="mt-2 text-md flex-none text-gray-600">
            Welcome Abode! Please sign in{" "}
          </p>
          <div className="mt-6 w-8/10 lg:w-7/10">
            <p className="font-semibold">Email address</p>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="mt-2 px-1 w-full h-8 border border-gray-500 rounded-md"
            ></input>
          </div>
          <div className="mt-4 w-8/10 lg:w-7/10 relative">
            <p className="font-semibold">Password</p>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="mt-2 px-1 w-full h-8 border border-gray-500 rounded-md"
            ></input>
            <Link
              to="/passwordreset"
              className="flex place-content-end mt-1 mr-1 text-xs text-gray-800 font-semibold hover:font-bold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          {displayError && (
            <div className="mt-4 p-2 w-8/10 lg:w-7/10 bg-red-100 border border-red-300 rounded-lg relative">
              <div className="flex justify-between">
                <p className="px-2 text-sm text-red-700">{error}</p>
                <MdClose
                  onClick={handleClose}
                  className="text-red-500 hover:text-red-600 hover:scale-105 hover:cursor-pointer"
                />
              </div>
            </div>
          )}
          <div className="mt-4 w-8/10 lg:w-7/10 relative">
            <button
              onClick={handleSignIn}
              className="p-1 w-full border rounded-lg bg-gray-500 text-white text-medium"
            >
              Sign In
            </button>
          </div>
          <div className="relative mt-4 w-8/10 lg:w-7/10 ">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <p className="bg-white px-2 text-gray-500">Or</p>
            </div>
          </div>
          <div className="mt-4 w-8/10 lg:w-7/10 flex flex-row justify-evenly">
            <button
              onClick={handleGoogleSignIn}
              className="p-2 border border-gray-400 hover:border-gray-500 hover:scale-105 w-1/3 flex justify-center rounded-lg"
            >
              <FaGoogle />
            </button>
            <button
              onClick={handleGithubSignIn}
              className="p-2 border border-gray-400 hover:border-gray-500 hover:scale-105 w-1/3 flex justify-center rounded-lg"
            >
              <FaGithub />
            </button>
          </div>
          <div className="mt-4">
            <p className="font-normal text-gray-500">
              Don't have an account?{" "}
              <span>
                <Link
                  to="/signup"
                  className="font-medium hover:underline hover:text-gray-700"
                >
                  Sign Up
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
