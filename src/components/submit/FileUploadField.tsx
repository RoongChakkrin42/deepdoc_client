import {
  Box,
  Button,
  Chip,
  FormHelperText,
  Stack,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface Props {
  label: string;
  helperText?: string;
  files: File[];
  multiple?: boolean;
  required?: boolean;
  error?: boolean;
  onChange: (files: File[]) => void;
}

export default function FileUploadField({
  label,
  helperText,
  files,
  multiple = true,
  required = false,
  error = false,
  onChange,
}: Props) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {label}
        {required && (
          <Typography component="span" color="error">
            {' *'}
          </Typography>
        )}
      </Typography>

      {helperText && (
        <Typography variant="caption" color="text.secondary" display="block">
          {helperText}
        </Typography>
      )}

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
        <Button
          component="label"
          variant="outlined"
          size="small"
          color={error ? 'error' : 'primary'}
          startIcon={<UploadFileIcon />}
        >
          เลือกไฟล์ PDF
          <input
            type="file"
            accept="application/pdf"
            multiple={multiple}
            hidden
            // Resetting the value lets the same file be re-picked after removal.
            onChange={(event) => {
              onChange(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
        </Button>

        {files.map((file, index) => (
          <Chip
            key={`${file.name}-${index}`}
            label={file.name}
            size="small"
            onDelete={() => onChange(files.filter((_, i) => i !== index))}
          />
        ))}

        {files.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            ยังไม่ได้เลือกไฟล์
          </Typography>
        )}
      </Stack>

      {error && <FormHelperText error>กรุณาอัปโหลดไฟล์นี้</FormHelperText>}
    </Box>
  );
}
