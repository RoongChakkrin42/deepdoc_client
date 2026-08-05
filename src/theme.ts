import { createTheme } from '@mui/material/styles';

/** Chulalongkorn pink, previously repeated as a `#b43b6b` literal on every element. */
export const BRAND = '#b43b6b';

const theme = createTheme({
  palette: {
    primary: { main: BRAND },
    background: { default: '#faf7f8' },
  },
  typography: {
    fontFamily:
      '"IBM Plex Sans Thai", "Noto Sans Thai", system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', borderRadius: 999 } },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
    },
  },
});

export default theme;
