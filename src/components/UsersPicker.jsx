const UsersPicker = ({ userDetails, setShowUsers , setSelectedUsers }) => {
  return (
    <div className="p-2 flex flex-col bg-white rounded-md shadow-md hover:cursor-pointer">
      {userDetails.map((user, index) => (
        <div
          key={index}
          onClick={() => {
            setSelectedUsers((prev) => {
              if (!prev.some((existUser) => existUser.uid === user.uid)) {
                return [...prev, user];
              }
              return prev;
            });
            setShowUsers(false);
          }}
          className="p-2 w-full text-sm flex flex-row items-center justify-center rounded-md space-x-2 hover:bg-gray-200"
        >
          <p>{user?.username}</p>
        </div>
      ))}
    </div>
  );
};

export default UsersPicker;
