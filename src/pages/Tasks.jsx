import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import {
  ref,
  get,
  child,
  push,
  set,
  query,
  orderByChild,
  equalTo,
  remove,
} from "firebase/database";
import DatePicker from "react-datepicker";
import PriorityPicker from "../components/PriorityPicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiSidebar, FiBell } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";
import { FaPlus, FaChevronLeft, FaFlag, FaCheck } from "react-icons/fa6";
import {
  CiCircleInfo,
  CiPower,
  CiCalendarDate,
  CiCalendar,
  CiInboxIn,
  CiFlag1,
  CiUser,
} from "react-icons/ci";
import UsersPicker from "../components/UsersPicker";

const Tasks = () => {
  const navigate = useNavigate();
  const datePickerRef = useRef(null);
  const userPickerRef = useRef(null);
  const priorityPickerRef = useRef(null);

  const [authUser, setAuthUser] = useState();
  const [minimize, setMinimize] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const [showUsers, setShowUsers] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [roomId, setRoomId] = useState(null);
  const [newTask, setNewTask] = useState({
    taskname: "",
    taskdescription: "",
  });
  const [priority, setPriority] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [addTask, setAddTask] = useState(false);
  const [userDetails, setUserDetails] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [taskDetails, setTaskDetails] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
      } else {
        setAuthUser(user);

        const snapShot = await get(child(ref(db), `mapping/${user.uid}`));
        if (snapShot.exists()) {
          setRoomId(snapShot.val());
          fetchTasks(snapShot.val());
          fetchUserDetails(snapShot.val());
        }
      }
    });
  }, []);

  useEffect(() => {
    if (showDatePicker) {
      document.addEventListener("mousedown", handleDateClickOutside);
    } else {
      document.removeEventListener("mousedown", handleDateClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleDateClickOutside);
    };
  }, [showDatePicker]);

  useEffect(() => {
    if (showPriority) {
      document.addEventListener("mousedown", handlePriorityClickOutside);
    } else {
      document.removeEventListener("mousedown", handlePriorityClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handlePriorityClickOutside);
    };
  }, [showPriority]);

  useEffect(() => {
    if (showUsers) {
      document.addEventListener("mousedown", handleUserPickerClick);
    } else {
      document.removeEventListener("mousedown", handleUserPickerClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleUserPickerClick);
    };
  }, [showUsers]);

  const handleAddNewTask = async () => {
    if (roomId) {
      let newTaskId = push(ref(db, "tasks")).key;
      let taskDetails = {
        taskid: newTaskId,
        roomid: roomId,
        taskname: newTask.taskname,
        description: newTask.taskdescription,
        duedate: selectedDate ? selectedDate.toString() : new Date().toString(),
        priority: priority ? priority : "P4",
        status: "pending",
        usernames: selectedUsers,
      };
      setTaskDetails((prev) => [...prev, taskDetails]);
      setNewTask({
        taskname: "",
        taskdescription: "",
      });
      setPriority(null);
      setSelectedDate(null);
      setSelectedUsers([]);
      setAddTask(false);
      await set(ref(db, "tasks/" + newTaskId), taskDetails);
    } else {
      alert("Room does not Exist!!!");
    }
  };

  const fetchTasks = async (roomid) => {
    try {
      const tasksRef = ref(db, "tasks");
      const roomQuery = query(
        tasksRef,
        orderByChild("roomid"),
        equalTo(roomid)
      );

      const snapshot = await get(roomQuery);

      if (snapshot.exists()) {
        const tasks = Object.values(snapshot.val()).sort((a, b) => {
          return new Date(a.duedate) - new Date(b.duedate);
        });

        setTaskDetails(tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks. ", error);
    }
  };

  const fetchUserDetails = async (roomId) => {
    let fetchedDetails = [];
    const snapshot = await get(child(ref(db), `rooms/${roomId}`));
    const uids = snapshot.val()?.roomates;
    uids.forEach(async (uid, index) => {
      const userSnap = await get(child(ref(db), `users/${uid}`));
      if (userSnap.exists()) {
        fetchedDetails.push(userSnap.val());
      }
    });
    setUserDetails(fetchedDetails);
  };

  const getPriorityColour = (priority) => {
    switch (priority) {
      case "P1":
        return "text-red-500";
      case "P2":
        return "text-orange-500";
      case "P3":
        return "text-indigo-500";
      default:
        return "text-gray-500";
    }
  };

  const handleUserPickerClick = (event) => {
    if (
      userPickerRef.current &&
      !userPickerRef.current.contains(event.target)
    ) {
      setShowUsers(false);
    }
  };

  const handleDateClickOutside = (event) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target)
    ) {
      setShowDatePicker(false);
    }
  };

  const handlePriorityClickOutside = (event) => {
    if (
      priorityPickerRef.current &&
      !priorityPickerRef.current.contains(event.target)
    ) {
      setShowPriority(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleSideBarMinimize = () => {
    setMinimize(!minimize);
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out.");
    }
  };

  const handleCompleteTask = async (taskDetail, index) => {
    // console.log("Index ----> ",index);
    const taskId = taskDetail?.taskid;
    try {
      if (taskId) {
        const taskRef = ref(db, `tasks/${taskId}`);
        await remove(taskRef);
      }
      setTaskDetails((prevTasks) =>
        prevTasks.filter((task) => task.taskid !== taskId)
      );
    } catch (error) {
      console.error("Error deleting tasks. ", error);
    }
  };

  const filterCurrentTasks = async (roomId) => {
    setSelectedFilter("Today");
    try {
      const tasksRef = ref(db, "tasks");
      const roomQuery = query(
        tasksRef,
        orderByChild("roomid"),
        equalTo(roomId)
      );

      const snapshot = await get(roomQuery);

      if (snapshot.exists()) {
        const tasks = Object.values(snapshot.val()).filter((task) => {
          const curDate = new Date();
          const taskDate = new Date(task.duedate);

          if((curDate.getDay() === taskDate.getDay()) && (curDate.getMonth() === taskDate.getMonth()) && (curDate.getFullYear() === taskDate.getFullYear())){
            return true;
          }
          return false;
        }).sort((a,b) => {
          return new Date(a.duedate) - new Date(b.duedate);
        })
        setTaskDetails(tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks. ", error);
    }
  };

  const fetchUpcomingTasks = async (roomId) => {
    setSelectedFilter("Upcoming");
    try {
      const tasksRef = ref(db, "tasks");
      const roomQuery = query(
        tasksRef,
        orderByChild("roomid"),
        equalTo(roomId)
      );

      const snapshot = await get(roomQuery);
      if(snapshot.exists()){
        const tasks = Object.values(snapshot.val()).filter((task) => {
          const curDate = new Date();
          const taskDate = new Date(task.duedate);

          if(curDate.getFullYear() < taskDate.getFullYear()){
            return true;
          }else if(curDate.getFullYear() === taskDate.getFullYear()){
            if(curDate.getMonth() < taskDate.getMonth()){
              return true;
            }else if(curDate.getMonth() === taskDate.getMonth()){
              if(curDate.getDate() < taskDate.getDate()){
                return true;
              }
            }
          }

          return false;
        }).sort((a,b) => {
          return (new Date(a.duedate) - new Date(b.duedate));
        })

        setTaskDetails(tasks);
      }

    } catch (error) {
      console.error("Error fetching tasks. ", error);
    }
  }

  return (
    <div className="min-h-screen h-screen w-screen overflow-auto">
      <div className="flex flex-row h-full">
        <div
          className={`transition-all dealay-200 ease-in-out hidden md:block flex-none ${
            minimize
              ? "transition-all delay-100 ease-in-out w-20 bg-white"
              : "transition-all delay-100 ease-in-out w-80 bg-customgray"
          } h-full overflow-clip`}
        >
          <div className="p-4 w-full h-full flex flex-col">
            <div className="p-2 flex flex-row justify-end">
              <div
                className={`p-2 rounded-md hover:bg-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-90 ${
                  minimize ? "hidden" : ""
                }`}
              >
                <FiBell className="text-xl font-bold hover:text-gray-900" />
              </div>
              <div
                onClick={handleSideBarMinimize}
                className="p-2 rounded-md hover:bg-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-90 "
              >
                <FiSidebar className="text-xl font-bold hover:text-gray-900" />
              </div>
            </div>
            <div
              className={`mt-4 p-2 flex flex-grow flex-col space-y-1 ${
                minimize ? "hidden" : " "
              }`}
            >
              <div
                onClick={() => {
                  setSelectedFilter("All");
                  if (roomId) {
                    fetchTasks(roomId);
                  }
                }}
                className={`p-2 flex flex-row items-center justify-start space-x-2 rounded-lg ${
                  selectedFilter === "All"
                    ? "text-customtextred bg-custombgred"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }  hover:cursor-pointer `}
              >
                <CiInboxIn className="text-xl" />
                <p className="text-sm">All</p>
              </div>
              <div
                onClick={() => {
                  if(roomId){
                    filterCurrentTasks(roomId);
                  }
                }}
                className={`p-2 flex flex-row items-center justify-start space-x-2 rounded-lg ${
                  selectedFilter === "Today"
                    ? "text-customtextred bg-custombgred"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }  hover:cursor-pointer `}
              >
                <CiCalendarDate className="text-xl" />
                <p className="text-sm">Today</p>
              </div>
              <div
                onClick={() => {
                  if(roomId){
                    fetchUpcomingTasks(roomId);
                  }
                }}
                className={`p-2 flex flex-row items-center justify-start space-x-2 rounded-lg ${
                  selectedFilter === "Upcoming"
                    ? "text-customtextred bg-custombgred"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }  hover:cursor-pointer `}
              >
                <CiCalendar className="text-xl" />
                <p className="text-sm">Upcoming</p>
              </div>
            </div>
            <div
              className={`p-2 flex flex-col place-content-end ${
                minimize ? "hidden" : " "
              }`}
            >
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
          <div className="flex flex-row items-center space-x-4 w-7/10 h-10 mt-8 ml-auto mr-auto">
            <div
              onClick={() => navigate("/")}
              className={`p-2 rounded-md hover:bg-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-90 `}
            >
              <FaChevronLeft className="text-xl font-bold hover:text-gray-900" />
            </div>
            <p className="text-2xl font-semibold">Tasks</p>
          </div>
          {taskDetails.length > 0 && (
            <div className="p-auto w-7/10 mt-2 ml-auto mr-auto">
              {taskDetails.map((taskDetail, index) => (
                <div
                  key={index}
                  className="transition-all delay-200 ease-in-out p-2 flex flex-row items-start justify-center"
                >
                  <div className="mt-5 rounded-full border border-gray-400 hover:border-gray-700 w-5 h-5">
                    <div
                      onClick={() => handleCompleteTask(taskDetail, index)}
                      className="w-full h-full flex justify-center items-center opacity-0 transition-all delay-100 ease-in-out hover:opacity-95"
                    >
                      <FaCheck className="font-light text-xs text-gray-500" />
                    </div>
                  </div>
                  <div className="p-2 w-full h-30 max-h-60 border-b overflow-auto">
                    <input
                      readOnly={true}
                      value={taskDetail?.taskname || ""}
                      placeholder="Task Name"
                      className="w-full h-8 text-sm outline-none text-gray-700"
                    />
                    <input
                      readOnly={true}
                      value={taskDetail?.description || ""}
                      placeholder="Description"
                      className="w-full h-8 font-normal text-xs text-gray-500 outline-none"
                    />
                    <div className="flex flex-row space-x-2 flex-start">
                      <button className="flex flex-row items-center justify-center p-2  h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500">
                        <CiCalendar className="mr-1 text-lg text-green-500" />
                        <span className="text-green-500">
                          {taskDetail?.duedate?.toString()?.substring(4, 11)}
                        </span>
                      </button>
                      <button className="flex flex-row items-center justify-center p-2  h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500">
                        <FaFlag
                          className={`mr-1 text-md ${getPriorityColour(
                            taskDetail?.priority
                          )}`}
                        />
                        <span>{taskDetail?.priority || ""}</span>
                      </button>
                      {Array.isArray(taskDetail?.usernames) &&
                        taskDetail?.usernames.length > 0 &&
                        taskDetail?.usernames.map((user, index) => (
                          <button
                            key={index}
                            className="flex flex-row items-center justify-center p-2 h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500"
                          >
                            <span>{user?.username?.split(" ")[0]}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="relative p-auto w-7/10 mt-2 ml-auto mr-auto">
            {addTask && (
              <div className="p-2 w-full h-42 max-h-60 rounded-lg border border-gray-400">
                <textarea
                  value={newTask?.name}
                  placeholder="Task Name"
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      taskname: event.target.value,
                    }))
                  }
                  className="w-full h-8 resize-none font-semibold text-sm outline-none placeholder-gray-500 placeholder-opacity-75 placeholder-inset-0"
                />
                <textarea
                  value={newTask?.description}
                  placeholder="Description"
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      taskdescription: event.target.value,
                    }))
                  }
                  className="w-full h-8 resize-none font-normal text-sm text-gray-500 outline-none placeholder-gray-500 placeholder-opacity-60 placeholder-inset-0"
                />
                <div className="flex flex-row space-x-2 flex-start overflow-auto">
                  {selectedDate && (
                    <button className="flex flex-row items-center justify-center p-2  h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500">
                      <CiCalendar className="mr-1 text-lg text-green-500" />
                      <span className="text-green-500">
                        {selectedDate.toString().substring(4, 11)}
                      </span>
                      <IoCloseSharp
                        onClick={() => {
                          setSelectedDate(null);
                        }}
                        className="hover:scale-110 hover:text-gray-800 ml-1"
                      />
                    </button>
                  )}
                  {!selectedDate && (
                    <button
                      onClick={() => setShowDatePicker(true)}
                      className="flex flex-row items-center justify-center p-2  h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500 overflow-clip"
                    >
                      <CiCalendar className="md:mr-1 text-lg" />
                      <span className="hidden md:block">Due Date</span>
                    </button>
                  )}
                  {priority && (
                    <button className="flex flex-row items-center justify-center p-2  h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500">
                      <FaFlag
                        className={`mr-1 text-md ${getPriorityColour(
                          priority
                        )}`}
                      />
                      <span>{priority}</span>
                      <IoCloseSharp
                        onClick={() => {
                          setPriority(null);
                        }}
                        className="hover:scale-110 hover:text-gray-800 ml-1"
                      />
                    </button>
                  )}
                  {!priority && (
                    <button
                      onClick={() => setShowPriority(true)}
                      className="flex flex-row items-center justify-center p-2  h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500"
                    >
                      <CiFlag1 className="md:mr-1 text-lg" />
                      <span className="hidden md:block">Priority</span>
                    </button>
                  )}
                  {selectedUsers.length > 0 &&
                    selectedUsers.map((user, index) => (
                      <button
                        key={index}
                        className="flex flex-row items-center justify-center p-2  h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500"
                      >
                        <span>{user.username.split(" ")[0]}</span>
                      </button>
                    ))}
                  <button
                    onClick={() => setShowUsers(true)}
                    className="flex flex-row items-center justify-center p-2  h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500"
                  >
                    <CiUser className="md:mr-1 text-lg" />
                    <span className="hidden md:block">Asignee</span>
                  </button>
                  {showUsers && (
                    <div ref={userPickerRef} className="absolute left-0 top-0">
                      <UsersPicker
                        setShowUsers={setShowUsers}
                        userDetails={userDetails}
                        setSelectedUsers={setSelectedUsers}
                      />
                    </div>
                  )}
                  {showDatePicker && (
                    <div ref={datePickerRef} className="absolute left-0 top-0"
                    >
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        maxDate={new Date().setMonth(new Date().getMonth() + 1)}
                        inline
                      />
                    </div>
                  )}
                  {showPriority && (
                    <div
                      ref={priorityPickerRef}
                      className="absolute left-0 top-0"
                    >
                      <PriorityPicker
                        priority={priority}
                        setPriority={setPriority}
                        setShowPriority={setShowPriority}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-2 w-full border border-gray-300"></div>
                <div className=" mt-2 flex flex-row space-x-2 justify-end">
                  <button
                    onClick={() => {
                      setNewTask({
                        taskname: "",
                        taskdescription: "",
                      });
                      setPriority(null);
                      setSelectedDate(null);
                      setSelectedUsers([]);
                      setAddTask(false);
                    }}
                    className="flex items-center justify-center p-2 h-7 text-semibold text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-all delay-100 ease-in-out hover:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewTask}
                    className="flex items-center justify-center p-2 h-7 text-semibold text-sm text-white bg-red-400 hover:bg-red-500 rounded-lg transition-all delay-100 ease-in-out hover:scale-95"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            )}
            {!addTask && (
              <div
                onClick={() => setAddTask(true)}
                className="p-2 flex flex-row items-center space-x-2 group hover:cursor-pointer"
              >
                <div className="flex items-center justify-center w-4 h-4 rounded-full font-thin text-red-600 group-hover:bg-red-600 group-hover:text-white">
                  <FaPlus />
                </div>
                <p className="text-md text-gray-400 group-hover:text-red-400">
                  Add Task
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
