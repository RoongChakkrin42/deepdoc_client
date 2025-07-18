"use client";

import { Box, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useState } from "react";
import Login from "../components/loginDialog";
import axios from "axios";
import { useSelector } from "react-redux";

export default function Result() {
  const [year, setYear] = useState("");
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    new Array(currentYear - 1950 + 1),
    (val, index) => currentYear - index
  );
  const session = useSelector((state) => state.session);

  const handleChange = async (event) => {
    setYear(event.target.value);
    const res = await axios.get(
      "http://localhost:8000/resultlist",
      {
        params: { year: event.target.value },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );
    console.log(res.data);
  };
  return (
    <>
      <Login />
      <Box sx={{ maxWidth: "90%", mx: "auto", p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Results
        </Typography>
        <InputLabel id="year-label">Year</InputLabel>
        <Select
          labelId="year-label"
          value={year}
          label="Year"
          onChange={handleChange}
        >
          {years.map((yearOption) => (
            <MenuItem key={yearOption} value={yearOption}>
              {yearOption}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </>
  );
}
