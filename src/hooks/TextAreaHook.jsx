import { useEffect } from "react";

const useAutoSizeTextArea = (
  newNoteTextAreaRef,
  newNormalListData
) => {
  useEffect(() => {
    if(newNoteTextAreaRef.current){
      newNoteTextAreaRef.current.style.height = "0px";
      const scrollHeight = newNoteTextAreaRef.current.scrollHeight;

      newNoteTextAreaRef.current.style.height = scrollHeight + "px";
    }

  },[newNoteTextAreaRef,newNormalListData])
};


export default useAutoSizeTextArea;