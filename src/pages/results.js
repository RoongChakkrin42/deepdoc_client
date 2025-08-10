"use client";

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Login from "../components/loginDialog";
import axios from "axios";
import { useSelector } from "react-redux";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Result() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(undefined);
  const years = Array.from(
    new Array(currentYear - 2025 + 1),
    (val, index) => currentYear - index
  );
  const [targetData, setTargetData] = useState(null);
  const session = useSelector((state) => state.session);

  const handleChange = async (event) => {
    setYear(event.target.value);
    const res = await axios.get(
      `${
        process.env.NEXT_PUBLIC_BACKENDURL || "http://localhost:8000"
      }/resultlist`,
      {
        params: { year: event.target.value },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );
    if (res.data) {
      console.log(res.data);
      setData(res.data);
    }
  };

  const openPopUp = async (dto) => {
    setTargetData(dto);
  };

  useEffect(() => {
    if (session.access_token) {
      handleChange({ target: { value: currentYear } });
    }
  }, [session.access_token]);

  return (
    <>
      <Login />
      <Dialog
        open={targetData !== null}
        onClose={() => setTargetData(null)}
        maxWidth="lg"
        fullWidth
        sx={{ mt: 5, mb: 4 }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h5">
              {targetData?.studentData.projectName || "ไม่มีชื่อโครงการ"}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <Typography variant="h6" sx={{backgroundColor: "#e8e6e6ff", p: 1, borderRadius: 1}}>
            สรุปข้อมูลโครงการ
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Markdown remarkPlugins={[remarkGfm]}>
              {targetData?.result?.project_summary || "ไม่มีข้อมูล"}
            </Markdown>
          </Box>
          {/* <Typography sx={{ mb: 2 }} variant="body2">
            {targetData?.result?.project_summary}
          </Typography> */}
          <Typography variant="h6"  sx={{backgroundColor: "#e8e6e6ff", p: 1, borderRadius: 1}}>
            ผลการประเมิน
          </Typography>
          <Typography variant="body1">
            คะแนนตัวชี้วัดที่ 1 : {targetData?.result?.first_score}/20
          </Typography>
          <Typography sx={{ mb: 2 }} variant="body2">
            {targetData?.result?.first_reason}
          </Typography>
          <Typography variant="body1">
            คะแนนตัวชี้วัดที่ 2 : {targetData?.result?.second_score}/30
          </Typography>
          <Typography sx={{ mb: 2 }} variant="body2">
            {targetData?.result?.second_reason}
          </Typography>
          <Typography variant="body1">
            คะแนนตัวชี้วัดที่ 3 : {targetData?.result?.third_score}/25
          </Typography>
          <Typography sx={{ mb: 2 }} variant="body2">
            {targetData?.result?.third_reason}
          </Typography>
          <Typography variant="body1">
            คะแนนตัวชี้วัดที่ 4 : {targetData?.result?.fourth_score}/15
          </Typography>
          <Typography sx={{ mb: 2 }} variant="body2">
            {targetData?.result?.fourth_reason}
          </Typography>
          <Typography variant="body1">
            คะแนนตัวชี้วัดที่ 5 : {targetData?.result?.fifth_score}/10
          </Typography>
          <Typography sx={{ mb: 2 }} variant="body2">
            {targetData?.result?.fifth_reason}
          </Typography>
          <Typography variant="body1">
            คะแนนรวม : {targetData?.result?.overall_score}/100
          </Typography>
          <Typography sx={{ mb: 2 }} variant="body2">
            {targetData?.result?.overall_reason}
          </Typography>

          <Typography variant="h6"  sx={{backgroundColor: "#e8e6e6ff", p: 1, borderRadius: 1}}>
            ไฟล์ที่เกี่ยวข้อง
          </Typography>
          <a href={targetData?.url} target="_blank" rel="noopener noreferrer">
            ไฟล์โครงการ
          </a>
          {targetData?.evidence.map((evidence) => (
            <Typography key={evidence.key} variant="body2">
              <a href={evidence?.url} target="_blank" rel="noopener noreferrer">
                {evidence?.filename}
              </a>
            </Typography>
          ))}
        </DialogContent>
      </Dialog>

      <Box sx={{ maxWidth: "90%", mx: "auto", p: 3 }}>
        <Typography variant="h4" align="center">
          ผลลัพธ์
        </Typography>
        <InputLabel id="year-label">ปี</InputLabel>
        <Select
          labelId="year-label"
          value={year}
          label="Year"
          onChange={handleChange}
          sx={{ mb: 2, minWidth: 120, borderRadius: "30px"}}
        >
          {years.map((yearOption) => (
            <MenuItem key={yearOption} value={yearOption}>
              {yearOption}
            </MenuItem>
          ))}
        </Select>
        {data && (
          <TableContainer component={Paper}>
            <Table>
              {data.length != 0 ? (
                <TableHead>
                  <TableRow sx={{backgroundColor: "#b43b6b"}}>
                    <TableCell sx={{color: 'white'}}>โครงการ</TableCell>
                    <TableCell sx={{color: 'white'}}>ชื่อผู้ส่ง</TableCell>
                    <TableCell align="center" sx={{color: 'white'}}>ตัวชี้วัดที่ 1</TableCell>
                    <TableCell align="center" sx={{color: 'white'}}>ตัวชี้วัดที่ 2</TableCell>
                    <TableCell align="center" sx={{color: 'white'}}>ตัวชี้วัดที่ 3</TableCell>
                    <TableCell align="center" sx={{color: 'white'}}>ตัวชี้วัดที่ 4</TableCell>
                    <TableCell align="center" sx={{color: 'white'}}>ตัวชี้วัดที่ 5</TableCell>
                    <TableCell align="center" sx={{color: 'white'}}>คะแนนรวม</TableCell>
                  </TableRow>
                </TableHead>
              ) : null}

              <TableBody>
                {data.map((dto) => (
                  <TableRow
                    onClick={() => openPopUp(dto)}
                    sx={{ cursor: "pointer" }}
                    key={dto.uploadedAt}
                  >
                    <TableCell align="left">
                      {dto.studentData.projectName || "ไม่มีชื่อโครงการ"}
                    </TableCell>
                    <TableCell align="left">{dto.studentData.name}</TableCell>
                    <TableCell align="center">
                      {dto.result.first_score}
                    </TableCell>
                    {/* <TableCell align="left">{dto.result.first_reason}</TableCell> */}
                    <TableCell align="center">
                      {dto.result.second_score}
                    </TableCell>
                    {/* <TableCell align="left">{dto.result.second_reason}</TableCell> */}
                    <TableCell align="center">
                      {dto.result.third_score}
                    </TableCell>
                    {/* <TableCell align="left">{dto.result.third_reason}</TableCell> */}
                    <TableCell align="center">
                      {dto.result.fourth_score}
                    </TableCell>
                    {/* <TableCell align="left">{dto.result.fourth_reason}</TableCell> */}
                    <TableCell align="center">
                      {dto.result.fifth_score}
                    </TableCell>
                    {/* <TableCell align="left">{dto.result.fifth_reason}</TableCell> */}
                    <TableCell align="center">
                      {dto.result.overall_score}
                    </TableCell>
                    {/* <TableCell align="left">{dto.result.overall_reason}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
}
