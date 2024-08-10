import React, { useEffect, useState } from "react";
import { FiSidebar } from "react-icons/fi";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import {
  child,
  get,
  push,
  ref,
  set,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { FaPlus, FaChevronLeft } from "react-icons/fa6";
import { CiCircleInfo, CiPower } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

const Roomates = () => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState();
  const [minimize, setMinimize] = useState(false);
  const [addDetails, setAddDetails] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState();
  const [roomExists, setRoomExists] = useState(false);
  const [roomDetails, setRoomDetails] = useState({
    roomid: "",
    name: "",
    desciption: "",
    roomates: [],
  });
  const [userDetails, setUserDetails] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
      } else {
        // console.log("Authenticated user", user);
        setAuthUser(user);

        const snapShot = await get(child(ref(db), `mapping/${user.uid}`));
        if (snapShot.exists()) {
          // console.log("Room Exists : ", snapShot.val());
          setRoomExists(true);
          fetchRoomDetails(snapShot.val());
        }
      }
    });
  }, []);

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out.");
    }
  };

  const handleAddDetails = async () => {
    setAddDetails(true);
  };

  const handleAddTask = async () => {
    //Add current signed user to the room details
    const roomIdKey = push(ref(db, "rooms")).key;

    let capturedRoomDetails = roomDetails;

    capturedRoomDetails = {
      ...capturedRoomDetails,
      roomid: roomIdKey,
      roomates: [...capturedRoomDetails.roomates, authUser.uid],
    };

    setRoomDetails(capturedRoomDetails);

    await set(ref(db, "rooms/" + roomIdKey), capturedRoomDetails);

    await set(ref(db, "mapping/" + authUser.uid), roomIdKey);

    setAddDetails(false);
  };

  const handleCancelAddTask = () => {
    setAddDetails(false);
  };

  const handleSideBarMinimize = () => {
    setMinimize(!minimize);
  };

  const handleAddUser = () => {
    setAddUser(true);
  };

  const handleNewUser = async () => {
    const usersRef = ref(db, "users");
    const emailQuery = query(
      usersRef,
      orderByChild("email"),
      equalTo(newUserEmail)
    );

    const snapshot = await get(emailQuery);
    if (snapshot.exists()) {
      // console.log("Snapshot ----> ", snapshot.val());
      const userData = snapshot.val();
      const userId = Object.keys(userData)[0];
      const user = userData[userId];

      let updatedRoomDetails = {
        ...roomDetails,
        roomates: [...roomDetails.roomates, userId],
      };

      setRoomDetails(updatedRoomDetails);

      await set(
        ref(db, "rooms/" + updatedRoomDetails.roomid),
        updatedRoomDetails
      );

      await set(ref(db, "mapping/" + userId), updatedRoomDetails.roomid);

      setUserDetails((prev) => [...prev, user]);

      setNewUserEmail("");
    } else {
      alert("Email does not Exist.");
    }
  };

  const fetchRoomDetails = async (roomid) => {
    const roomSnap = await get(child(ref(db), `/rooms/${roomid}`));

    if (roomSnap.exists()) {
      // console.log("Room Details ", roomSnap.val());
      setRoomDetails(roomSnap.val());
      setUserDetails([]);
      fetchUserDetails(roomSnap.val()?.roomates);
    }
  };

  const fetchUserDetails = (users) => {
    users.forEach(async (userId, index) => {
      let userSnap = await get(child(ref(db), `/users/${userId}`));
      if (userSnap.exists()) {
        setUserDetails((prev) => {
          if (!prev.some((user) => user.uid === userSnap.val().uid)) {
            return [...prev, userSnap.val()];
          }
          return prev;
        });
      }
    });
  };

  return (
    <div className="min-h-screen h-screen w-screen">
      <div className="flex flex-row h-full">
        <div
          className={`transition-all dealay-200 ease-in-out hidden md:block flex-none ${
            minimize
              ? "transition-all delay-100 ease-in-out w-20 bg-white"
              : "transition-all delay-100 ease-in-out w-80 bg-customgray"
          } h-full overflow-clip`}
        >
          <div className="p-4 w-full h-full flex flex-col justify-between">
            <div className="p-2 flex flex-row justify-end">
              <div
                onClick={handleSideBarMinimize}
                className="p-2 rounded-md hover:bg-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-90 "
              >
                <FiSidebar className="text-xl font-bold hover:text-gray-900" />
              </div>
            </div>
            <div className={`flex flex-col ${minimize ? "hidden" : " "}`}>
              <div className="p-2 flex flex-row items-center justify-start space-x-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700">
                <CiCircleInfo className="text-xl" />
                <p className="text-sm">Help & Information</p>
              </div>
              <div
                onClick={handleLogOut}
                className="p-2 flex flex-row items-center justify-start space-x-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700"
              >
                <CiPower className="text-xl" />
                <p className="text-sm">Log Out</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-full bg-white overflow-auto">
          <div className="p-auto flex flex-row items-center space-x-4 w-7/10 h-10 mt-14 ml-auto mr-auto">
            <div
              onClick={() => navigate("/")}
              className={`p-2 rounded-md hover:bg-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-90 `}
            >
              <FaChevronLeft className="text-xl font-bold hover:text-gray-900" />
            </div>
            <p className="text-2xl font-semibold">Abode Details</p>
          </div>
          <div className="p-auto w-7/10 mt-6 ml-auto mr-auto">
            {roomExists && (
              <div className="p-4 w-full h-32 max-h-60 rounded-lg border border-gray-300">
                <textarea
                  value={roomDetails?.name}
                  readOnly={true}
                  onChange={(event) => {
                    setRoomDetails((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }));
                  }}
                  placeholder="Name"
                  className="w-full h-10 max-h-64 resize-none font-semibold text-lg outline-none placeholder-gray-500 placeholder-opacity-75 placeholder-inset-0"
                />
                <textarea
                  value={roomDetails?.desciption}
                  readOnly={true}
                  onChange={(event) => {
                    setRoomDetails((prev) => ({
                      ...prev,
                      desciption: event.target.value,
                    }));
                  }}
                  placeholder="Description"
                  className="w-full h-12 max-h-64 resize-none font-normal text-md text-gray-500 outline-none placeholder-gray-500 placeholder-opacity-60 placeholder-inset-0"
                />
              </div>
            )}
            {!roomExists && addDetails && (
              <div className="p-4 w-full h-42 max-h-60 rounded-lg border border-gray-300">
                <textarea
                  value={roomDetails?.name}
                  onChange={(event) => {
                    setRoomDetails((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }));
                  }}
                  placeholder="Name"
                  className="w-full h-10 max-h-64 resize-none font-semibold text-lg outline-none placeholder-gray-500 placeholder-opacity-75 placeholder-inset-0"
                />
                <textarea
                  value={roomDetails?.desciption}
                  onChange={(event) => {
                    setRoomDetails((prev) => ({
                      ...prev,
                      desciption: event.target.value,
                    }));
                  }}
                  placeholder="Description"
                  className="w-full h-15 max-h-64 resize-none font-normal text-md text-gray-500 outline-none placeholder-gray-500 placeholder-opacity-60 placeholder-inset-0"
                />
                <div className="w-full border border-gray-300"></div>
                <div className="mt-2 flex flex-row space-x-2 justify-end">
                  <button
                    onClick={handleCancelAddTask}
                    className="flex items-center justify-center p-2 h-8 text-semibold text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-all delay-100 ease-in-out hover:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="flex items-center justify-center p-2 h-8 text-semibold text-sm text-white bg-red-400 hover:bg-red-500 rounded-lg transition-all delay-100 ease-in-out hover:scale-95"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            )}
            {!roomExists && !addDetails && (
              <div
                onClick={handleAddDetails}
                className="p-2 flex flex-row items-center space-x-2 group hover:cursor-pointer"
              >
                <div className="flex items-center justify-center w-4 h-4 rounded-full font-thin text-red-600 group-hover:bg-red-600 group-hover:text-white">
                  <FaPlus />
                </div>
                <p className="text-md text-gray-400 group-hover:text-red-400">
                  Add Details
                </p>
              </div>
            )}
          </div>
          {/* Users */}
          {roomExists && (
            <div className="p-auto w-7/10 h-10 mt-8 ml-auto mr-auto">
              <p className="text-xl font-semibold">Users</p>
            </div>
          )}
          <div className="p-auto w-7/10 mt-2 ml-auto mr-auto">
            {userDetails.length > 0 &&
              userDetails.map((userDetail) => (
                <div
                  key={userDetail.uid}
                  className="p-4 mt-2 w-full h-42 max-h-60 rounded-lg border border-gray-300"
                >
                  <input
                    value={userDetail?.username}
                    readOnly={true}
                    placeholder="User Name"
                    className="w-full h-10 max-h-64 resize-none font-semibold text-lg outline-none placeholder-gray-500 placeholder-opacity-75 placeholder-inset-0"
                  />
                  <input
                    value={userDetail?.email}
                    readOnly={true}
                    placeholder="Email"
                    className="w-full h-15 max-h-64 resize-none font-normal text-md text-gray-500 outline-none placeholder-gray-500 placeholder-opacity-60 placeholder-inset-0"
                  />
                </div>
              ))}
            {addUser && (
              <div className="p-4 mt-2 w-full h-42 max-h-60 rounded-lg border border-gray-300">
                <textarea
                  value={newUserEmail}
                  onChange={(event) => setNewUserEmail(event.target.value)}
                  placeholder="Email"
                  className="w-full h-10 max-h-64 resize-none font-semibold text-lg outline-none placeholder-gray-500 placeholder-opacity-75 placeholder-inset-0"
                />
                <div className="w-full border border-gray-300"></div>
                <div className=" mt-3 flex flex-row space-x-2 justify-end">
                  <button
                    onClick={() => setAddUser(false)}
                    className="flex items-center justify-center p-2 h-8 text-semibold text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-all delay-100 ease-in-out hover:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNewUser}
                    className="flex items-center justify-center p-2 h-8 text-semibold text-sm text-white bg-red-400 hover:bg-red-500 rounded-lg transition-all delay-100 ease-in-out hover:scale-95"
                  >
                    Add User
                  </button>
                </div>
              </div>
            )}
            {!addUser && roomExists && (
              <div
                onClick={handleAddUser}
                className="p-2 flex flex-row items-center space-x-2 group hover:cursor-pointer"
              >
                <div className="flex items-center justify-center w-4 h-4 rounded-full font-thin text-red-600 group-hover:bg-red-600 group-hover:text-white">
                  <FaPlus />
                </div>
                <p className="text-md text-gray-400 group-hover:text-red-400">
                  Add User
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roomates;
