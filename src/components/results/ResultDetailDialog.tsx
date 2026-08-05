import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StatusChip from './StatusChip';
import type { Submission } from '@/lib/types';

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="subtitle1"
    sx={{ bgcolor: 'grey.100', px: 1.5, py: 1, borderRadius: 1, fontWeight: 600 }}
  >
    {children}
  </Typography>
);

interface Props {
  submission: Submission | null;
  onClose: () => void;
}

export default function ResultDetailDialog({ submission, onClose }: Props) {
  const analysis = submission?.analysis ?? null;

  return (
    <Dialog open={Boolean(submission)} onClose={onClose} maxWidth="md" fullWidth>
      {submission && (
        <>
          <DialogTitle>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6" component="span">
                {submission.submitter.projectName}
              </Typography>
              <StatusChip status={submission.status} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {submission.submitter.name} — {submission.submitter.department}
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2}>
              {submission.status === 'failed' && (
                <Alert severity="error">
                  ประเมินไม่สำเร็จหลังพยายาม {submission.attempts} ครั้ง:{' '}
                  {submission.failureReason ?? 'ไม่ทราบสาเหตุ'}
                </Alert>
              )}

              {(submission.status === 'pending' ||
                submission.status === 'processing') && (
                <Alert severity="info">
                  ระบบกำลังให้ AI ประเมินอยู่ หน้านี้จะอัปเดตอัตโนมัติเมื่อเสร็จ
                </Alert>
              )}

              {analysis && (
                <>
                  {analysis.notes.length > 0 && (
                    <Alert severity="warning">
                      <Stack component="ul" sx={{ pl: 2, m: 0 }}>
                        {analysis.notes.map((note) => (
                          <li key={note}>
                            <Typography variant="body2">{note}</Typography>
                          </li>
                        ))}
                      </Stack>
                    </Alert>
                  )}

                  <SectionTitle>สรุปข้อมูลโครงการ</SectionTitle>
                  <Box sx={{ '& p': { mb: 1.5 }, '& ul, & ol': { pl: 3, mb: 1.5 } }}>
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {analysis.summary || 'ไม่มีข้อมูล'}
                    </Markdown>
                  </Box>

                  <SectionTitle>ผลการประเมิน</SectionTitle>
                  {analysis.dimensions.map((dimension) => (
                    <Box key={dimension.index}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="baseline"
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          มิติที่ {dimension.index}: {dimension.title}
                        </Typography>
                        <Typography variant="body1">
                          {dimension.score}/{dimension.maxScore}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(dimension.score / dimension.maxScore) * 100}
                        sx={{ my: 0.5, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {dimension.comment}
                      </Typography>
                    </Box>
                  ))}

                  <Divider />

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6">คะแนนรวม</Typography>
                    <Typography variant="h6">
                      {analysis.overallScore}/100
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {analysis.overallComment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ประเมินโดย {analysis.model} เมื่อ{' '}
                    {new Date(analysis.analyzedAt).toLocaleString('th-TH')}
                  </Typography>
                </>
              )}

              <SectionTitle>ไฟล์ที่เกี่ยวข้อง</SectionTitle>
              <Link href={submission.report.url} target="_blank" rel="noopener noreferrer">
                📄 {submission.report.filename} (เอกสารโครงการ)
              </Link>

              {submission.evidence.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  ไม่มีไฟล์หลักฐานแนบมา
                </Typography>
              ) : (
                submission.evidence.map((file) => (
                  <Link
                    key={file.url}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                  >
                    📎 [{file.criterionCode ?? '-'}] {file.filename}
                  </Link>
                ))
              )}
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
