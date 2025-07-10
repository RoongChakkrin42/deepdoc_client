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

export default function ProjectSubmissionForm() {
  const [evidence, setEvidence] = useState({
    dimension1: null,
    dimension2: null,
    dimension3: null,
    dimension4: null,
    dimension5: null,
  });
  const [projectFile, setProjectFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCertificateChange = (e, key) => {
    setEvidence({ ...evidence, [key]: e.target.files[0] });
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleProjectChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, project: "File size must be less than 10MB" }));
      return;
    }
    setProjectFile(file);
    setErrors((prev) => ({ ...prev, project: null }));
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const newErrors = {};
    Object.entries(evidence).forEach(([key, file]) => {
      if (!file) newErrors[key] = "Required";
    });

    if (!projectFile) newErrors.project = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    Object.entries(evidence).forEach(([key, file]) => {
      formData.append("files", file);
    });
    formData.append("files", projectFile);
    const response = await axios.post(
      "http://localhost:8000/uploadFiles",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if(response){
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Project Submission Form
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Section 1 */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Section 1: Certificate Uploads
            </Typography>

            <Stack spacing={2} alignItems="center">
              {Array.from({ length: 5 }, (_, i) => {
                const key = `dimension${i + 1}`;
                return (
                  <Card
                    key={key}
                    variant="outlined"
                    sx={{
                      width: "95%",
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Dimension {i + 1}
                    </Typography>
                    <InputLabel required>Upload Certificate (PDF)</InputLabel>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) => handleCertificateChange(e, key)}
                      style={{ display: "block", marginTop: "8px" }}
                    />
                    {errors[key] && (
                      <FormHelperText error>{errors[key]}</FormHelperText>
                    )}
                  </Card>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Section 2: Upload Your Final Project (PDF)
            </Typography>
            <Stack alignItems="center">
              <Card variant="outlined" sx={{ width: "95%", p: 2 }}>
                <InputLabel required>Project File</InputLabel>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleProjectChange}
                  style={{ display: "block", marginTop: "8px" }}
                />
                {errors.project && (
                  <FormHelperText error>{errors.project}</FormHelperText>
                )}
              </Card>
            </Stack>
          </CardContent>
        </Card>

        {/* Submit */}
        <Box textAlign="center">
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <><CircularProgress size={24} />{"analyzing please wait."}</> : "Submit Project"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
