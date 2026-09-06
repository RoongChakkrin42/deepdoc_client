import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

/**
 * Demo reports a visitor can grade without having a real submission.
 *
 * The app only reads one kind of document, so anyone who is not from a Chula
 * faculty has nothing to upload and cannot see what the tool does. These three
 * are written from scratch in `tools/sample-docs/` — no faculty, person or
 * incident in them is real — and deliberately span the maturity range so the
 * scoring visibly separates them instead of returning one flat number.
 */
const SAMPLES = [
  {
    file: 'sample-strong.pdf',
    title: 'ตัวอย่างที่ 1 — หลักฐานครบถ้วน',
    detail:
      'รายงานที่เขียนให้ถึงระดับสูงสุดทุกเกณฑ์ มีทั้งการผูกความเสี่ยงเข้ากับแผนกลยุทธ์ การวิเคราะห์เชิงปริมาณเป็นตัวเงิน แดชบอร์ดที่คำนวณตัวชี้วัดรายวัน และผลลัพธ์รายประเด็นที่ระบุข้อที่ไม่บรรลุเป้าไว้ด้วย',
  },
  {
    file: 'sample-partial.pdf',
    title: 'ตัวอย่างที่ 2 — หลักฐานบางส่วน',
    detail:
      'รายงานที่ทำจริงแต่ยังไม่ครบ เช่น ติดตามผลไม่ครบทุกไตรมาส กำหนดตัวชี้วัดไม่ครบทุกประเด็น และไม่มีแผนผังกระบวนการ',
  },
  {
    file: 'sample-weak.pdf',
    title: 'ตัวอย่างที่ 3 — เพิ่งเริ่มต้น',
    detail:
      'หน่วยงานที่ยังไม่มีคำสั่งแต่งตั้ง ทะเบียนความเสี่ยง หรือการติดตามผล ใช้ดูว่าระบบรายงานข้อที่หาหลักฐานไม่พบอย่างไร',
  },
];

export default function SampleDownloads() {
  return (
    <Card sx={{ mb: 3 }} variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ยังไม่มีเอกสารสำหรับทดลอง?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ดาวน์โหลดรายงานตัวอย่างด้านล่างไปส่งได้เลย
          ทั้งสามฉบับเป็นเอกสารสมมติที่จัดทำขึ้นเพื่อสาธิตระบบ
          และเขียนให้มีความสมบูรณ์ของหลักฐานต่างกัน เพื่อให้เห็นว่าคะแนนและระดับรางวัลเปลี่ยนไปอย่างไร
        </Typography>

        <Stack spacing={1.5}>
          {SAMPLES.map((sample) => (
            <Box
              key={sample.file}
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">{sample.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {sample.detail}
                </Typography>
              </Box>
              <Button
                component="a"
                href={`/samples/${sample.file}`}
                download
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{ flexShrink: 0 }}
              >
                ดาวน์โหลด PDF
              </Button>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
