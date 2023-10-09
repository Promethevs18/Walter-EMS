import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";
import { getDatabase, onValue, ref } from "firebase/database";
import { toast } from "react-toastify";
import { DatePicker } from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AttendanceList = ({ user }) => {
  const db = getDatabase();
  const [presentList, setPresentList] = useState([]);
  const [dateRange, setDates] = useState([]);
  const [query, setQuery] = useState("");
  const { RangePicker } = DatePicker;
  const [agencies, setAgencyList] = useState([]);

  const ranges = [];

  //for the dropdown
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  //ETO YUNG PARA SA PUTANGINANG BUTTON PER AGENCY
  useEffect(() => {
    const fetchData = () => {
      const ahensya = [];
      const getList = onValue(
        ref(db, "Agencies"),
        (snapshot) => {
          snapshot.forEach((element) => {
            ahensya.push({ id: element.key, ...element.val() });
          });
          setAgencyList(ahensya);
        },
        (error) => {
          toast.error(error);
        }
      );
      return () => {
        // Cleanup function to detach the listener
        getList();
      };
    };

    fetchData();
  }, []);

  //THIS CODE IS RESPONSIBLE TO GET THE RANGES BETWEEN TWO DATES
  function getDatesInRange(startDate, endDate) {
    const date = new Date(startDate);

    const dates = [];

    while (date <= endDate) {
      dates.push(new Date(date).toDateString());
      date.setDate(date.getDate() + 1);
    }
    for (let index = 0; index < dates.length; index++) {
      ranges.push(dates[index]);
    }
  }

  //queueing all by date
  const changeAgency = (select) => {
    setQuery(select);
    const d1 = new Date(dateRange[0]);
    const d2 = new Date(dateRange[1]);

    getDatesInRange(d1, d2);
    let present = [];
    ranges.map((key) => {
      const getPresent = onValue(
        ref(db, "Daily Attendance/" + key + "/" + select),
        (snapshot) => {
          snapshot.forEach((element) => {
            present.push({
              id: element.key,
              ...element.val(),
            });
          });
          setPresentList(present);
        },
        (error) => {
          toast.error(error);
        }
      );
      return () => {
        getPresent();
      };
    });
  };

  //date change tracker
  const dateChange = (values) => {
    setDates(
      values.map((item) => {
        return new Date(item).toDateString();
      })
    );
  };
  const reset = () => {
    setQuery("");
    setPresentList([]);
  };

  //ETO ANG RESPONSIBLE FOR EXPORTING TO PDF
  const exportPDF = () => {
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const title = "Attendance from: " + dateRange[0] + " - " + dateRange[1];
    const headers = [
      [
        "EMPLOYEE NUMBER",
        "EMPLOYEE NAME",
        "AGENCY",
        "JOB",
        "TIME IN",
        "TIME OUT",
        "ATTENDANCE DATE",
      ],
    ];

    const data = presentList.map((present) => [
      present.employeeNumber,
      present.employeeName,
      present.department,
      present.job,
      present.timeIn,
      present.timeOut,
      present.dateToday,
    ]);

    let content = {
      startY: 50,
      head: headers,
      body: data,
    };

    doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    doc.save("Attendance from: " + dateRange[0] + " - " + dateRange[1]);
  };

  return (
    <div className="attendance">
      <div className="container">
        <div className="col-12 text-center">
          <span
            className="col-12 px=4 text-center"
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "50px",
            }}
          >
            <h5 style={{ marginRight: "40px" }}>Select a date range: </h5>
            <RangePicker onChange={dateChange} />
          </span>
          <Stack display="flex" spacing={2}>
            <div>
              <Button
                className="btn btn-add"
                ref={anchorRef}
                id="composition-button"
                aria-controls={open ? "composition-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                style={{
                  marginTop: "50px",
                }}
                onClick={handleToggle}
              >
                Agency selected: {query}
              </Button>
              <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="top-start"
                transition
                disablePortal
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === "bottom-start"
                          ? "left top"
                          : "left bottom",
                    }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList
                          autoFocusItem={open}
                          id="composition-menu"
                          aria-labelledby="composition-button"
                          onKeyDown={handleListKeyDown}
                        >
                          {agencies?.map((item) => (
                            <MenuItem onClick={() => changeAgency(item.agency)}>
                              {item.agency}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </div>
          </Stack>
        </div>

        <div className="board">
          <table width="100%">
            <thead>
              <tr>
                <td>Name</td>
                <td>Title</td>
                <td>Time In</td>
                <td>Time Out</td>
                <td>Attendance Date</td>
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
                  <td className="active">
                    <p>{item.dateToday}</p>
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
        <div className="col-12 py-3 text-center">
          {user?.uid != null && (
            <button className="btn btn-add" onClick={exportPDF}>
              Export to PDF
            </button>
          )}
          {user?.uid != null && (
            <button
              className="btn btn-add"
              onClick={reset}
              style={{ margin: "10px" }}
            >
              Reset Table Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;
