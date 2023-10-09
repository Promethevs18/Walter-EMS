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
import { Box } from "@mui/system";

const initialState = {
  agencyName: "",
};

const Employees = ({ user }) => {
  const navigate = useNavigate();
  //mga instances for database reference
  const db = getDatabase();
  const [query, setQuery] = useState("");
  const [agencies, setAgencyList] = useState([]);
  const [form, setForm] = useState(initialState);

  const { agencyName } = form;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    //ETO ANG PAGLIST NG AHENSYA
  };
  //eto ang kukuha ng details mula sa database (auto queuing lang)

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

  //ARCHIVING SHIT
  const handleArchive = (bagay) => {
    const beginArchive = onValue(
      ref(db, "Employee Lists/" + bagay),
      (snapshoot) => {
        const data = snapshoot.val();
        update(ref(db, "Archived Data/Employees/" + bagay), data)
          .then(() => {
            remove(ref(db, "Employee Lists/" + bagay)).then(() => {
              toast.success("Data has been archived");
              setQuery("");
              window.location.reload();
            });
          })
          .catch((error) => {
            toast.error("Error occured: " + error);
          });
      }
    );
    return () => {
      beginArchive();
    };
  };

  //RECOVERY SHIT
  const handleRecovery = (opis) => {
    const beginArchive = onValue(
      ref(db, "Archived Data/Employees/" + opis),
      (snapshoot) => {
        const data = snapshoot.val();
        update(ref(db, "Employee Lists/" + opis), data)
          .then(() => {
            remove(ref(db, "Archived Data/Employees/" + opis)).then(() => {
              toast.success("Data has been recovered");
              setQuery("");
            });
          })
          .catch((error) => {
            toast.error("Error occured: " + error);
          });
      }
    );

    return () => {
      beginArchive();
    };
  };
  //adding agency
  const handleAddAgency = () => {
    update(ref(db, "Agencies/" + agencyName), { agency: agencyName }).then(
      () => {
        toast.success("Agency has been added");
      }
    );
  };

  const handleAgency = (balyu) => {
    setQuery(balyu);
  };

  //the HTML part ng ating system
  return (
    <div className="pandagdag">
      <div className="col-12 text-center">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "500px",
            padding: "20px",
            marginLeft: "30px",
          }}
        >
          <input
            type="text"
            className="form-control input-text-box"
            placeholder="Enter Agency you wish to add"
            name="agencyName"
            value={agencyName}
            onChange={handleChange}
          />
        </Box>
        <div
          style={{
            marginLeft: "50px",
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
          }}
        >
          <button className="btn btn-add" onClick={() => handleAddAgency()}>
            Add Agency
          </button>
        </div>
        <Box
          sx={{
            fontFamily: "BlinkMacSystemFont",
            fontStyle: "bold",
            fontSize: "40px",
          }}
        >
          Agency selected is: {query}
        </Box>

        {agencies?.map((itema) => (
          <button
            className="btn btn-add"
            onClick={() => handleAgency(itema.id)}
            style={{ margin: "15px" }}
          >
            {itema.id}
          </button>
        ))}
      </div>
      <div className="employees">
        <div className="board"></div>
      </div>
      <div className="text-center" style={{ marginTop: "10px" }}>
        <button className="btn btn-add" onClick={() => handleArchive(query)}>
          Archive Agency and Agency Records
        </button>
        <button
          className="btn btn-add"
          style={{ marginLeft: "20px" }}
          onClick={() => handleRecovery(query)}
        >
          Recover Agency Record
        </button>
      </div>
    </div>
  );
};

export default Employees;
