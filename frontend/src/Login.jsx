import Services from "./Services";
import { useState, useEffect } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/token/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.access) {
        localStorage.setItem("token", data.access);
        setLoggedIn(true);
      } else {
        alert("Login Failed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  if (loggedIn) {
  return (
    <div>
      <h1>Welcome!</h1>

      <button onClick={handleLogout}>
        Logout
      </button>

      <Services />
    </div>
  );
}

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default Login;