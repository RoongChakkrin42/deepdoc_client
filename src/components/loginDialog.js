import { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux'
import { setSession } from "../sessionSlice";

export default function Login() {
  const session = useSelector((state) => state.session);
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8000/login", {
        username,
        password,
      });
      if (response) {
        dispatch(setSession({ token: response.data.access_token }));
        setUsername("");
        setPassword("");
      } else {
        alert("invalid username or password");
      }
    } catch (error) {
      alert("invalid username or password");
    }
  };

  return (
    <Dialog 
      open={session.token == null}
      onKeyDown={(e) => e.key === 'Enter' && username && password && handleLogin()}
    >
      <DialogTitle>Login</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={handleLogin}
          disabled={username == "" || password == ""}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
