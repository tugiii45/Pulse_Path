import AuthLayout from "../../layouts/AuthLayout";

function Register() {
  return (
    <AuthLayout>
      <h3 className="mb-4">Create Account</h3>

      <form>
        <div className="mb-3">
          <label className="form-label">Full Name</label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter your full name"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>

          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>

          <input
            type="password"
            className="form-control"
            placeholder="Create a password"
          />
        </div>

        <button className="btn btn-success w-100">
          Register
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;