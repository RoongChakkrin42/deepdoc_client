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

type Result = {
  text_name: string;
  first_score: number;
  seccond_score: number;
  third_score: number;
  fourth_score: number;
  fifth_score: number;
  overall_score: number;
  overall_reason: string;
};

export default function PDFAnalyzer() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<Result[]>([]);
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
      console.log(response);
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
      console.log(error);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResults([]);
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

      const data: Result[] = res.data;
      setResults(data);
    } catch (error: any) {
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
            MyApp
          </Typography>
          <Box component="form" sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Username"
              size="small"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              size="small"
              variant="outlined"
              value={password}
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
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setRegisterOpen(true)}
            >
              Register
            </Button>
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

      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 2 }}>
        <Typography variant="h4" gutterBottom>
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
        </Stack>

        <Button
          variant="contained"
          onClick={handleAnalyze}
          disabled={files.length === 0 || loading || session == ""}
        >
          {loading ? <CircularProgress size={24} /> : "Analyze"}
        </Button>

        {results.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>First Dimension Score</TableCell>
                    <TableCell>Seccond Dimension Score</TableCell>
                    <TableCell>Third Dimension Score</TableCell>
                    <TableCell>Fourth Dimension Score</TableCell>
                    <TableCell>Fifth Dimension Score</TableCell>
                    <TableCell>Over All Score</TableCell>
                    <TableCell>Reasoning</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((res, index) => (
                    <TableRow key={index}>
                      <TableCell>{res.text_name}</TableCell>
                      <TableCell>{res.first_score}</TableCell>
                      <TableCell>{res.seccond_score}</TableCell>
                      <TableCell>{res.third_score}</TableCell>
                      <TableCell>{res.fourth_score}</TableCell>
                      <TableCell>{res.fifth_score}</TableCell>
                      <TableCell>{res.overall_score}</TableCell>
                      <TableCell>{res.overall_reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </>
  );
}
