import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { clearSession } from "../sessionSlice";

export default function Layout({ children }) {
  const session = useSelector((state) => state.session);
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      dispatch(clearSession());
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            DeepDoc
          </Typography>
          <Box component="form" sx={{ display: "flex", gap: 2 }}>
            {session.access_token == null ? null : (
              <Button
                color="error"
                variant="contained"
                onClick={handleLogout}
                disabled={session.access_token == null}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <main
        style={{ marginTop: "64px", marginBottom: "48px", overflow: "auto" }}
      >
        {children}
      </main>

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#eee",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>© 2025 DeepDoc</p>
      </footer>
    </>
  );
}
