import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  InputLabel,
  FormHelperText,
  Stack,
} from '@mui/material';

export default function ProjectSubmissionForm() {

  const [certificates, setCertificates] = useState({
    dimension1: null,
    dimension2: null,
    dimension3: null,
    dimension4: null,
    dimension5: null,
  });

  const [projectFile, setProjectFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleCertificateChange = (e, key) => {
    setCertificates({ ...certificates, [key]: e.target.files[0] });
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleProjectChange = (e) => {
    setProjectFile(e.target.files[0]);
    setErrors((prev) => ({ ...prev, project: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.entries(certificates).forEach(([key, file]) => {
      if (!file) newErrors[key] = 'Required';
    });

    if (!projectFile) newErrors.project = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    Object.entries(certificates).forEach(([key, file]) => {
      formData.append(`certificate_${key}`, file);
    });
    formData.append('project', projectFile);

    fetch('/api/submit-project', {
      method: 'POST',
      body: formData,
    })
      .then(() => alert('Submitted!'))
      .catch(() => alert('Submission failed'));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
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
                      width: '95%',
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
                      onChange={(e) => handleCertificateChange(e, key)}
                      style={{ display: 'block', marginTop: '8px' }}
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
              <Card variant="outlined" sx={{ width: '95%', p: 2 }}>
                <InputLabel required>Project File</InputLabel>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleProjectChange}
                  style={{ display: 'block', marginTop: '8px' }}
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
          <Button type="submit" variant="contained" size="large">
            Submit Project
          </Button>
        </Box>
      </form>
    </Box>
  );
}
