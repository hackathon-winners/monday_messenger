export const dateformatter = (unix_timestamp, type) => {
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date = new Date(unix_timestamp);

  const year = "" + date.getFullYear();
  let month = "0" + (date.getMonth() + 1);
  let day = "0" + date.getDate();

  const hours = "0" + date.getHours();
  const minutes = "0" + date.getMinutes();

  switch (type) {
    case "time":
      return `${hours.substr(-2)}:${minutes.substr(-2)}`;

    case "date":
      return `${day.substr(-2)}.${month.substr(-2)}.${year}`;

    default:
      return `${day.substr(-2)}.${month.substr(-2)}.${year} ${hours.substr(
        -2
      )}:${minutes.substr(-2)}`;
  }
};

export const sameDay = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
