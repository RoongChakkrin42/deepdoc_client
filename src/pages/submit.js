import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  InputLabel,
  FormHelperText,
  Stack,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import Login from "../components/loginDialog";

export default function ProjectSubmissionForm() {
  const [projectFile, setProjectFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [evidence1, setEvidence1] = useState({
    first: null,
    second: null,
    third: null,
    fourth: null,
  });
  const [evidence2, setEvidence2] = useState({
    first: null,
    second: null,
    third: null,
  });
  const [evidence3, setEvidence3] = useState({
    first: null,
  });
  const [evidence4, setEvidence4] = useState({
    first: null,
    second: null,
  });
  const [evidence5, setEvidence5] = useState({
    first: null,
    second: null,
  });

  const handleProjectChange = (e) => {
    const file = e.target.files;
    if (file && file.size > 10 * 1024 * 1024) {
      alert("each file must less than 10MB");
      return;
    }
    setProjectFile(file);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    setDone(false);
    e.preventDefault();
    const formData = new FormData();
    if (evidence1.first) {
      for (let i = 0; i < evidence1.first.length; i++) {
        formData.append("evidence11", evidence1.first[i]);
      }
    }
    if (evidence1.second) {
      for (let i = 0; i < evidence1.second.length; i++) {
        formData.append("evidence12", evidence1.second[i]);
      }
    }
    if (evidence1.third) {
      for (let i = 0; i < evidence1.third.length; i++) {
        formData.append("evidence13", evidence1.third[i]);
      }
    }
    if (evidence1.fourth) {
      for (let i = 0; i < evidence1.fourth.length; i++) {
        formData.append("evidence14", evidence1.fourth[i]);
      }
    }
    if (evidence2.first) {
      for (let i = 0; i < evidence2.first.length; i++) {
        formData.append("evidence21", evidence2.first[i]);
      }
    }
    if (evidence2.second) {
      for (let i = 0; i < evidence2.second.length; i++) {
        formData.append("evidence22", evidence2.second[i]);
      }
    }
    if (evidence2.third) {
      for (let i = 0; i < evidence2.third.length; i++) {
        formData.append("evidence23", evidence2.third[i]);
      }
    }
    if (evidence3.first) {
      for (let i = 0; i < evidence3.first.length; i++) {
        formData.append("evidence31", evidence3.first[i]);
      }
    }
    if (evidence4.first) {
      for (let i = 0; i < evidence4.first.length; i++) {
        formData.append("evidence41", evidence4.first[i]);
      }
    }
    if (evidence4.second) {
      for (let i = 0; i < evidence4.second.length; i++) {
        formData.append("evidence42", evidence4.second[i]);
      }
    }
    if (evidence5.first) {
      for (let i = 0; i < evidence5.first.length; i++) {
        formData.append("evidence51", evidence5.first[i]);
      }
    }
    if (evidence5.second) {
      for (let i = 0; i < evidence5.second.length; i++) {
        formData.append("evidence52", evidence5.second[i]);
      }
    }
    if (projectFile) {
      for (let i = 0; i < projectFile.length; i++) {
        formData.append("project", projectFile[i]);
      }
    }
    const response = await axios.post(
      "http://localhost:8000/uploadFiles",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response) {
      setLoading(false);
      setDone(true);
    }
  };

  return (
    <>
      {/* <Login /> */}
      <Box sx={{ maxWidth: "90%", mx: "auto", p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Project Submission Form
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Section 1 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                การกำกับความเสี่ยงและธรรมาภิบาลองค์กร
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Card
                    key={"first"}
                    variant="outlined"
                    sx={{
                      width: "95%",
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      การสื่อสารนโยบายการบริหารความเสี่ยงแบบบูรณาการของจุฬาลงกรณ์มหาวิทยาลัย
                    </Typography>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      required
                      onChange={(e) => {
                        const files = e.target.files;
                        for (let file in files) {
                          if (file && file.size > 10 * 1024 * 1024) {
                            alert("each file must less than 10MB");
                            return;
                          } else {
                            setEvidence1({
                              ...evidence1,
                              first: e.target.files,
                            });
                          }
                        }
                      }}
                      style={{ display: "block", marginTop: "8px" }}
                    />
                  </Card>
                  <Card
                    key={"second"}
                    variant="outlined"
                    sx={{
                      width: "95%",
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      การแต่งตั้งและสื่อสารความรับผิดชอบด้านการบริหารความเสี่ยง
                    </Typography>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      required
                      onChange={(e) => {
                        const files = e.target.files;
                        for (let file in files) {
                          if (file && file.size > 10 * 1024 * 1024) {
                            alert("each file must less than 10MB");
                            return;
                          } else {
                            setEvidence1({
                              ...evidence1,
                              second: e.target.files,
                            });
                          }
                        }
                      }}
                      style={{ display: "block", marginTop: "8px" }}
                    />
                  </Card>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Card
                    key={"third"}
                    variant="outlined"
                    sx={{
                      width: "95%",
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      การประชุมคณะกรรมการบริหารความเสี่ยง
                    </Typography>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      required
                      onChange={(e) => {
                        const files = e.target.files;
                        for (let file in files) {
                          if (file && file.size > 10 * 1024 * 1024) {
                            alert("each file must less than 10MB");
                            return;
                          } else {
                            setEvidence1({
                              ...evidence1,
                              third: e.target.files,
                            });
                          }
                        }
                      }}
                      style={{ display: "block", marginTop: "8px" }}
                    />
                  </Card>
                  <Card
                    key={"fourth"}
                    variant="outlined"
                    sx={{
                      width: "95%",
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      การฝึกอบรมด้านการบริหารความเสี่ยง
                    </Typography>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      required
                      onChange={(e) => {
                        const files = e.target.files;
                        for (let file in files) {
                          if (file && file.size > 10 * 1024 * 1024) {
                            alert("each file must less than 10MB");
                            return;
                          } else {
                            setEvidence1({
                              ...evidence1,
                              fourth: e.target.files,
                            });
                          }
                        }
                      }}
                      style={{ display: "block", marginTop: "8px" }}
                    />
                  </Card>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                การประเมินความเสี่ยงและการวางแผนบริหารความเสี่ยง
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Card
                  key={"first"}
                  variant="outlined"
                  sx={{
                    width: "100%",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    การระบุความเสี่ยงของส่วนงาน/หน่วยงานสอดคล้องกับกรอบการบริหารความเสี่ยงของมหาวิทยาลัยและมีระบบการระบุที่ชัดเจน
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    required
                    onChange={(e) => {
                      const files = e.target.files;
                      for (let file in files) {
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert("each file must less than 10MB");
                          return;
                        } else {
                          setEvidence2({ ...evidence2, first: e.target.files });
                        }
                      }
                    }}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                </Card>
                <Card
                  key={"second"}
                  variant="outlined"
                  sx={{
                    width: "100%",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    แผนบริหารความเสี่ยงของส่วนงาน/หน่วยงาน
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    required
                    onChange={(e) => {
                      const files = e.target.files;
                      for (let file in files) {
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert("each file must less than 10MB");
                          return;
                        } else {
                          setEvidence2({
                            ...evidence2,
                            second: e.target.files,
                          });
                        }
                      }
                    }}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                </Card>
                <Card
                  key={"third"}
                  variant="outlined"
                  sx={{
                    width: "100%",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    การถ่ายทอดแผนบริหารความเสี่ยงไปยังส่วนงาน/หน่วยงานย่อยหรือผู้รับผิดชอบในระดับปฏิบัติอย่างไร
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    required
                    onChange={(e) => {
                      const files = e.target.files;
                      for (let file in files) {
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert("each file must less than 10MB");
                          return;
                        } else {
                          setEvidence2({ ...evidence2, third: e.target.files });
                        }
                      }
                    }}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                </Card>
              </Stack>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                การติดตามและรายงานผลการบริหารความเสี่ยง
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Card
                  key={"first"}
                  variant="outlined"
                  sx={{
                    width: "95%",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    การติดตามความเสี่ยงอย่างสม่ำเสมอ
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    required
                    onChange={(e) => {
                      const files = e.target.files;
                      for (let file in files) {
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert("each file must less than 10MB");
                          return;
                        } else {
                          setEvidence3({ ...evidence3, first: e.target.files });
                        }
                      }
                    }}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                </Card>
              </Stack>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                วัฒนธรรมและความตระหนักด้านการบริหารความเสี่ยง
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Card
                  key={"first"}
                  variant="outlined"
                  sx={{
                    width: "95%",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    กิจกรรมสร้างความตระหนักด้านความเสี่ยง
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    required
                    onChange={(e) => {
                      const files = e.target.files;
                      for (let file in files) {
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert("each file must less than 10MB");
                          return;
                        } else {
                          setEvidence4({ ...evidence4, first: e.target.files });
                        }
                      }
                    }}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                </Card>
                <Card
                  key={"second"}
                  variant="outlined"
                  sx={{
                    width: "95%",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    การมีส่วนร่วมของบุคลากรในการบริหารความเสี่ยง
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    required
                    onChange={(e) => {
                      const files = e.target.files;
                      for (let file in files) {
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert("each file must less than 10MB");
                          return;
                        } else {
                          setEvidence4({
                            ...evidence4,
                            second: e.target.files,
                          });
                        }
                      }
                    }}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                </Card>
              </Stack>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                การปรับปรุงอย่างต่อเนื่องและนวัตกรรม
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Card
                  key={"first"}
                  variant="outlined"
                  sx={{
                    width: "95%",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    บทเรียนที่ได้รับและแนวปฏิบัติที่ดี
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    required
                    onChange={(e) => {
                      const files = e.target.files;
                      for (let file in files) {
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert("each file must less than 10MB");
                          return;
                        } else {
                          setEvidence5({ ...evidence5, first: e.target.files });
                        }
                      }
                    }}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                </Card>
                <Card
                  key={"second"}
                  variant="outlined"
                  sx={{
                    width: "95%",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    การปรับปรุงกระบวนการบริหารความเสี่ยง
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    required
                    onChange={(e) => {
                      const files = e.target.files;
                      for (let file in files) {
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert("each file must less than 10MB");
                          return;
                        } else {
                          setEvidence5({
                            ...evidence5,
                            second: e.target.files,
                          });
                        }
                      }
                    }}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                </Card>
              </Stack>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Section 2: Upload Your Final Project (PDF)
              </Typography>
              <Stack alignItems="center">
                <Card variant="outlined" sx={{ width: "95%", p: 2 }}>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={handleProjectChange}
                  />
                </Card>
              </Stack>
            </CardContent>
          </Card>

          {/* Submit */}
          <Box textAlign="center">
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? (
                <>
                  <CircularProgress size={36} />
                  {"analyzing please wait."}
                </>
              ) : done ? (
                <Typography variant="h6">Submited</Typography>
              ) : (
                <Typography variant="h6">Submit</Typography>
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
}
