import { FaFlag } from "react-icons/fa";

const PriorityPicker = ({priority,setPriority,setShowPriority}) => {
  const priorities = [
    { name: "Priority 1", color: "text-red-500" },
    { name: "Priority 2", color: "text-orange-500" },
    { name: "Priority 3", color: "text-indigo-500" },
    { name: "Priority 4", color: "text-gray-500" },
  ];

  return (
    <div className="p-2 flex flex-col bg-white rounded-md shadow-md hover:cursor-pointer">
      {priorities.map((priority, index) => 
        <div
          key={index}
          onClick={(event) => {
            setPriority(() => {
              let priority = event.target.innerText;
              let str = priority[0] + priority[9];

              return str;
            });
            setShowPriority(false);
          }}
          className="p-2 w-full text-sm flex flex-row items-center justify-center rounded-md space-x-2 hover:bg-gray-200">
          <FaFlag className={priority.color} />
          <p>{priority.name}</p>
        </div>
      )}
    </div>
  );
}

export default PriorityPicker;
