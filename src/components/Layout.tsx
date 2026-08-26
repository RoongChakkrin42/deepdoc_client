import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearSession } from '@/store/sessionSlice';

const NAV = [
  { href: '/submit', label: 'ส่งผลงาน' },
  { href: '/results', label: 'ผลตรวจ' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.session.accessToken);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 3, flexWrap: 'wrap' }}>
          <Typography variant="h5" component="span" sx={{ fontWeight: 700 }}>
            DeepDoc
          </Typography>

          {NAV.map((item) => (
            <Typography
              key={item.href}
              component="button"
              variant="subtitle1"
              onClick={() => router.push(item.href)}
              sx={{
                border: 0,
                background: 'none',
                color: 'inherit',
                cursor: 'pointer',
                font: 'inherit',
                opacity: router.pathname === item.href ? 1 : 0.75,
                textDecoration:
                  router.pathname === item.href ? 'underline' : 'none',
                textUnderlineOffset: 6,
              }}
            >
              {item.label}
            </Typography>
          ))}

          <Box sx={{ flexGrow: 1 }} />

          {accessToken && (
            <Button
              variant="contained"
              color="inherit"
              onClick={() => dispatch(clearSession())}
              sx={{ bgcolor: 'common.white', color: 'text.primary' }}
            >
              ออกจากระบบ
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          bgcolor: 'grey.100',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} DeepDoc — AI-assisted document review
        </Typography>
      </Box>
    </Box>
  );
}
