import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  ref,
  get,
  child,
  query,
  orderByChild,
  equalTo,
  remove,
} from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { GoHome } from "react-icons/go";
import { GiAtomicSlashes } from "react-icons/gi";
import { MdOutlineLocalGroceryStore } from "react-icons/md";
import { FaDollarSign, FaCheck } from "react-icons/fa6";
import { TbCash,TbUser,TbNotes } from "react-icons/tb";
import {
  CiMoneyBill,
  CiSettings,
  CiCircleInfo,
  CiPower,
  CiBellOn,
  CiNote,
} from "react-icons/ci";
import { GoTasklist } from "react-icons/go";
import { AiOutlineTeam } from "react-icons/ai";
import { IoCalendarOutline } from "react-icons/io5";

const Dashboard = () => {
  const navigate = useNavigate();
  const [signedUser, setSignedUser] = useState();
  const [curDate, setCurDate] = useState(new Date().toString());
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([
    {
      id: 28,
      description: "Tablets",
      date: `${new Date()}`,
      assignee: `prudhvideep1996`,
      amount: 20,
      type: "debit",
    },
    {
      id: 56,
      description: "Rice",
      date: `${new Date()}`,
      assignee: `prudhvideep1996`,
      amount: 10.5,
      type: "credit",
    },
    {
      id: 89,
      description: "Biryani",
      date: `${new Date()}`,
      assignee: `prudhvideep1996`,
      amount: 12.8,
      type: "debit",
    },
  ]);
  const [toReceive, setToReceive] = useState(0.0);
  const [toPay, setToPay] = useState(0.0);
  const [userDetails, setUserDetails] = useState([]);

  const handleRoomatesNav = () => {
    navigate("/roomates");
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
      } else {
        setSignedUser(user);
        const snapShot = await get(child(ref(db), `mapping/${user.uid}`));
        if (snapShot.exists()) {
          fetchTasks(snapShot.val());
          fetchUserDetails(snapShot.val())
        }
      }
    });
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("Sign out sucessful");
    } catch (error) {
      console.error("Error during sign out.");
    }
  };

  const fetchUserDetails = async (roomId) => {
    const roomSnap = await get(child(ref(db), `/rooms/${roomId}`));

    if(roomSnap.exists()){
      const users = roomSnap.val().roomates;
      users.forEach(async (userId) => {
        const userSnap = await get(child(ref(db), `/users/${userId}`));
        if (userSnap.exists()) {
          setUserDetails((prev) => {
            if (!prev.some((user) => user.uid === userSnap.val().uid)) {
              return [...prev, userSnap.val()];
            }
            return prev;
          });
        }
      });
  
    }
  }

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
        }).slice(0,4);

        setTasks(tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks. ", error);
    }
  };

  const handleCompleteTask = async (taskDetail, index) => {
    const taskId = taskDetail?.taskid;
    try {
      if (taskId) {
        const taskRef = ref(db, `tasks/${taskId}`);
        await remove(taskRef);
      }
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.taskid !== taskId)
      );
    } catch (error) {
      console.error("Error deleting tasks. ", error);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-200 bg-gradient-to-t flex items-center justify-center">
      <div className="w-9/10 h-full md:w-10/12 md:h-9/10 grid grid-cols-1 md:grid-rows-8 md:grid-cols-3 gap-2 md:gap-6">
        <div
          name="sideBar"
          className="p-2 md:p-0 bg-white md:row-span-8 min-h-12 rounded-lg overflow-x-scroll md:overflow-auto"
        >
          <div className="hidden p-4 ml-auto mr-auto mt-8 w-8/10 md:flex flex-row">
            <div className="flex flex-row space-x-2">
              <GiAtomicSlashes className="text-3xl text-gray-700" />
              <p className="text-xl font-semibold text-gray-700">Ease Abode</p>
            </div>
          </div>
          <div className=" md:p-4 ml-auto mr-auto mt-2 md:mt-8 w-8/10 flex flex-row space-x-4 md:space-x-0 items-center justify-center md:flex-col md:space-y-6 md:justify-start md:items-start">
            <div className="p-1 flex flex-row items-center space-x-4 text-gray-700 hover:text-gray-700 hover:bg-gray-200 rounded-md hover:cursor-pointer">
              <GoHome className="text-2xl font-bold" />
              <p className="text-md font-medium hidden md:block">Home</p>
            </div>
            <div className="p-1 relative flex flex-row items-center space-x-4 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-200 hover:cursor-pointer">
              <CiMoneyBill className="text-2xl font-bold " />
              <p className="text-md font-medium hidden md:block">Expenses</p>
              {/* <FaCirclePlus className="text-sm absolute right-10 inset-y-1"/> */}
            </div>
            <div
              onClick={() => navigate("/tasks")}
              className="p-1 relative flex flex-row items-center space-x-4 text-gray-400 hover:text-gray-700  hover:bg-gray-200 rounded-md hover:cursor-pointer"
            >
              <GoTasklist className="text-2xl font-bold " />
              <p className="text-md font-medium hidden md:block">Tasks</p>
              {/* <FaCirclePlus className="text-sm absolute right-10 inset-y-1"/> */}
            </div>
            <div
              onClick={() => navigate("/notes")} 
              className="p-1 relative flex flex-row items-center space-x-4 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md hover:cursor-pointer">
              <TbNotes className="text-2xl font-bold " />
              <p className="text-md font-medium hidden md:block">Notes</p>
              {/* <FaCirclePlus className="text-sm absolute right-10 inset-y-1"/> */}
            </div>
            <div
              onClick={handleRoomatesNav}
              className="p-1 relative flex flex-row items-center space-x-4 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md hover:cursor-pointer"
            >
              <AiOutlineTeam className="text-2xl font-bold " />
              <p className="text-md font-medium hidden md:block">Roomates</p>
            </div>
            <div className="p-1 relative flex flex-row items-center space-x-4 text-gray-400 hover:bg-gray-200 rounded-md hover:text-gray-700 hover:cursor-pointer">
              <CiSettings className="text-2xl font-bold " />
              <p className="text-md font-medium hidden md:block">Settings</p>
            </div>
            <div
              onClick={handleSignOut}
              className="md:hidden p-1 relative flex flex-row items-center space-x-4 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md hover:cursor-pointer"
            >
              <CiPower className="text-2xl font-bold " />
              <p className="text-md font-medium hidden md:block">Log Out</p>
            </div>
          </div>
          <div className="md:p-4 ml-auto mr-auto mt-16 w-8/10 hidden md:flex flex-row md:flex-col space-y-6">
            <div className="p-1 relative flex flex-row items-center space-x-4 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md hover:cursor-pointer">
              <CiCircleInfo className="text-2xl font-bold " />
              <p className="text-md font-medium hidden md:block">Help & Information</p>
            </div>
            <div
              onClick={handleSignOut}
              className="p-1 relative flex flex-row items-center space-x-4 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md hover:cursor-pointer"
            >
              <CiPower className="text-2xl font-bold " />
              <p className="text-md font-medium">Log Out</p>
            </div>
          </div>
        </div>
        <div
          name="TopBar"
          className="hidden md:block bg-white w-full md:row-span-1 md:col-span-2 rounded-lg"
        >
          <div className="w-full h-full rounded-lg flex flex-row space-x-2 items-center justify-around overflow-x-clip">
            <div className="flex flex-row w-9/10 h-full">
              <div className="p-2 flex flex-row w-1/2 max-w-1/2 h-full max-h-full space-x-4 items-center justify-center ">
                <div className="max-w-1/10 h-6.5/10 bg-gray-100 rounded-full overflow-hidden ring-1 ring-indigo-500 hover:ring-offset-1">
                  <img
                    alt=""
                    src={signedUser?.photoURL}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="flex-col flex-wrap max-w-3/10 h-1/2 items-start justify-center overflow-hidden  hidden">
                  <p className="text-xs font-semibold">
                    {signedUser?.email.split("@")[0]}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    {signedUser?.displayName}
                  </p>
                </div>
                <div className="p-2 max-w-1/10 max-h-full" />
                <div className="p-2 max-w-4/10 h-6/10 max-h-6/10 bg-gray-100 rounded-xl flex flex-row items-center justify-center space-x-2">
                  <IoCalendarOutline className="text-lg" />
                  <p className="text-xs md:text-sm text-gray-600 font-medium hidden lg:block">
                    {curDate.substring(4, 10)}
                  </p>
                </div>
              </div>
              <div className=" flex flex-row w-1/2 max-w-1/2 h-full max-h-full space-x-4 items-center justify-center">
                <input
                  placeholder="Search"
                  readOnly={true}
                  className="hidden md:block p-2 h-5/10 max-h-5/10 max-w-1/2 bg-gray-100 rounded-xl text-gray-700 hover:cursor-pointer"
                ></input>
                <div className="p-3 max-w-1/10 h-5/10 max-h-5/10 bg-gray-100 rounded-full items-center justify-center hover:text-bold hover:border hover:border-gray-700 hover:cursor-pointer hidden lg:flex">
                  <CiBellOn className="min-w-1/2 min-h-1/2 text-xl font-semibold" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          name="Tasks"
          className="bg-white md:row-span-7 md:col-span-1 rounded-lg overflow-clip md:overflow-auto" 
        >
          <div className="p-4 w-9/10 ml-auto mr-auto flex flex-col space-y-4 h-full">
            <p className="text-xl font-semibold text-gray-700">
              Upcoming Tasks
            </p>
            <div className="w-9/10 ml-auto mr-auto flex flex-col space-y-4 h-full ">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="w-full md:h-2/10 flex flex-row space-x-2 items-center"
                >
                  <div
                    onClick={() => handleCompleteTask(task, index)}
                    className="p-2 rounded-full border border-gray-400 h-1/10 w-2 hover:border-gray-600 hover:bg-gray-300 transition-all duration-200 ease-in-out"
                  >
                    <div className="w-full h-full flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-200 ease-in-out">
                      <FaCheck className="font-light text-xs text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1 flex-col space-y-2 w-full">
                    <p className="text-sm font-semibold">{task?.taskname}</p>
                    <p className="text-sm font-normal text-gray-500">
                      {task.description}
                    </p>
                    <div className="flex flex-row  items-center justify-center border bg-green-50 border-green-400 text-green-600 w-5/10 max-w-5/10 rounded-lg">
                      <IoCalendarOutline />
                      <p>{task?.duedate.substring(4, 11)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div name="Users" className="bg-white row-span-3 col-span-1 rounded-lg">
          <div className="w-full h-full rounded-lg overflow-auto">
            <div className="p-4 w-9/10 ml-auto mr-auto flex flex-col space-y-4 h-full">
              <p className="text-xl font-semibold text-gray-700">Roomates</p>
              {userDetails.map((user,index) => (
                <div key={index} className="flex flex-row justify-between text-gray-500">
                  <div className="flex flex-row items-center justify-center space-x-2">
                    <TbUser className="text-lg font-bold" />
                    <p className="font-semibold text-sm">
                      {user.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          name="Expenses"
          className="bg-white row-span-4 col-span-1 rounded-lg"
        >
          <div className="w-full h-full rounded-lg overflow-auto">
            <div className="p-4 w-9/10 ml-auto mr-auto flex flex-col space-y-4 h-full">
              <p className="text-xl font-semibold text-gray-700">Expenses</p>
              <div className=" flex flex-row justify-between h-1/3">
                <div className="w-4.5/10 h-full">
                  <div className="p-4 bg-cream rounded-xl h-full flex flex-row items-center justify-center">
                    <p className="text-bold text-xl">+</p>
                    <FaDollarSign />
                    <p className="text-bold text-xl">{toReceive}</p>
                  </div>
                </div>
                <div className="w-4.5/10 h-full">
                  <div className="p-4 bg-blue-200 rounded-xl h-full flex flex-row items-center justify-center overflow-auto">
                    <p className="text-bold text-xl">-</p>
                    <FaDollarSign />
                    <p className="text-bold text-xl">{toPay}</p>
                  </div>
                </div>
              </div>
              <p className="text-md font-bold text-gray-500">
                Latest Transactions
              </p>
              {expenses.map((expense,index) => (
                <div key={index} className="flex flex-row justify-between text-gray-500">
                  <div className="flex flex-row items-center justify-center space-x-2">
                    <TbCash className="text-lg font-bold" />
                    <p className="font-semibold text-sm">
                      {expense.description}
                    </p>
                  </div>
                  <div
                    className={`flex flex-row max-w-1/6 border rounded-lg items-center justify-center ${
                      expense?.type === "debit"
                        ? "bg-red-200 text-red-900"
                        : "bg-green-200 text-green-900"
                    } overflow-hidden`}
                  >
                    <p>{expense?.type === "debit" ? "-" : "+"}</p>
                    <p className="text-sm mr-1">{expense.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
