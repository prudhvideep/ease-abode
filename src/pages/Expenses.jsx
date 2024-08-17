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
  limitToFirst,
  limitToLast,
} from "firebase/database";
import "react-datepicker/dist/react-datepicker.css";
import { FiSidebar, FiBell } from "react-icons/fi";
import { IoAddCircle } from "react-icons/io5";
import { MdHistory, MdHome } from "react-icons/md";
import {
  FaChevronLeft,
  FaPlus,
  FaUserGroup,
  FaDollarSign,
} from "react-icons/fa6";
import { CiCircleInfo, CiPower, CiInboxIn } from "react-icons/ci";

const Expenses = () => {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState();
  const [minimize, setMinimize] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [roomId, setRoomId] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState(null);
  const [userDetails, setUserDetails] = useState([]);
  const [showUsersPopup, setShowUsersPopup] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
      } else {
        setAuthUser(user);

        const snapShot = await get(child(ref(db), `mapping/${user.uid}`));
        if (snapShot.exists()) {
          const roomId = snapShot.val();
          setRoomId(roomId);
          fetchGroups(roomId);
          fetchUserDetails(roomId);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchTransactions(selectedGroup.groupId);
    }
  }, [selectedGroup]);

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

  const fetchGroups = async (roomId) => {
    const groupsQuery = query(
      ref(db, "groups"),
      orderByChild("roomId"),
      equalTo(roomId)
    );
    const snapShot = await get(groupsQuery);

    if (snapShot.exists()) {
      const groupsData = snapShot.val();
      const groupsArray = Object.values(groupsData);
      setGroups(groupsArray);

      if (groupsArray.length > 0) {
        const [firstGroup] = groupsArray;
        setSelectedGroup(firstGroup);
        setGroupUsers(firstGroup.users || []);
      }
    } else {
      setGroups([]);
      setSelectedGroup(null);
      setGroupUsers([]);
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

  const fetchTransactions = async (groupId) => {
    const txnRef = ref(db, "transactions");
    const transactionQuery = query(
      txnRef,
      orderByChild("groupId"),
      equalTo(groupId),
      limitToLast(20)
    );

    const snapshot = await get(transactionQuery);
    if (snapshot.exists()) {
      const txns = snapshot.val();
      const sortedTxns = Object.values(txns).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTransactions(sortedTxns);
    } else {
      setTransactions([]);
    }
  };

  const handleAddNewGroupUser = async (user) => {
    if (selectedGroup) {
      const userDetail = {
        uid: user.uid,
        username: user.username,
      };

      const updatedUsers = [...(selectedGroup.users || []), userDetail];
      const updatedGroup = { ...selectedGroup, users: updatedUsers };

      await set(ref(db, `groups/${selectedGroup.groupId}`), updatedGroup);
      setSelectedGroup(updatedGroup);
      setGroupUsers(updatedUsers);
      setShowUsersPopup(false);
      fetchGroups(roomId);
    }
  };

  const handleAddNewGroup = async () => {
    if (roomId) {
      const groupId = push(ref(db, "groups")).key;
      const groupName = newGroupName;

      if (newGroupName === "" || !newGroupName) {
        alert("Group Name Cannot be Empty");
        return;
      }

      const newGroup = {
        groupId: groupId,
        groupName: groupName,
        roomId: roomId,
        users: [],
      };

      await set(ref(db, `groups/${groupId}`), newGroup);
      setShowAddGroup(false);
      fetchGroups(roomId);
    }
  };

  const getMonth = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString("en-US", { month: "short" });

    return month;
  };

  const getCurUserShare = (transaction) => {
    const authUid = authUser?.uid;

    if (!authUid) return;

    const paidSplit = Object.entries(transaction.splits).find(
      ([_, amount]) => amount > 0
    );
    const [paidByUid, paidAmount] = paidSplit || [];

    const authUserSplit = Object.entries(transaction.splits).find(
      ([uid, _]) => uid === authUid
    );
    const [_, authAmount] = authUserSplit || [];

    console.log("paid by uid", paidByUid, "authUid", authUid);

    if (authAmount === undefined) {
      return (
        <div className="flex flex-col items-start justify-start">
          <p className="text-[10px] font-medium text-gray-400">Not Involved</p>
        </div>
      );
    }

    if (authAmount === 0 && paidByUid === authUid) {
      return (
        <div className="flex flex-col items-start justify-start">
          <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
            You lent
          </p>
          <div className="flex flex-row items-center justify-start">
            <FaDollarSign className="text-[12px]" />
            <p className="text-[12px] font-bold">{paidAmount || ""}</p>
          </div>
        </div>
      );
    }

    if (authAmount > 0) {
      return (
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
            You lent
          </p>
          <div className="flex flex-row items-center">
            <FaDollarSign className="text-[12px]" />
            <p className="text-[12px] font-bold">{authAmount || ""}</p>
          </div>
        </div>
      );
    }

    if (authAmount < 0 && paidByUid === authUid) {
      return (
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
            You get back
          </p>
          <div className="flex flex-row items-center">
            <FaDollarSign className="text-[12px]" />
            <p className="text-[12px] font-bold">
              {Math.abs(authAmount) || ""}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end">
        <p className="text-[10px] font-medium text-gray-400">Not Involved</p>
      </div>
    );
  };

  const getPaidBy = (transaction) => {
    var paidSplit = Object.entries(transaction.splits).filter(
      ([_, amount]) => amount > 0
    );
    var [paidByUid, paidAmount] = paidSplit[0];
    var paidUserDetail = userDetails.find(
      (userDetail) => userDetail.uid === paidByUid
    );

    const paidUserName = paidUserDetail
      ? paidUserDetail.uid === authUser.uid
        ? "You"
        : paidUserDetail.username.split(" ")[0]
      : "User";

    return (
      <div className="flex flex-col items-end">
        <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
          {paidUserName} paid
        </p>
        <div className="flex flex-row items-center">
          <FaDollarSign className="text-[12px]" />
          <p className="text-[12px] font-bold">{paidAmount || ""}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen h-screen w-screen overflow-auto">
      <div className="flex flex-row h-full">
        {/* sidebar */}
        <div
          className={`transition-all duration-200 ease-in-out hidden md:block flex-none ${
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
                className={`p-2 flex flex-row items-center justify-start space-x-2 rounded-lg hover:cursor-pointer `}
              >
                <p className="text-lg font-medium">Groups</p>
              </div>
              {groups.length > 0 &&
                groups.map((group, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedGroup(group);
                      setGroupUsers(group?.users || []);
                    }}
                    className={`p-2 flex flex-row items-center justify-start space-x-2 rounded-lg ${
                      selectedGroup?.groupName === group.groupName
                        ? "text-customtextred bg-custombgred"
                        : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    }  hover:cursor-pointer `}
                  >
                    <FaUserGroup className="text-xl" />
                    <p className="text-sm">{group.groupName}</p>
                  </div>
                ))}
              {showAddGroup && (
                <div className="flex flex-col justify-start items-start space-y-2">
                  <div
                    className={`mt-3 relative w-full flex flex-row items-center justify-start space-x-2 rounded-lg hover:cursor-pointer`}
                  >
                    <input
                      onChange={(event) => setNewGroupName(event.target.value)}
                      className="p-2 pr-10 w-full h-full rounded-md border-2 border-customtextred outline-red-800"
                    />
                    <IoAddCircle
                      onClick={handleAddNewGroup}
                      className="absolute text-customtextred text-lg right-2"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowAddGroup(false);
                      setNewGroupName(null);
                    }}
                    className="p-2 bg-custombgred text-customtextred hover:bg-red-100  rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {!showAddGroup && (
                <div
                  onClick={() => {
                    if (roomDetails && roomDetails?.groups?.length >= 4) {
                      alert("Groups Limit Reached!!");
                      return;
                    }
                    setShowAddGroup(true);
                  }}
                  className={`ml-3 mt-3 relative flex flex-row items-center justify-start space-x-2 rounded-lg hover:cursor-pointer group`}
                >
                  <div className="flex items-center justify-center w-4 h-4 rounded-full font-thin text-red-600 group-hover:bg-red-600 group-hover:text-white">
                    <FaPlus />
                  </div>
                  <p className="text-md text-gray-400 group-hover:text-red-400">
                    Add Group
                  </p>
                </div>
              )}
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
        {/* MainArea */}
        <div className="w-full h-full bg-white">
          <div className="flex flex-row items-center space-x-4 w-9/10 md:w-7/10 h-10 mt-8 ml-auto mr-auto">
            <div
              onClick={() => navigate("/")}
              className={`p-2 rounded-md hover:bg-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-90 `}
            >
              <FaChevronLeft className="text-xl font-bold hover:text-gray-900" />
            </div>
            <p className="text-2xl font-semibold">Expenses</p>
          </div>
          <div className="relative space-x-4 p-4 w-9/10 md:w-7/10 mt-8 ml-auto mr-auto border rounded-lg">
            {showUsersPopup && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity duration-300 ease-in-out opacity-0"
                style={{ opacity: showUsersPopup ? "1" : "0" }}
              >
                <div
                  className={`bg-white p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
                    showUsersPopup
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  <h2 className="text-lg font-bold mb-2">Select a User</h2>
                  <ul className="space-y-2">
                    {userDetails.map((user, index) => (
                      <li
                        key={index}
                        onClick={() => handleAddNewGroupUser(user)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
                      >
                        {user.username}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setShowUsersPopup(false)}
                    className="mt-4 p-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <div className="p-2 flex flex-row items-end space-x-2">
              <MdHome className="text-4xl text-gray-500" />
              <p className="text-lg font-medium text-gray-500">
                {selectedGroup?.groupName || "Select Group"}
              </p>
            </div>
            <div className="flex flex-row space-x-2">
              {groupUsers?.length > 0 &&
                groupUsers.map((user, index) => (
                  <button
                    key={index}
                    className="flex flex-row items-center justify-center p-2  h-6 text-semibold text-xs border border-gray-300 hover:bg-gray-50 rounded-md text-gray-500 shadow-md"
                  >
                    <span>{user.username.split(" ")[0]}</span>
                  </button>
                ))}
              {!showUsersPopup && (
                <div
                  onClick={() => {
                    setShowUsersPopup(true);
                  }}
                  className={`flex flex-row items-center justify-start space-x-2 rounded-lg hover:cursor-pointer group`}
                >
                  <div className="flex items-center justify-center w-4 h-4 rounded-full font-thin text-red-600 group-hover:bg-red-600 group-hover:text-white">
                    <FaPlus />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-row p-2 space-x-2 items-center justify-end">
              <button className="p-1 pl-2 pr-2 rounded-lg bg-orange-600 text-white font-medium hover:scale-105">
                Add an Expense
              </button>
              <button className="p-1 pl-2 pr-2 rounded-lg bg-emerald-400 text-white font-medium hover:scale-105">
                Settle Up
              </button>
            </div>
          </div>
          <div className="w-9/10 md:w-7/10 h-10 mt-8 ml-auto mr-auto">
            <p className="text-lg font-semibold">Transactions</p>
            {transactions.length > 0 &&
              transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex flex-row justify-between items-center border-t border-b hover:bg-gray-100 hover:shadow-modern-lg"
                >
                  <div className="flex flex-row space-x-2 items-center w-full ">
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-400 font-normal">
                        {getMonth(transaction.date)}
                      </p>
                      <p className="text-xl text-gray-400 font-normal">
                        {transaction.date.split("-")[2]}
                      </p>
                    </div>
                    <div className="border w-8 h-8 bg-gray-200 hover:bg-inherit">
                      <img
                        src={`${transaction.category}.png`}
                        alt={`${transaction.category || "General"}`}
                      />
                    </div>
                    <p className="font-semibold hover:underline hover:cursor-pointer">
                      {transaction.description}
                    </p>
                  </div>
                  <div className="flex flex-row space-x-3">
                    {getPaidBy(transaction)}
                    {getCurUserShare(transaction)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
