import { Chip, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { AnalysisStatus } from '@/lib/types';

const CONFIG: Record<
  AnalysisStatus,
  { label: string; color: 'default' | 'info' | 'success' | 'error' }
> = {
  pending: { label: 'รอประเมิน', color: 'default' },
  processing: { label: 'กำลังประเมิน', color: 'info' },
  completed: { label: 'ประเมินแล้ว', color: 'success' },
  failed: { label: 'ประเมินไม่สำเร็จ', color: 'error' },
};

export default function StatusChip({ status }: { status: AnalysisStatus }) {
  const { label, color } = CONFIG[status];

  const icon =
    status === 'processing' ? (
      <CircularProgress size={14} sx={{ ml: 1 }} />
    ) : status === 'completed' ? (
      <CheckCircleIcon />
    ) : status === 'failed' ? (
      <ErrorIcon />
    ) : (
      <ScheduleIcon />
    );

  return <Chip size="small" label={label} color={color} icon={icon} />;
}
