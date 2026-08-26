import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LevelChip from './LevelChip';
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

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ bgcolor: 'primary.main', color: 'common.white', px: 2, py: 1.5, borderRadius: 1 }}
                  >
                    <Box>
                      <Typography variant="h6">{analysis.award.label}</Typography>
                      <Typography variant="caption">
                        {analysis.award.description}
                      </Typography>
                    </Box>
                    <Typography variant="h4">{analysis.overallScore}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {analysis.overallComment}
                  </Typography>

                  <SectionTitle>สรุปข้อมูลผลงาน</SectionTitle>
                  <Box sx={{ '& p': { mb: 1.5 }, '& ul, & ol': { pl: 3, mb: 1.5 } }}>
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {analysis.summary || 'ไม่มีข้อมูล'}
                    </Markdown>
                  </Box>

                  <SectionTitle>ผลการประเมินรายมิติ</SectionTitle>
                  {analysis.dimensions.map((dimension) => (
                    <Box key={dimension.index}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="baseline"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          มิติที่ {dimension.index}: {dimension.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LevelChip
                            level={dimension.level}
                            label={dimension.levelLabel}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {dimension.score}/100 × {dimension.weight}% ={' '}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {dimension.weightedScore}
                          </Typography>
                        </Stack>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(dimension.score, 100)}
                        sx={{ my: 1, height: 6, borderRadius: 3 }}
                      />

                      <Stack spacing={1.5} sx={{ pl: 1 }}>
                        {dimension.criteria.map((criterion) => (
                          <Paper key={criterion.code} variant="outlined" sx={{ p: 1.5 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              gap={1}
                            >
                              <Typography variant="subtitle2">
                                {criterion.code} {criterion.title}
                              </Typography>
                              <LevelChip
                                level={criterion.level}
                                label={`${criterion.levelLabel} (${criterion.score})`}
                              />
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {criterion.comment}
                            </Typography>

                            {criterion.evidenceFound.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  หลักฐานที่ยกมาจากเอกสาร
                                </Typography>
                                <Stack component="ul" sx={{ pl: 3, m: 0 }}>
                                  {criterion.evidenceFound.map((quote, index) => (
                                    <li key={`${criterion.code}-e${index}`}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontStyle: 'italic' }}
                                      >
                                        &ldquo;{quote}&rdquo;
                                      </Typography>
                                    </li>
                                  ))}
                                </Stack>
                              </Box>
                            )}

                            {criterion.missing.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  สิ่งที่ยังหาไม่พบ
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  flexWrap="wrap"
                                  useFlexGap
                                  sx={{ mt: 0.5 }}
                                >
                                  {criterion.missing.map((item, index) => (
                                    <Chip
                                      key={`${criterion.code}-m${index}`}
                                      size="small"
                                      variant="outlined"
                                      color="warning"
                                      label={item}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  ))}

                  <Divider />

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6">คะแนนรวม</Typography>
                    <Typography variant="h6">
                      {analysis.overallScore}/100
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    ประเมินโดย {analysis.model} เมื่อ{' '}
                    {new Date(analysis.analyzedAt).toLocaleString('th-TH')}
                  </Typography>
                </>
              )}

              <SectionTitle>ไฟล์ที่ส่งมา</SectionTitle>
              <Link href={submission.report.url} target="_blank" rel="noopener noreferrer">
                📄 {submission.report.filename}
              </Link>
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
