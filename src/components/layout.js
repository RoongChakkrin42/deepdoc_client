import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { clearSession } from "../sessionSlice";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const session = useSelector((state) => state.session);
  const dispatch = useDispatch();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      dispatch(clearSession());
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <AppBar position="fixed" elevation={1} sx={{ zIndex: 9999, backgroundColor: '#eb038b' }}>
        <Toolbar sx={{ gap: 3, flexWrap: "wrap" }}>
          <Typography variant="h4">
            DeepDoc
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ cursor: 'pointer' }} 
            onClick={() => router.push("/submit")}
          >
            Submit
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ cursor: 'pointer' }} 
            onClick={() => router.push("/results")}
          >
            Results
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", gap: 2 }}>
            {session.access_token != null && (
              <Button
                color="error"
                variant="contained"
                onClick={handleLogout}
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
          zIndex: 9999
        }}
      >
        <p style={{ margin: 0 }}>© 2025 DeepDoc Powered by Chulalongkorn University</p>
      </footer>
    </>
  );
}
