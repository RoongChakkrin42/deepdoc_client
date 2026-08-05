import { FormEvent, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { api, errorMessage } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSession, setUsername as storeUsername } from '@/store/sessionSlice';

/**
 * Blocks the reviewer pages until a session exists.
 *
 * The fields start empty — the previous version shipped a working admin
 * username and password as the default state, which went into the public repo.
 */
export default function LoginDialog() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.session.accessToken);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const tokens = await api.login(username, password);
      dispatch(setSession(tokens));
      dispatch(storeUsername(username));
      setPassword('');
    } catch (err) {
      setError(errorMessage(err, 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!accessToken} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>เข้าสู่ระบบ</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" sx={{ mb: 2 }}>
            หน้านี้สำหรับผู้ตรวจประเมินเท่านั้น
          </DialogContentText>

          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="ชื่อผู้ใช้งาน"
              value={username}
              autoComplete="username"
              autoFocus
              onChange={(event) => setUsername(event.target.value)}
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!username || !password || submitting}
          >
            {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
