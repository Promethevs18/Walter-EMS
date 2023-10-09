import React, { useEffect, useState } from "react";
import {
  getDatabase,
  onValue,
  ref,
  remove,
  orderByChild,
  update,
  set,
} from "firebase/database";
import { toast } from "react-toastify";
import FontAwesome from "react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";
import { Box } from "@mui/material";

const Employees = ({ user }) => {
  const navigate = useNavigate();
  //mga instances for database reference
  const db = getDatabase();
  const [employeesList, setEmployeesList] = useState([]);
  const [dateNow, setDateNow] = useState([]);
  const [query, setQuery] = useState("");
  const [agencies, setAgencyList] = useState([]);
  const [archives, setArchives] = useState([]);

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

  //date updater
  const updateDate = () => {
    const currentDate = new Date()
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    setDateNow(currentDate);
  };
  useEffect(() => {
    updateDate();
    const intervalId = setInterval(updateDate, 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  //eto ang kukuha ng details mula sa database (auto queuing lang)
  const handleEnter = (selected) => {
    setQuery(selected);
    let employees = [];
    const getList = onValue(
      ref(db, "Employee Lists/" + selected),
      (snapshot) => {
        snapshot.forEach((element) => {
          employees.push({ id: element.key, ...element.val() });
        });
        setEmployeesList(employees);
      },
      (error) => {
        toast.error(error);
      }
    );
    const ahensya = [];
    const getArchive = onValue(
      ref(db, "Archived Data/" + "Employees" + "/" + selected),
      (snapshot) => {
        snapshot.forEach((element) => {
          ahensya.push({ id: element.key, ...element.val() });
        });
        setArchives(ahensya);
      },
      (error) => {
        toast.error(error);
      }
    );
    return () => {
      // Cleanup function to detach the listener
      getList();
      getArchive();
    };
  };

  //this is for the sorting bullshit
  function handleClick(event) {
    const td = event.target;
    const columnName = td.getAttribute("data-column-name");

    // Query the database for the data, ordered by the clicked column name
    const sortQuery = query(
      ref(db, "Employee Lists"),
      orderByChild(columnName)
    );

    onValue(
      sortQuery,
      (snapshot) => {
        let sorted = [];
        snapshot.forEach((element) => {
          sorted.push({ id: element.key, ...element.val() });
        });
        setEmployeesList([...sorted]); // Set the state to a new array with the sorted data
        console.log(sorted);
      },
      (error) => {
        toast.error(error);
      }
    );
  }

  const handleArchive = (agency, number) => {
    if (
      window.confirm("Are your sure you want to archive the employee's record?")
    ) {
      const beginArchive = onValue(
        ref(db, "Employee Lists/" + agency + "/" + number),
        (snapshoot) => {
          const data = snapshoot.val();
          update(
            ref(
              db,
              "Archived Data/" + "Employees/" + "/" + agency + "/" + number
            ),
            data
          )
            .then(() => {
              remove(ref(db, "Employee Lists/" + agency + "/" + number)).then(
                () => {
                  toast.success("Data has been archived");
                }
              );
            })
            .catch((error) => {
              toast.error("Error occured: " + error);
            });
        }
      );
      return () => {
        beginArchive();
      };
    }
    navigate("/");
  };

  //eto naman yung magseset ng leave;
  const handleLeave = async (ag, id) => {
    if (
      window.confirm(
        "Are you sure you want to begin the leave for this employee?"
      )
    ) {
      try {
        await update(ref(db, "Employee Lists/" + ag + "/" + id, id), {
          status: "Inactive",
        });
        toast.success("Employee Leave has been set");
      } catch (error) {
        toast.error(error);
      }
      navigate("/");
    }
  };

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

  //RECOVERY SHIT
  const handleRecovery = (opis, numero) => {
    onValue(
      ref(db, "Archived Data/Employees/" + opis + "/" + numero),
      (snapshoot) => {
        const data = snapshoot.val();
        update(ref(db, "Employee Lists/" + opis + "/" + numero), data)
          .then(() => {
            remove(
              ref(db, "Archived Data/Employees/" + opis + "/" + numero)
            ).then(() => {
              toast.success("Data has been recovered");
            });
          })
          .catch((error) => {
            toast.error("Error occured: " + error);
          });
      }
    );
    navigate("/");
  };

  //the HTML part ng ating system
  return (
    <div className="pandagdag">
      <div className="col-12 text-center">
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
                marginBottom: "40px",
              }}
              onClick={handleToggle}
            >
              Agency selected: {query}
            </Button>
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              placement="bottom-start"
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom-start" ? "left top" : "left bottom",
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
                          <MenuItem
                            onClick={() => handleEnter(item.agency)}
                            key={item.id}
                          >
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
      <div className="employees">
        <div className="board">
          <table width="100%">
            <thead>
              <tr>
                <td onClick={handleClick} data-column-name="employeeNumber">
                  Name
                </td>
                <td onClick={handleClick} data-column-name="job">
                  Position
                </td>
                <td onClick={handleClick} data-column-name="status">
                  Status
                </td>
                <td onClick={handleClick} data-column-name="startDate">
                  Start Date
                </td>
                <td>Function</td>
              </tr>
            </thead>
            {employeesList?.map((item) => (
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
                    <p>{item.agency}</p>
                  </td>
                  <td className="active">
                    <p>{item.status}</p>
                  </td>
                  <td className="role">
                    <p>{item.startDate}</p>
                  </td>
                  {"Nf2Nwq2svgdWOYOzBBLtkEMqvPH3" === user?.uid && (
                    <td className="edit">
                      <FontAwesome
                        name="fas fa-archive"
                        style={{
                          margin: "15px",
                          cursor: "pointer",
                          color: "red",
                        }}
                        size="2x"
                        onClick={() =>
                          handleArchive(item.agency, item.employeeNumber)
                        }
                      />
                      <Link to={`update/${item.agency}/${item.id}`}>
                        <FontAwesome
                          name="fas fa-edit"
                          style={{ cursor: "pointer" }}
                          size="2x"
                        />
                      </Link>
                      {item.startDate === dateNow && (
                        <FontAwesome
                          name="calendar-times-o"
                          style={{ margin: "15px", cursor: "pointer" }}
                          size="2x"
                          onClick={() => handleLeave(item.agency, item.id)}
                        />
                      )}
                    </td>
                  )}
                  {"pWiVotovhaei4YpmGFsP3aLf1sE3" === user?.uid && (
                    <td>
                      <p className="prohibited">
                        Supervisor cannot modify data
                      </p>
                    </td>
                  )}
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      </div>
      <div className="employees" style={{ marginTop: "20px" }}>
        <div className="board">
          <Box
            display="flex"
            justifyContent="center"
            fontFamily="Times New Roman"
          >
            Archived Employee
          </Box>
          <table width="100%">
            <thead>
              <tr>
                <td onClick={handleClick} data-column-name="employeeNumber">
                  Name
                </td>
                <td onClick={handleClick} data-column-name="job">
                  Position
                </td>
                <td onClick={handleClick} data-column-name="status">
                  Status
                </td>
                <td onClick={handleClick} data-column-name="startDate">
                  Start Date
                </td>
                <td>Function</td>
              </tr>
            </thead>
            {archives?.map((items) => (
              <tbody key={items.id}>
                <tr>
                  <td className="people">
                    <img src={items.imageUrl} alt={items.employeeName}></img>
                    <div className="people-de">
                      <h5>{items.employeeName}</h5>
                      <p>{items.employeeNumber}</p>
                    </div>
                  </td>
                  <td className="people-des">
                    <h5>{items.job}</h5>
                    <p>{items.agency}</p>
                  </td>
                  <td className="active">
                    <p>{items.status}</p>
                  </td>
                  <td className="role">
                    <p>{items.startDate}</p>
                  </td>
                  {"Nf2Nwq2svgdWOYOzBBLtkEMqvPH3" === user?.uid && (
                    <td className="edit">
                      <FontAwesome
                        name="fas fa-download"
                        style={{
                          margin: "15px",
                          cursor: "pointer",
                          color: "green",
                        }}
                        size="2x"
                        onClick={() => handleRecovery(items.agency, items.id)}
                      />
                    </td>
                  )}

                  {"pWiVotovhaei4YpmGFsP3aLf1sE3" === user?.uid && (
                    <td>
                      <p className="prohibited">
                        Supervisor cannot modify data
                      </p>
                    </td>
                  )}
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;
