"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
  AppBar,
  Toolbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";

// type Result = {
//   file_name: string;
//   first_score: number;
//   first_reson: string;
//   second_score: number;
//   second_reson: string;
//   third_score: number;
//   third_reson: string;
//   fourth_score: number;
//   fourth_reson: string;
//   fifth_score: number;
//   fifth_reson: string;
//   overall_score: number;
//   overall_reason: string;
//   project_summary: string;
//   access_token: string;
// };

export default function PDFAnalyzer() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8000/login", {
        username,
        password,
      });
      if (response) {
        setSession(response.data.access_token);
        setUsername("");
        setPassword("");
      } else {
        alert("invalid username or password");
      }
      setSession(response.data.access_token);
      setUsername("");
      setPassword("");
    } catch (error) {
      alert("invalid username or password");
    }
  };

  const handleLogout = async () => {
    try {
      setSession("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:8000/register", {
        username: registerUsername,
        password: registerPassword,
      });
      if (res.data == 201) {
        setRegisterOpen(false);
        setRegisterUsername("");
        setRegisterPassword("");
      } else {
        alert("Register failed.");
      }
    } catch (err) {
      console.error("Register failed:", err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setResult({});
      setFiles(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await axios.post("http://localhost:8000/analyze", formData, {
        headers: {
          Authorization: `Bearer ${session}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const data = res.data;
      setResult(data);
      setSession(data.access_token)
    } catch (error) {
      console.error("Axios error:", error);
      alert(error?.response?.data?.message || "Failed to analyze.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            DeepDoc
          </Typography>
          <Box component="form" sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Username"
              size="small"
              variant="outlined"
              value={username}
              disabled={session != ""}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              size="small"
              variant="outlined"
              value={password}
              disabled={session != ""}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={username == "" || password == ""}
            >
              Login
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleLogout}
              disabled={session == ""}
            >
              Logout
            </Button>
            {/* <Button
              variant="outlined"
              color="secondary"
              onClick={() => setRegisterOpen(true)}
            >
              Register
            </Button> */}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Register Dialog */}
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)}>
        <DialogTitle>Register</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Username"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRegisterOpen(false);
              setRegisterUsername("");
              setRegisterPassword("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRegister}
            disabled={registerUsername == "" || registerPassword == ""}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mx: "auto", mt: 4, p: 2 }}>
        <Typography variant="h2" gutterBottom>
          PDF Project Analyzer
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button variant="outlined" component="label">
            Upload PDFs
            <input
              type="file"
              hidden
              accept=".pdf"
              multiple
              onChange={handleFileChange}
            />
          </Button>
          <Typography variant="body1">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : "No files selected"}
          </Typography>
          <Button
          variant="contained"
          onClick={handleAnalyze}
          // disabled={files.length === 0 || loading || session == ""}
        >
          {loading ? <CircularProgress size={24} /> : "Analyze"}
        </Button>
        </Stack>
        {result.file_name ? (
          <>
            <Box>
              <Typography variant="h4" gutterBottom>
                Project Summary
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                {result.project_summary}
              </Typography>
            </Box>
          </>
        ) : null}
        {result.file_name ? (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Analysis Results: {result.file_name}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell align="left">First Dimension</TableCell>
                    <TableCell align="center">{result.first_score}</TableCell>
                    <TableCell align="left">{result.first_reson}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Second Dimension</TableCell>
                    <TableCell align="center">{result.second_score}</TableCell>
                    <TableCell align="left">{result.second_reson}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Third Dimension</TableCell>
                    <TableCell align="center">{result.third_score}</TableCell>
                    <TableCell align="left">{result.third_reson}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Fourth Dimension</TableCell>
                    <TableCell align="center">{result.fourth_score}</TableCell>
                    <TableCell align="left">{result.fourth_reson}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Fifth Dimension</TableCell>
                    <TableCell align="center">{result.fifth_score}</TableCell>
                    <TableCell align="left">{result.fifth_reson}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Over All</TableCell>
                    <TableCell align="center">{result.overall_score}</TableCell>
                    <TableCell align="left">{result.overall_reason}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
