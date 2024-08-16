import React, { useEffect, useRef, useState } from "react";
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
import "react-datepicker/dist/react-datepicker.css";
import { FiSidebar, FiBell } from "react-icons/fi";
import { FaChevronLeft, FaRegImage } from "react-icons/fa6";
import { IoColorPaletteOutline } from "react-icons/io5";
import {
  CiCircleInfo,
  CiPower,
  CiTrash,
  CiSquareCheck,
  CiImageOn,
  CiShare2,
} from "react-icons/ci";
import { MdOutlineMailOutline } from "react-icons/md";
import { GoArchive } from "react-icons/go";
import { BiSolidPaint } from "react-icons/bi";
import useAutoSizeTextArea from "../hooks/TextAreaHook";

const Notes = () => {
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const newNoteRef = useRef(null);
  const popupTitleRef = useRef(null);
  const popupDataRef = useRef(null);
  const newNoteTextAreaRef = useRef(null);

  const [authUser, setAuthUser] = useState();
  const [minimize, setMinimize] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState();

  const [roomId, setRoomId] = useState(null);
  const [newList, setNewList] = useState(false);
  const [showPopup,setShowPopup] = useState(false);
  const [popupData,setPopupData] = useState();
  const [newListType, setNewListType] = useState();
  const [noteDetails, setNoteDetails] = useState([]);
  const [newNormalListData, setNewNormalListData] = useState(null);
  const [newNormalListTitle, setNewNormalListTitle] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
      } else {
        setAuthUser(user);

        const snapShot = await get(child(ref(db), `mapping/${user.uid}`));
        if (snapShot.exists()) {
          setRoomId(snapShot.val());
          fetchNoteDetails(snapShot.val());
        }
      }
    });
  }, []);

  useEffect(() => {
    if (newList) {
      document.addEventListener("mousedown", handleNewNoteOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleNewNoteOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleNewNoteOutsideClick);
    };
  }, [newList, newNormalListData, newNormalListTitle]);

  useEffect(() => {
    if(popupRef){
      document.addEventListener("mousedown", handlePopupOutsideClick);
    }else{
      document.removeEventListener("mousedown", handlePopupOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handlePopupOutsideClick);
    }
  },[showPopup,popupRef,popupData]);

  useEffect(() => {
    if (showPopup && popupData) {
      const timer = setTimeout(() => {
        setPopupData({...popupData});
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [showPopup, popupData])

  useAutoSizeTextArea(
    newNoteTextAreaRef,
    newNormalListData
  );

  useAutoSizeTextArea(popupDataRef,popupData);

  useAutoSizeTextArea(popupTitleRef,popupData);

  const handleShowPopup = (noteDetail) => {
    setPopupData(noteDetail);
    setShowPopup(true);
  }

  const handleSideBarMinimize = () => {
    setMinimize(!minimize);
  };

  const handleNewNoteOutsideClick = async (event) => {
    if (newNoteRef.current && !newNoteRef.current.contains(event.target)) {
      await createNewNormalNote();
      setNewList(false);
      setNewNormalListData(null);
      setNewNormalListTitle(null);
    }
  };

  const handlePopupOutsideClick = async (event) => {
    if(popupRef.current && !popupRef.current.contains(event.target)){
      let filterNotes = noteDetails.filter((note) => {
        if(note.noteId !== popupData.noteId){
          return true;
        }
      })
      filterNotes = [popupData].concat(filterNotes);
      await set(ref(db, "notes/" + popupData.noteId), popupData);
      setNoteDetails(filterNotes);
      setShowPopup(false);
    }
  }

  const fetchNoteDetails = async (roomId) => {
    try {
      const tasksRef = ref(db, "notes");
      const roomQuery = query(
        tasksRef,
        orderByChild("roomId"),
        equalTo(roomId)
      );

      const snapshot = await get(roomQuery);

      if (snapshot.exists()) {
        const notes = Object.values(snapshot.val());

        setNoteDetails(notes);
      }
    } catch (error) {
      console.error("Error fetching tasks. ", error);
    }
  };

  const createNewNormalNote = async () => {
    console.log("newNormalListData", newNormalListData);
    if (newNormalListTitle || newNormalListData) {
      console.log("Inside create new note");
      const newNoteId = push(ref(db, "notes")).key;
      const newNoteDetails = {
        noteId: newNoteId,
        roomId: roomId,
        noteType: newListType,
        noteTitle: newNormalListTitle,
        noteData: newNormalListData,
      };

      await set(ref(db, "notes/" + newNoteId), newNoteDetails);
      setNoteDetails((prev) => [newNoteDetails,...prev]);
    }
  };

  const handleDeleteNote = async () => {
    if(popupData){
      const popupDataVar = popupData;

      const filteredNotes = noteDetails.filter((note) => {
        if(note.noteId !== popupData.noteId){
          return true;
        }
      })
      
      setNoteDetails(filteredNotes);
      setShowPopup(false);
      setPopupData(null);

      const taskRef = ref(db, `notes/${popupDataVar.noteId}`);
      await remove(taskRef);
    }
  }

  const handleArchiveNote = async () => {
    if(popupData){
      const popupDataVar = popupData;

      const filteredNotes = noteDetails.filter((note) => {
        if(note.noteId !== popupData.noteId){
          return true;
        }
      })

      await set(ref(db, "notesArchive/" + popupData.noteId), popupData);

      setNoteDetails(filteredNotes);
      setShowPopup(false);
      setPopupData(null);

      const taskRef = ref(db, `notes/${popupDataVar.noteId}`);
      await remove(taskRef);

      setPopupData(null);
    }
  }

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out.");
    }
  };

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
                className={`p-2 flex flex-row items-center justify-start space-x-2 rounded-lg ${
                  selectedFilter === "Archive"
                    ? "text-customtextred bg-custombgred"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }  hover:cursor-pointer `}
              >
                <GoArchive className="text-xl" />
                <p className="text-sm">Archive</p>
              </div>
              <div
                className={`p-2 flex flex-row items-center justify-start space-x-2 rounded-lg ${
                  selectedFilter === "Today"
                    ? "text-customtextred bg-custombgred"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }  hover:cursor-pointer `}
              >
                <CiTrash className="text-xl" />
                <p className="text-sm">Trash</p>
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
        <div className={`w-full h-full bg-white overflow-auto`}>
          <div className="relative flex flex-row items-center space-x-4 w-7/10 h-10 mt-8 ml-auto mr-auto">
            {showPopup && <div
             ref={popupRef}
             className="absolute z-10 hover:z-20 top-40 w-full p-auto mt-4 ml-auto mr-auto transition-all ease-in-out delay-300">
              <div className="p-2 w-full bg-white rounded-lg border border-gray-400">
                <textarea
                  ref={popupTitleRef}
                  value={popupData?.noteTitle}
                  placeholder="Title"
                  rows ={1}
                  onChange={(event) => {
                    setPopupData((prevData) => ({
                      ...prevData,
                      noteTitle : event.target.value
                    }))
                  }}
                  className="ml-1 w-full h-8 resize-none font-semibold text-lg outline-none placeholder-gray-500 placeholder:font-semibold placeholder-opacity-75 placeholder-inset-0"
                />
                <textarea
                  ref={popupDataRef}
                  value={popupData?.noteData}
                  placeholder="Take a Note..."
                  rows={1}
                  onChange={(event) => {
                    setPopupData((prevData) => ({
                      ...prevData,
                      noteData : event.target.value
                    }))
                  }}
                  className="ml-1 w-full h-8 resize-none font-normal text-md text-gray-500 outline-none placeholder:font-medium placeholder-gray-500 placeholder-opacity-60 placeholder-inset-0"
                />
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row space-x-8 items-center">
                    <IoColorPaletteOutline className="ml-1 font-thin text-xl hover:cursor-pointer hover:scale-110" />
                    <MdOutlineMailOutline className="ml-1 font-thin text-xl hover:cursor-pointer hover:scale-110" />
                    <GoArchive 
                      onClick={handleArchiveNote}
                      className="ml-1 font-thin text-xl hover:cursor-pointer hover:scale-110" />
                    <CiTrash
                      onClick={handleDeleteNote}
                      className="ml-1 font-thin text-lg hover:cursor-pointer hover:scale-110" />
                  </div>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="p-2 font-medium rounded-lg hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>}
            <div
              onClick={() => navigate("/")}
              className={`p-2 rounded-md hover:bg-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-90 ${showPopup ? "blur-sm" : ""}`}
            >
              <FaChevronLeft className="text-xl font-bold hover:text-gray-900" />
            </div>
            <p className={`text-2xl font-semibold ${showPopup ? "blur-sm" : ""}`}>Notes</p>
          </div>
          <div className={`relative p-auto w-6.5/10 mt-4 ml-auto mr-auto ${showPopup ? "blur-sm" : ""}`}>
            {!newList && (
              <div className="p-2 w-full h-42 rounded-lg border border-gray-400">
                <div className="flex flex-row items-center justify-around">
                  <input
                    onClick={() => {
                      setNewList(true);
                      setNewListType("Normal");
                    }}
                    className="w-2/3 ml-2 outline-none"
                    placeholder="Take a Note..."
                  />
                  <CiSquareCheck className="text-xl hover:scale-110 hover:cursor-pointer" />
                  <BiSolidPaint className="hidden md:block text-lg hover:scale-110 hover:cursor-pointer" />
                  <FaRegImage className="hidden md:block text-lg hover:scale-110 hover:cursor-pointer" />
                </div>
              </div>
            )}
            {newList && newListType === "Normal" && (
              <div
                ref={newNoteRef}
                className="p-2 w-full h-42 rounded-lg border border-gray-400"
              >
                <textarea
                  value={newNormalListTitle || ""}
                  placeholder="Title"
                  onChange={(event) => {
                    setNewNormalListTitle(event.target.value);
                  }}
                  className="ml-1 w-full h-8 resize-none font-semibold text-sm outline-none placeholder-gray-500 placeholder:font-semibold placeholder-opacity-75 placeholder-inset-0"
                />
                <textarea
                  ref={newNoteTextAreaRef}
                  value={newNormalListData || ""}
                  placeholder="Take a Note..."
                  rows={1}
                  onChange={(event) => {
                    setNewNormalListData(event.target.value);
                  }}
                  className="ml-1 w-full h-8 resize-none font-normal text-sm text-gray-500 outline-none placeholder:font-medium placeholder-gray-500 placeholder-opacity-60 placeholder-inset-0"
                />
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row space-x-8 items-center">
                    <IoColorPaletteOutline className="ml-1 font-thin text-xl hover:cursor-pointer hover:scale-110" />
                    <CiImageOn className="ml-1 font-thin text-xl hover:cursor-pointer hover:scale-110" />
                    <GoArchive className="ml-1 font-thin text-xl hover:cursor-pointer hover:scale-110" />
                  </div>
                  <button
                    onClick={() => setNewList(false)}
                    className="p-2 font-medium rounded-lg hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className={`w-7/10 mt-8 ml-auto mr-auto ${showPopup ? "blur-sm" : ""}`}>
            <p className="ml-2 text-2xl font-semibold">Recent Notes</p>
            <div className="mt-2 max-h-1/3 grid grid-cols-1 grid-flow-row md:grid-cols-2 lg:grid-flow-row lg:grid-cols-3 gap-2">
              {noteDetails.map((noteDetail, index) => (
                <div
                  key={index}
                  className="transition-all delay-200 ease-in-out p-2 flex flex-row items-start justify-center group"
                >
                  <div
                    onClick={() => handleShowPopup(noteDetail)}
                    className="p-2 w-full h-30 max-h-60 border border-gray-500 rounded-lg overflow-auto hover:cursor-pointer hover:border-gray-700 hover:shadow-inner">
                    <input
                      readOnly={true}
                      value={noteDetail?.noteTitle || ""}
                      placeholder="Task Name"
                      className="w-full h-8 text-lg font-semibold outline-none text-gray-700"
                    />
                    <div
                      className="w-full font-normal text-md text-gray-500 outline-none"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {noteDetail?.noteData || "No description"}
                    </div>
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

export default Notes;
