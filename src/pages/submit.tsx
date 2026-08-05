import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import FileUploadField from '@/components/submit/FileUploadField';
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
  projectName: 'ชื่อโครงการ',
  name: 'ชื่อผู้ส่ง',
  department: 'คณะ หรือ สังกัด',
  email: 'อีเมล',
  phone: 'เบอร์โทรศัพท์',
};

export default function SubmitPage() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const [form, setForm] = useState<SubmitterForm>(EMPTY_FORM);
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [succeeded, setSucceeded] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);

  // The form is generated from the server's rubric, so adding a criterion on
  // the backend adds a field here with no client change.
  useEffect(() => {
    api
      .getFormSchema()
      .then(setSchema)
      .catch((error) =>
        setSchemaError(errorMessage(error, 'ไม่สามารถโหลดแบบฟอร์มได้')),
      );
  }, []);

  const projectFiles = useMemo(
    () => (schema ? (files[schema.projectField] ?? []) : []),
    [files, schema],
  );

  const setFilesFor = (field: string, next: File[]) =>
    setFiles((current) => ({ ...current, [field]: next }));

  const validate = (): boolean => {
    if (!schema) return false;

    const errors: Record<string, boolean> = {};
    (Object.keys(EMPTY_FORM) as (keyof SubmitterForm)[]).forEach((key) => {
      if (!form[key].trim()) errors[key] = true;
    });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = true;
    if (projectFiles.length === 0) errors[schema.projectField] = true;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFiles({});
    setFieldErrors({});
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    // The original called validate() but had the call commented out, so blank
    // submissions reached the server.
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(files).forEach(([field, selected]) => {
      selected.forEach((file) => formData.append(field, file));
    });
    formData.append('data', JSON.stringify(form));

    setUploading(true);
    setProgress(0);

    try {
      await api.createSubmission(formData, setProgress);
      setSucceeded(true);
      resetForm();
    } catch (error) {
      setSubmitError(errorMessage(error, 'ส่งโครงการไม่สำเร็จ'));
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
        แบบฟอร์มการส่งโครงการ
      </Typography>
      <Typography
        variant="body2"
        align="center"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        อัปโหลดเอกสารสรุปโครงการพร้อมหลักฐานประกอบ ระบบจะให้ AI ประเมินคะแนนเต็ม{' '}
        {schema.maxTotalScore} คะแนน
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

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
            เอกสารสรุปโครงการ
          </Typography>
          <FileUploadField
            label="ไฟล์สรุปโครงการ (PDF)"
            helperText="ไฟล์หลักที่ใช้ประเมิน"
            multiple={false}
            required
            files={projectFiles}
            error={Boolean(fieldErrors[schema.projectField])}
            onChange={(next) => setFilesFor(schema.projectField, next.slice(0, 1))}
          />
        </CardContent>
      </Card>

      {schema.dimensions.map((dimension) => (
        <Card key={dimension.index} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">
              มิติที่ {dimension.index}: {dimension.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              คะแนนเต็ม {dimension.weight} คะแนน
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={3}>
              {dimension.criteria.map((criterion) => (
                <FileUploadField
                  key={criterion.field}
                  label={`${criterion.code} ${criterion.title}`}
                  helperText={`หลักฐานที่ต้องแสดง: ${criterion.evidenceRequirement}`}
                  files={files[criterion.field] ?? []}
                  onChange={(next) => setFilesFor(criterion.field, next)}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Box textAlign="center" sx={{ mb: 6 }}>
        <Button type="submit" variant="contained" size="large" disabled={uploading}>
          ส่งโครงการ
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
              <Typography variant="h6">ส่งโครงการเรียบร้อย</Typography>
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
