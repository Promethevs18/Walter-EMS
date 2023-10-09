import React, { useState, useEffect } from "react";
import {
  getDownloadURL,
  ref as ref_storage,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../firebase";
import { toast } from "react-toastify";
import {
  get,
  getDatabase,
  onValue,
  ref as ref_database,
  update,
} from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const initialState = {
  employeeName: "",
  employeeNumber: "",
  startDate: "",
  job: "",
  status: "",
};

const AddEmployees = () => {
  //mga basic declarations
  const { query, id } = useParams();
  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(
    "https://www.clipartkey.com/mpngs/m/152-1520367_user-profile-default-image-png-clipart-png-download.png"
  );
  const [progress, setProgress] = useState(null);
  const navigate = useNavigate();
  const db = getDatabase();
  var date = new Date();

  const [agency, setAgency] = useState("");
  const [mga_ahensya, setListahan] = useState([]);

  //forms declaration na magrereceive ng data from the html form
  const { employeeName, employeeNumber, startDate, job, status } = form;

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

  //THIS IS FOR UPLOADING THE IMAGE PAPUNTA SA FIREBASE STORAGE AT KUKUNIN ANG IMAGE URL
  useEffect(() => {
    const uploadFile = () => {
      toast.info("File Uploading...");
      const storageRef = ref_storage(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          switch (snapshot.state) {
            case "paused":
              toast.info("Upload is paused");
              break;
            case "finished":
              toast.info("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          window.alert(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            toast.info("Image upload to firebase successfully");
            setForm((prev) => ({ ...prev, imageUrl: downloadUrl }));
            setImage(downloadUrl);
          });
        }
      );
    };

    file && uploadFile();
  }, [file]);

  //eto ang respondsible para kunin ang unique id sa Database ng employee
  useEffect(() => {
    //Eto ang responsible para kunin ang details ng pinindot nating employee
    const getEmployee = async () => {
      const docRef = ref_database(db, `Employee Lists/` + query + "/" + id, id);
      const snapshot = await get(docRef);
      if (snapshot.exists()) {
        setForm({ ...snapshot.val() });
        setImage(snapshot.val().imageUrl);
      }
    };
    id && getEmployee();
  }, [id, db, query]);

  //KAPAG MAY PAGBABAGO SA FORM, SYA BAHALA
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    //ETO ANG PAGLIST NG AHENSYA
  };
  //Eto yung para sa active-inactive status ng employee
  const handleStatus = (e) => {
    setForm({ ...form, status: e.target.value });
  };

  //KAPAG PIPINDUTIN NA NG USER ANG SUBMIT BUTTON, ISASAVE NYA ANG DATA PAPUNTA SA FIREBASE DATABASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (employeeName && employeeNumber && agency && startDate && job !== null) {
      try {
        await update(
          ref_database(db, "Employee Lists/" + agency + "/" + employeeNumber),
          {
            ...form,
            date:
              date.toLocaleString("default", { month: "long" }) +
              ", " +
              date.getDate() +
              ", " +
              date.getFullYear(),
            agency: agency,
          }
        );
        await update(ref_database(db, "Agencies/" + agency), {
          agency,
        });
        toast.success("Data has been uploaded in the database");
      } catch (error) {
        toast.error(error);
      }
    }
    navigate("/");
  };

  //the HTML part ng ating software
  return (
    <div className="addemployee">
      <span>
        <img className="profile" src={image} alt={employeeName} />
        <p className="profileTitle" alt={employeeName}>
          Profile image preview
        </p>
      </span>
      <div className="container-fluid mb-4">
        <div className="container">
          <div className="col-100">
            <div className="heading py-2 ml-2">
              {id ? "Update Employee Details" : "Add Employee"}
            </div>
            <div className="row h-100 justify-content-start align-items-center">
              <div className="col-10 col-md-8 col-lg-10 px-5">
                <form className="row blog-form" onSubmit={handleSubmit}>
                  <div className="col-12 py-3">
                    <input
                      type="text"
                      className="form-control input-text-box"
                      placeholder="Employee Name (FirstName, MI. LastName)"
                      name="employeeName"
                      value={employeeName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12 py-3">
                    <input
                      type="text"
                      className="form-control input-text-box"
                      placeholder="Employee Number"
                      name="employeeNumber"
                      value={employeeNumber}
                      onChange={handleChange}
                      disabled={id ? "Update Employee Details" : null}
                    />
                  </div>
                  <div className="col-12 py-3">
                    <input
                      type="text"
                      className="form-control input-text-box"
                      placeholder="Job Position"
                      name="job"
                      value={job}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 py-3">
                    <input
                      type="text"
                      className="form-control input-text-box"
                      placeholder="Start Date "
                      name="startDate"
                      value={startDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12 py-3">
                    <Button
                      id="basic-button"
                      aria-controls={open ? "basic-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                      onClick={handleButtonClick}
                      variant="contained"
                      sx={{ color: "white" }}
                    >
                      User's agency is : {agency}
                    </Button>
                    <Menu
                      id="basic-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{
                        "aria-labelledby": "basic-button",
                      }}
                    >
                      {mga_ahensya.map?.((items) => (
                        <MenuItem onClick={() => handleClose(items.agency)}>
                          {items.agency}
                        </MenuItem>
                      ))}
                    </Menu>
                  </div>
                  <div className="mb-3">
                    <p className="category">Upload a profile picture</p>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>
                  <div className="col-12 py-3">
                    <p className="category">Employee Status</p>

                    <div className="form-check-inline mx-2">
                      <input
                        type="radio"
                        className="form-check-input"
                        value="Active"
                        name="radioOption"
                        checked={status === "Active"}
                        onChange={handleStatus}
                      />
                      <label htmlFor="radioOption" className="form-check-label">
                        &nbsp;Active &nbsp;
                      </label>
                      <input
                        type="radio"
                        className="form-check-input"
                        value="Inactive"
                        name="radioOption"
                        checked={status === "Inactive"}
                        onChange={handleStatus}
                      />
                      <label htmlFor="radioOption" className="form-check-label">
                        &nbsp;Inactive
                      </label>
                    </div>
                  </div>
                  <div className="col-12 py-3 text-center">
                    <button
                      className="btn btn-add"
                      type="submit"
                      disabled={progress !== null && progress < 100}
                    >
                      {id ? "Update Information" : "Add Employee"}
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

export default AddEmployees;
