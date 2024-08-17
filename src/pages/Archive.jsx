import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import {
  query,
  ref,
  get,
  orderByChild,
  equalTo,
  child,
  remove,
} from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAutoSizeTextArea from "../hooks/TextAreaHook";

import { GoArchive } from "react-icons/go";
import { CiTrash } from "react-icons/ci";
import { MdOutlineMailOutline } from "react-icons/md";
import { IoColorPaletteOutline } from "react-icons/io5";

const Archive = () => {
  const navigate = useNavigate();
  const archivePopupRef = useRef(null);
  const archviePopupDataRef = useRef(null);
  const archivePopupTitleRef = useRef(null);

  const [roomId, setRoomId] = useState();
  const [authUser, setAuthUser] = useState();
  const [showArchivePopup, setShowArchivePopup] = useState(false);
  const [archivePopupData, setArchivePopupData] = useState();
  const [archivedNotes, setArchivedNotes] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        const snapShot = await get(child(ref(db), `mapping/${user.uid}`));

        if (snapShot.exists()) {
          setRoomId(snapShot.val());
          fetchArchivedNotes(snapShot.val());
        }
      } else {
        navigate("/");
      }
    });
  }, []);

  useEffect(() => {
    if (showArchivePopup) {
      document.addEventListener("mousedown", hideArchivePopup);
    } else {
      document.removeEventListener("mousedown", hideArchivePopup);
    }

    return () => {
      document.removeEventListener("mousedown", hideArchivePopup);
    };
  }, [archivePopupRef, showArchivePopup]);

  useEffect(() => {
      if(archivePopupTitleRef.current){
        archivePopupTitleRef.current.style.height = "0px";

        const scrollHeight = archivePopupTitleRef.current.scrollHeight;

        archivePopupTitleRef.current.style.height = scrollHeight + "px";
      }
  }, [archivePopupTitleRef,showArchivePopup,archivePopupData]);

  useEffect(() => {
    if(archviePopupDataRef.current){
      archviePopupDataRef.current.style.height = "0px";

      const scrollHeight = archviePopupDataRef.current.scrollHeight;

      archviePopupDataRef.current.style.height = scrollHeight + "px";
    }
}, [archviePopupDataRef,showArchivePopup,archivePopupData]);

  const hideArchivePopup = (event) => {
    if (
      archivePopupRef.current &&
      !archivePopupRef.current.contains(event.target)
    ) {
      setShowArchivePopup(false);
      setArchivePopupData(null);
    }
  };

  const fetchArchivedNotes = async (roomId) => {
    if (roomId) {
      const tasksRef = ref(db, "notesArchive");
      const roomQuery = query(
        tasksRef,
        orderByChild("roomId"),
        equalTo(roomId)
      );

      const snapshot = await get(roomQuery);

      if (snapshot.exists()) {
        const archives = Object.values(snapshot.val());
        setArchivedNotes(archives);
      }
    }
  };

  const handleDeleteNote = async () => {
    if (archivePopupData) {
      const popupDataVar = archivePopupData;

      const filteredNotes = archivedNotes.filter((note) => {
        if (note.noteId !== archivePopupData.noteId) {
          return true;
        }
        return false;
      });

      setArchivedNotes(filteredNotes);
      setShowArchivePopup(false);
      setArchivePopupData(null);

      const taskRef = ref(db, `notesArchive/${popupDataVar.noteId}`);
      await remove(taskRef);
    }
  };

  return (
    <div className={`w-full h-full bg-white overflow-auto`}>
      <div className={`w-7/10 mt-8 ml-auto mr-auto relative`}>
        {showArchivePopup && (
          <div
            ref={archivePopupRef}
            className="absolute z-10 hover:z-20 top-40 w-full mt-4 ml-auto mr-auto bg-white rounded-lg border border-gray-400 p-4 shadow-lg"
          >
            <div className="p-2">
              <textarea
                ref={archivePopupTitleRef}
                value={archivePopupData?.noteTitle}
                placeholder="Title"
                rows={1}
                onChange={(event) => {
                  setArchivePopupData((prevData) => ({
                    ...prevData,
                    noteTitle: event.target.value,
                  }));
                }}
                readOnly={true}
                className="ml-1 w-full h-8 resize-none font-semibold text-lg outline-none placeholder-gray-500 placeholder:font-semibold placeholder-opacity-75 placeholder-inset-0"
              />
              <textarea
                ref={archviePopupDataRef}
                value={archivePopupData?.noteData}
                placeholder="Take a Note..."
                rows={3}
                onChange={(event) => {
                  setArchivePopupData((prevData) => ({
                    ...prevData,
                    noteData: event.target.value,
                  }));
                }}
                readOnly={true}
                className="ml-1 w-full h-8 resize-none font-normal text-md text-gray-500 outline-none placeholder:font-medium placeholder-gray-500 placeholder-opacity-60 placeholder-inset-0"
              />
              <div className="flex flex-row justify-between items-center mt-4">
                <div className="flex flex-row space-x-8 items-center">
                  <IoColorPaletteOutline className="ml-1 font-thin text-xl hover:cursor-pointer hover:scale-110" />
                  <MdOutlineMailOutline className="ml-1 font-thin text-xl hover:cursor-pointer hover:scale-110" />
                  <CiTrash
                    onClick={handleDeleteNote}
                    className="ml-1 font-thin text-lg hover:cursor-pointer hover:scale-110"
                  />
                </div>
                <button
                  onClick={() => setShowArchivePopup(false)}
                  className="p-2 font-medium rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <p
          className={`ml-2 text-2xl font-semibold ${
            showArchivePopup ? "blur-lg" : ""
          }`}
        >
          Archived Notes
        </p>
        <div
          className={`mt-2 max-h-1/3 grid grid-cols-1 grid-flow-row md:grid-cols-2 lg:grid-flow-row lg:grid-cols-3 gap-2 ${
            showArchivePopup ? "blur-lg" : ""
          }`}
        >
          {archivedNotes.map((noteDetail, index) => (
            <div
              key={index}
              onClick={() => {
                setShowArchivePopup(true);
                setArchivePopupData(noteDetail);
              }}
              className="transition-all delay-200 ease-in-out p-2 flex flex-row items-start justify-center group"
            >
              <div className="p-2 w-full h-30 max-h-60 border border-gray-500 rounded-lg overflow-auto hover:cursor-pointer hover:border-gray-700 hover:shadow-inner">
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
  );
};

export default Archive;
