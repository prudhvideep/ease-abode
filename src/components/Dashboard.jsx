
const Dashboard = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="flex-none w-8/10 md:w-7/10 lg:w-5/10 h-8/10 grid grid-row-auto md:grid-rows-3 md:grid-flow-col gap-4 md:gap-6">
        <div className="bg-white p-6 shadow-modern-lg hover:shadow-modern-xl rounded-xl">
          <p className="font-semibold font-sans text-xl">Roomates</p>
        </div>
        <div className="bg-white p-6 shadow-modern-lg hover:shadow-modern-xl rounded-xl md:row-span-2">
          <p className="font-semibold font-sans text-xl">Expenses</p>
        </div>
        <div className="bg-white p-6 shadow-modern-lg hover:shadow-modern-xl rounded-xl md:row-span-3">
          <p className="font-semibold font-sans text-xl">Task Board</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
