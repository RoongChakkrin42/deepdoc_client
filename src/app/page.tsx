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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResults([])
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
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTA5MjcxNDAsImV4cCI6MTc1MDkzNDM0MH0.NX5MITtpEEOcIyIcjaVYfzrMj-dtgFiM5i10jyRULPs',
          "Content-Type": "multipart/form-data",
        },
      });

      const data: Result[] = res.data;
      console.log(data)
      setResults(data);
    } catch (error: any) {
      console.error("Axios error:", error);
      alert(error?.response?.data?.message || "Failed to analyze.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
        disabled={files.length === 0 || loading}
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
  );
}
