import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplayIcon from '@mui/icons-material/Replay';
import LoginDialog from '@/components/LoginDialog';
import ResultDetailDialog from '@/components/results/ResultDetailDialog';
import StatusChip from '@/components/results/StatusChip';
import { api, errorMessage } from '@/lib/api';
import type { Submission } from '@/lib/types';
import { useAppSelector } from '@/store';

const FIRST_YEAR = 2025;
/** How often to re-check while at least one analysis is still running. */
const POLL_INTERVAL_MS = 8_000;

export default function ResultsPage() {
  const accessToken = useAppSelector((state) => state.session.accessToken);

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () =>
      Array.from({ length: currentYear - FIRST_YEAR + 1 }, (_, i) => currentYear - i),
    [currentYear],
  );

  const [year, setYear] = useState(currentYear);
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Submission | null>(null);

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (targetYear: number, showSpinner = true) => {
      if (showSpinner) setLoading(true);
      try {
        const data = await api.listSubmissions(targetYear);
        setSubmissions(data);
        setError(null);

        // Keep the detail dialog in sync when its submission finishes grading.
        setSelected((current) =>
          current ? (data.find((item) => item.id === current.id) ?? current) : null,
        );
      } catch (err) {
        setError(errorMessage(err, 'โหลดผลการประเมินไม่สำเร็จ'));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (accessToken) void load(year);
  }, [accessToken, year, load]);

  // Poll only while something is actually in flight, and stop as soon as
  // every submission has settled.
  useEffect(() => {
    if (!accessToken || !submissions) return;

    const inFlight = submissions.some(
      (item) => item.status === 'pending' || item.status === 'processing',
    );
    if (!inFlight) return;

    pollTimer.current = setTimeout(() => void load(year, false), POLL_INTERVAL_MS);

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [submissions, accessToken, year, load]);

  const handleRetry = async (submission: Submission) => {
    try {
      await api.retrySubmission(submission.id);
      await load(year, false);
    } catch (err) {
      setError(errorMessage(err, 'สั่งประเมินใหม่ไม่สำเร็จ'));
    }
  };

  return (
    <>
      <LoginDialog />
      <ResultDetailDialog submission={selected} onClose={() => setSelected(null)} />

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">ผลการประเมิน</Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="year-label">ปี</InputLabel>
            <Select
              labelId="year-label"
              label="ปี"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {years.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            startIcon={<RefreshIcon />}
            onClick={() => void load(year)}
            disabled={loading}
          >
            รีเฟรช
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !submissions && (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress />
        </Stack>
      )}

      {submissions && submissions.length === 0 && (
        <Alert severity="info">ยังไม่มีโครงการที่ส่งเข้ามาในปี {year}</Alert>
      )}

      {submissions && submissions.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                {['โครงการ', 'ผู้ส่ง', 'สถานะ'].map((label) => (
                  <TableCell key={label} sx={{ color: 'common.white' }}>
                    {label}
                  </TableCell>
                ))}
                {[1, 2, 3, 4, 5].map((index) => (
                  <TableCell key={index} align="center" sx={{ color: 'common.white' }}>
                    มิติ {index}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ color: 'common.white' }}>
                  คะแนนรวม
                </TableCell>
                <TableCell align="center" sx={{ color: 'common.white' }} />
              </TableRow>
            </TableHead>

            <TableBody>
              {submissions.map((submission) => (
                <TableRow
                  key={submission.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelected(submission)}
                >
                  <TableCell>{submission.submitter.projectName}</TableCell>
                  <TableCell>{submission.submitter.name}</TableCell>
                  <TableCell>
                    <StatusChip status={submission.status} />
                  </TableCell>

                  {[1, 2, 3, 4, 5].map((index) => {
                    const dimension = submission.analysis?.dimensions.find(
                      (item) => item.index === index,
                    );
                    return (
                      <TableCell key={index} align="center">
                        {dimension ? `${dimension.score}/${dimension.maxScore}` : '—'}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {submission.analysis ? submission.analysis.overallScore : '—'}
                  </TableCell>

                  <TableCell align="center">
                    {submission.status === 'failed' && (
                      <Tooltip title="สั่งให้ AI ประเมินใหม่">
                        <Button
                          size="small"
                          startIcon={<ReplayIcon />}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleRetry(submission);
                          }}
                        >
                          ลองใหม่
                        </Button>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ height: 24 }} />
    </>
  );
}
