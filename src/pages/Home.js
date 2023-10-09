import React, { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

function Home() {
  //eto ang mga declarations for Time and date
  let time = new Date().toLocaleTimeString();
  let date = new Date().toDateString();

  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(time);
  const [dateToday, setDate] = useState(date);
  const db = getDatabase();
  const [presentList, setPresentList] = useState([]);

  const UpdateTime = () => {
    time = new Date().toLocaleTimeString();
    setCount(time);
  };

  const UpdateDate = () => {
    date = new Date().toDateString();
    setDate(date);
  };

  setInterval(UpdateDate, 1000);
  setInterval(UpdateTime, 1000);

  //eto yung magque-queue in the background para kunin ang data sa database
  useEffect(() => {
    let present = [];
    const getPresent = onValue(
      ref(db, "Daily Attendance/" + date, date),
      (snapshot) => {
        snapshot.forEach((element) => {
          element.forEach((valuables) => {
            present.push({
              id: valuables.key,
              ...valuables.val(),
            });
          });
        });
        setPresentList(present);
        setLoading(false);
      },
      (error) => {
        toast.error(error);
      }
    );
    return () => {
      getPresent();
    };
  });

  if (loading) {
    return (
      <div className="home">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="home">
      <div className="container">
        <div>
          <h5 className="clock">{count}</h5>
          <h1 className="date">{dateToday}</h1>
          <div className="board">
            <table width="100%">
              <thead>
                <tr>
                  <td>Name</td>
                  <td>Position</td>
                  <td>Time In</td>
                  <td>Time Out</td>
                </tr>
              </thead>
              {presentList?.map((item) => (
                <tbody key={item.id}>
                  <tr>
                    <td className="people">
                      <img src={item.imageUrl} alt={item.employeeName}></img>
                      <div className="people-de">
                        <h5>{item.employeeName}</h5>
                        <p>{item.employeeNumber}</p>
                      </div>
                    </td>
                    <td className="people-des">
                      <h5>{item.job}</h5>
                      <p>{item.department}</p>
                    </td>
                    <td className="active">
                      <p>{item.timeIn}</p>
                    </td>
                    <td className="active">
                      <p>{item.timeOut}</p>
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
