import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  get,
  getDatabase,
  onValue,
  ref as ref_database,
  update,
} from "firebase/database";
import { useNavigate } from "react-router-dom";
import FontAwesome from "react-fontawesome";
import { DatePicker } from "antd";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Box } from "@mui/material";

import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";

import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";

const { RangePicker } = DatePicker;

const initialState = {
  employeeName: "",
  employeeNumber: "",
  salary: "",
  job: "",
  startDate: "",
};

const Leave = () => {
  const [form, setForm] = useState(initialState);
  const db = getDatabase();

  const [dates, setDates] = useState([]);

  const navigate = useNavigate();
  const [image, setImage] = useState(
    "https://www.clipartkey.com/mpngs/m/152-1520367_user-profile-default-image-png-clipart-png-download.png"
  );

  const [agency, setAgency] = useState("");
  const [mga_ahensya, setListahan] = useState([]);
  const [leave, setLeave] = useState("");
  const [mga_leave, listahanLeave] = useState([]);

  const { employeeName, employeeNumber, startDate, job } = form;

  //For Agency Dropdown
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (somting) => {
    setAgency(somting);
    setAnchorEl(null);
  };
  const handleLeave = (some) => {
    setLeave(some);
    console.log(leave);
  };

  //Agency query
  useEffect(() => {
    const fetchData = () => {
      const ahensya = [];
      const getList = onValue(
        ref_database(db, "Agencies"),
        (snapshot) => {
          snapshot.forEach((element) => {
            ahensya.push({ id: element.key, ...element.val() });
          });
          setListahan(ahensya);
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
  //Leave Query
  useEffect(() => {
    const fetchLeaves = () => {
      const alisan = [];
      const getList = onValue(
        ref_database(db, "Leaves"),
        (snapshot) => {
          snapshot.forEach((element) => {
            alisan.push({ id: element.key, ...element.val() });
          });
          listahanLeave(alisan);
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
    fetchLeaves();
  }, []);
  //changing status
  const handleStatus = (e) => {
    setForm({ ...form, status: e.target.value });
  };
  //THIS METHOD IS RESPONSIBLE PARA MA-TRACK ANG CHANGES SA INPUT NI USER SA FORM
  const handleChange = (e) => {
    e.preventDefault();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //THIS IS FOR THE DATES

  const changeDate = (values) => {
    setDates(
      values.map((item) => {
        return item.format("MM-DD-YYYY");
      })
    );
  };

  //ETO ANG CODE PARA PAG PININDOT SI BUTTON, MAPAPASOK SA DATABASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (employeeNumber !== null) {
      try {
        await update(
          ref_database(
            db,
            "Employee Lists/" + agency + "/" + employeeNumber,
            employeeNumber
          ),
          {
            ...form,
            startDate: dates[0],
            endDate: dates[1],
            leave_reason: leave,
          }
        );
        toast.success("Employee Leave has been posted");
      } catch (error) {
        toast.error(error);
      }
    }
    navigate("/");
  };

  //ETO ANG RESPONSIBLE PARA MAG SERACH NG ID SA DATABASE PAG PININDOT SI SEARCH BUTTON
  const handleSearch = async (employeeNumber) => {
    const emp = ref_database(
      db,
      "Employee Lists/" + agency + "/" + employeeNumber,
      employeeNumber
    );
    const snap = await get(emp);
    if (snap.exists()) {
      setForm({ ...snap.val() });
    } else {
      toast.info("Employee number does not exists");
    }
    setImage(snap.val().imageUrl);
  };

  //RESPONSIBLE FOR LEAVE PURPOSES
  const [opener, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleCloser = (event) => {
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
  const prevOpen = React.useRef(opener);
  React.useEffect(() => {
    if (prevOpen.current === true && opener === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = opener;
  }, [opener]);

  const handleLeaving = (aalis) => {
    setLeave(aalis);
  };

  //END OF LEAVE PURPOSES

  return (
    <div className="leave">
      <span>
        <img className="profile" src={image} alt="profile" />
        <p className="profileTitle">Profile image preview</p>
      </span>
      <div className="container-fluid mb-4">
        <div className="container">
          <div className="col-100">
            <div className="heading py-2 ml-2">Set Leave for Employee</div>
            <div className="row h-100 justify-content-start align-items-center">
              <div className="col-10 col-md-8 col-lg-10 px-5">
                <form className="row blog-form" onSubmit={handleSubmit}>
                  <div className="col-12 py-3">
                    {agency !== "" ? (
                      <Button
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleButtonClick}
                        variant="contained"
                        sx={{ color: "white" }}
                      >
                        Agency selected is : {agency}
                      </Button>
                    ) : (
                      <Button
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleButtonClick}
                        variant="contained"
                        sx={{ color: "white" }}
                      >
                        Select an Agency
                      </Button>
                    )}
                    <Menu
                      id="basic-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{
                        "aria-labelledby": "basic-button",
                      }}
                    >
                      {mga_ahensya?.map((items) => (
                        <MenuItem
                          onClick={() => handleClose(items.agency)}
                          key={items.id}
                        >
                          {items.agency}
                        </MenuItem>
                      ))}
                    </Menu>
                  </div>
                  <div className="Search">
                    <input
                      type="text"
                      className="form-control input-text-box"
                      placeholder="Search Employee Number"
                      name="employeeNumber"
                      value={employeeNumber}
                      onChange={handleChange}
                    />

                    <FontAwesome
                      name="search"
                      style={{ marginLeft: "5px", cursor: "pointer" }}
                      size="2x"
                      onClick={() => handleSearch(employeeNumber)}
                    />
                  </div>

                  <div className="col-12 py-3">
                    <input
                      type="text"
                      className="form-control input-text-box"
                      placeholder="Employee name will appear here"
                      name="employeeName"
                      value={employeeName}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="col-12 py-3">
                    <input
                      type="text"
                      className="form-control input-text-box"
                      placeholder="Job Title will appear here"
                      name="job"
                      value={job}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="col-12 py-3">
                    <input
                      type="text"
                      className="form-control input-text-box"
                      placeholder="Starting date will appear here"
                      name="startDate"
                      value={startDate}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-check-inline mx-2">
                    <Stack direction="row" spacing={2}>
                      <div>
                        <Button
                          ref={anchorRef}
                          id="composition-button"
                          aria-controls={
                            opener ? "composition-menu" : undefined
                          }
                          aria-expanded={opener ? "true" : undefined}
                          aria-haspopup="true"
                          onClick={handleToggle}
                          variant="contained"
                        >
                          Leave reason is: {leave}
                        </Button>
                        <Popper
                          open={opener}
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
                                  placement === "bottom-start"
                                    ? "left top"
                                    : "left bottom",
                              }}
                            >
                              <Paper>
                                <ClickAwayListener onClickAway={handleCloser}>
                                  <MenuList
                                    autoFocusItem={opener}
                                    id="composition-menu"
                                    aria-labelledby="composition-button"
                                    onKeyDown={handleListKeyDown}
                                  >
                                    {mga_leave?.map((bagay) => (
                                      <MenuItem
                                        onClick={() =>
                                          handleLeaving(bagay.leave)
                                        }
                                      >
                                        {bagay.leave}
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
                  <div>
                    <p>Select leave date duration</p>
                    <RangePicker onChange={changeDate} />
                  </div>
                  <div className="col-12 py-3 text-center">
                    <button className="btn btn-add" type="submit">
                      Set Employee Leave
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leave;
