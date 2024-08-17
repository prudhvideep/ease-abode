const Transaction = ({ date, description, amount, paidBy, lentTo, lentAmount }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'short' }).toUpperCase()}\n${date.getDate()}`;
  };

  return (
    <div className="flex items-center py-2 border-b">
      <div className="w-16 text-center text-gray-500">
        {formatDate(date)}
      </div>
      <div className="flex-grow">
        <p className="font-medium">{description}</p>
      </div>
      <div className="w-32 text-right">
        {paidBy && <p>{paidBy} paid</p>}
        <p className="font-bold">${amount.toFixed(2)}</p>
      </div>
      <div className="w-32 text-right">
        {lentTo && lentAmount && (
          <p className={lentAmount > 0 ? "text-green-500" : "text-red-500"}>
            {lentAmount > 0 ? `you lent ${lentTo}` : `${lentTo} lent you`}
            <br />
            ${Math.abs(lentAmount).toFixed(2)}
          </p>
        )}
        {!lentTo && <p className="text-gray-500">not involved</p>}
      </div>
    </div>
  );
};

export default Transaction;