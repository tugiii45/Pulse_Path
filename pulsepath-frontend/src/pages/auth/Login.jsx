import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import {
  clearAuthMessage,
  getAuthMessage,
  loginUser,
  saveTokens,
} from "../../services/AuthService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const authMessage = getAuthMessage();

    if (authMessage) {
      setError(authMessage);
      clearAuthMessage();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const tokens = await loginUser(email, password);
      
      saveTokens(tokens);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
      console.error(err);
    }
  };

  return (
    <AuthLayout>
      <h2 className="fw-bold mb-2">Welcome Back</h2>
      <p className="text-muted mb-4">
        Sign in to continue to PulsePath.
      </p>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary w-100 py-2" type="submit">
          Login
        </button>
      </form>

      <hr />

      <p className="text-center">
        Don't have an account?
        <Link to="/register" className="ms-2 text-decoration-none fw-bold">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;