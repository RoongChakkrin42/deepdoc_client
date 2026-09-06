import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileUploadField from '@/components/submit/FileUploadField';
import SampleDownloads from '@/components/submit/SampleDownloads';
import { api, errorMessage } from '@/lib/api';
import type { FormSchema } from '@/lib/types';

interface SubmitterForm {
  name: string;
  projectName: string;
  department: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: SubmitterForm = {
  name: '',
  projectName: '',
  department: '',
  email: '',
  phone: '',
};

const FIELD_LABELS: Record<keyof SubmitterForm, string> = {
  projectName: 'ชื่อผลงาน',
  name: 'ชื่อผู้ส่ง',
  department: 'คณะ หรือ สังกัด',
  email: 'อีเมล',
  phone: 'เบอร์โทรศัพท์',
};

export default function SubmitPage() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const [form, setForm] = useState<SubmitterForm>(EMPTY_FORM);
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [succeeded, setSucceeded] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);

  // The rubric travels with the form schema, so adding a criterion on the
  // backend updates the checklist below with no client change.
  useEffect(() => {
    api
      .getFormSchema()
      .then(setSchema)
      .catch((error) =>
        setSchemaError(errorMessage(error, 'ไม่สามารถโหลดแบบฟอร์มได้')),
      );
  }, []);

  const criterionCount = useMemo(
    () =>
      schema
        ? schema.dimensions.reduce((sum, d) => sum + d.criteria.length, 0)
        : 0,
    [schema],
  );

  const validate = (): boolean => {
    if (!schema) return false;

    const errors: Record<string, boolean> = {};
    (Object.keys(EMPTY_FORM) as (keyof SubmitterForm)[]).forEach((key) => {
      if (!form[key].trim()) errors[key] = true;
    });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = true;
    if (reportFiles.length === 0) errors[schema.projectField] = true;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setReportFiles([]);
    setFieldErrors({});
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    // The original called validate() but had the call commented out, so blank
    // submissions reached the server.
    if (!validate() || !schema) return;

    const formData = new FormData();
    formData.append(schema.projectField, reportFiles[0]);
    formData.append('data', JSON.stringify(form));

    setUploading(true);
    setProgress(0);

    try {
      await api.createSubmission(formData, setProgress);
      setSucceeded(true);
      resetForm();
    } catch (error) {
      setSubmitError(errorMessage(error, 'ส่งผลงานไม่สำเร็จ'));
    } finally {
      setUploading(false);
    }
  };

  if (schemaError) {
    return <Alert severity="error">{schemaError}</Alert>;
  }

  if (!schema) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }} spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">กำลังโหลดแบบฟอร์ม...</Typography>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 900, mx: 'auto' }}>
      <div ref={topRef} />

      <Typography variant="h4" align="center" gutterBottom>
        แบบฟอร์มการส่งผลงาน
      </Typography>
      <Typography
        variant="body2"
        align="center"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        อัปโหลดรายงานผลการวางระบบบริหารความเสี่ยงเป็นไฟล์ PDF ไฟล์เดียว
        ระบบจะให้ AI ประเมินตามเกณฑ์ {criterionCount} ข้อ คะแนนเต็ม{' '}
        {schema.maxTotalScore} คะแนน
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <SampleDownloads />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ข้อมูลผู้ส่ง
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {(Object.keys(FIELD_LABELS) as (keyof SubmitterForm)[]).map((key) => (
              <TextField
                key={key}
                label={FIELD_LABELS[key]}
                value={form[key]}
                required
                error={Boolean(fieldErrors[key])}
                helperText={
                  fieldErrors[key]
                    ? key === 'email'
                      ? 'กรุณากรอกอีเมลให้ถูกต้อง'
                      : 'จำเป็นต้องกรอก'
                    : undefined
                }
                onChange={(event) =>
                  setForm((current) => ({ ...current, [key]: event.target.value }))
                }
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ไฟล์รายงาน
          </Typography>
          <FileUploadField
            label="รายงานผลการวางระบบบริหารความเสี่ยง (PDF)"
            helperText="ไฟล์เดียวที่ใช้ประเมินทั้ง 5 มิติ หลักฐานทุกข้อต้องอยู่ในไฟล์นี้"
            multiple={false}
            required
            files={reportFiles}
            error={Boolean(fieldErrors[schema.projectField])}
            onChange={(next) => setReportFiles(next.slice(0, 1))}
          />
        </CardContent>
      </Card>

      {/*
        The upload form used to have one file field per criterion. Now that a
        submission is a single document, this checklist is the only thing that
        tells a submitter what the report has to cover before they send it.
      */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">เกณฑ์ที่ใช้ประเมิน</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ตรวจให้แน่ใจว่ารายงานครอบคลุมทุกข้อด้านล่าง
            ข้อที่หาหลักฐานในเอกสารไม่พบจะถูกให้ระดับต่ำสุด
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {schema.awardTiers.map((tier) => (
              <Chip
                key={tier.id}
                size="small"
                variant="outlined"
                label={`${tier.label} — ${
                  tier.minScore > 0 ? `${tier.minScore} คะแนนขึ้นไป` : 'ต่ำกว่า 50'
                }`}
              />
            ))}
          </Stack>

          {schema.dimensions.map((dimension) => (
            <Accordion key={dimension.index} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  มิติที่ {dimension.index}: {dimension.title}
                </Typography>
                <Chip
                  size="small"
                  label={`${dimension.weight}%`}
                  sx={{ ml: 'auto', mr: 1 }}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {dimension.focus}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={2}>
                  {dimension.criteria.map((criterion) => (
                    <Box key={criterion.code}>
                      <Typography variant="subtitle2">
                        {criterion.code} {criterion.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        หลักฐานที่ต้องแสดง: {criterion.evidenceRequirement}
                      </Typography>
                      <Stack component="ul" sx={{ pl: 3, m: 0, mt: 0.5 }}>
                        {criterion.checks.map((check) => (
                          <li key={check}>
                            <Typography variant="caption" color="text.secondary">
                              {check}
                            </Typography>
                          </li>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      <Box textAlign="center" sx={{ mb: 6 }}>
        <Button type="submit" variant="contained" size="large" disabled={uploading}>
          ส่งผลงาน
        </Button>
      </Box>

      <Dialog open={uploading || succeeded} maxWidth="xs" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 5 }}>
          {uploading && (
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography>กำลังอัปโหลด กรุณาอย่าปิดหน้านี้</Typography>
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="caption" color="text.secondary">
                  {progress}%
                </Typography>
              </Box>
            </Stack>
          )}

          {succeeded && (
            <Stack alignItems="center" spacing={2}>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 72 }} />
              <Typography variant="h6">ส่งผลงานเรียบร้อย</Typography>
              <Typography variant="body2" color="text.secondary">
                ระบบกำลังให้ AI ประเมินอยู่เบื้องหลัง
                ผลจะปรากฏในหน้า &ldquo;ผลตรวจ&rdquo; เมื่อประเมินเสร็จ
              </Typography>
              <Button variant="contained" onClick={() => setSucceeded(false)}>
                ปิด
              </Button>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
