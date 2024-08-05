import React, { useState } from "react";
import { auth } from "../../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const PasswordReset = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ message: "", type: "" });
  const [displayMessage, setDisplayMessage] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleClose = () => {
    setDisplayMessage(false);
    setMessage({ message: "", type: "" });
  };

  const handleSignInNavigation = () => {
    navigate("/");
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setMessage({ message: "Email is Required.", type: "Error" });
      setDisplayMessage(true);
      return;
    }

    try {
      const response = sendPasswordResetEmail(auth,email);

      setMessage({ message: "Email sent.", type: "Message" });
      setDisplayMessage(true);

      console.log("Response ---> ",response);
    } catch (error) {
      const errorCode = error?.code;

      switch(errorCode){
        default:
          setMessage({ message: "Error sending link.", type: "Error" });
          setDisplayMessage(true);
          break;
      }
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="p-6 w-11/12 md:w-8/12 lg:w-1/3 bg-white rounded-lg shadow-modern-lg hover:shadow-modern-xl">
        <div className="flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold">Create New Account</p>
          <div className="mt-4 w-8/10 lg:w-7/10">
            <p className="font-semibold">Email Address</p>
            <input
              type="text"
              value={email}
              onChange={handleEmailChange}
              className="mt-2 px-2 w-full h-8 border border-gray-500 rounded-md"
            />
          </div>
          <div className="mt-4 w-8/10 lg:w-7/10">
            <button
              onClick={handlePasswordReset}
              className="w-full border p-1 rounded-lg text-white bg-gray-500 hover:shadow-lg"
            >
              Password Reset
            </button>
          </div>
          {displayMessage && (
            <div className={`mt-4 p-2 w-8/10 lg:w-7/10 ${message.type === "Error" ? " bg-red-100 border border-red-300" : " bg-green-100 border border-green-300" } rounded-lg relative`}>
              <div className="flex justify-between">
                <p className={`px-2 text-sm ${message.type === "Error" ? "text-red-700" : "text-green-700"} `}>{message.message}</p>
                <MdClose
                  onClick={handleClose}
                  className={`${message.type === "Error" ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"} hover:scale-105 hover:cursor-pointer`}
                />
              </div>
            </div>
          )}
          <div className="relative mt-4 w-8/10 lg:w-7/10">
            <div className="absolute inset-0 flex items-center">
              <div className=" w-full border-t border-gray-400 "></div>
            </div>
            <div className="relative flex justify-center">
              <p className="bg-white px-2 text-gray-500">
                Remember your password?
              </p>
            </div>
          </div>
          <div className="mt-4 mb-4 w-8/10 lg:w-7/10">
            <button
              onClick={handleSignInNavigation}
              className="w-full border p-1 rounded-lg text-white bg-gray-500 hover:shadow-lg">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
