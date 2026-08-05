import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";

function Login() {
  return (
    <AuthLayout>

      <h2 className="fw-bold mb-2">
        Welcome Back
      </h2>

      <p className="text-muted mb-4">
        Sign in to continue to PulsePath.
      </p>

      <form>

        <div className="mb-3">
          <label className="form-label">
            Email Address
          </label>

          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Password
          </label>

          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
          />
        </div>

        <div className="d-flex justify-content-between mb-4">

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="remember"
            />

            <label
              className="form-check-label"
              htmlFor="remember"
            >
              Remember me
            </label>
          </div>

          <a href="#">
            Forgot Password?
          </a>

        </div>

        <button className="btn btn-primary w-100 py-2">
          Login
        </button>

      </form>

      <hr />

      <p className="text-center">

        Don't have an account?

        <Link
          to="/register"
          className="ms-2 text-decoration-none fw-bold"
        >
          Register
        </Link>

      </p>

    </AuthLayout>
  );
}

export default Login;