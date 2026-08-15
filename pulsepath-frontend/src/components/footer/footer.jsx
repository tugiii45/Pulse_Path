function Footer() {
  return (
    <footer className="bg-light border-top mt-auto">
      <div className="container py-4">
        <div className="row align-items-center">

          {/* Brand */}
          <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
            <span className="fw-bold text-dark">
              PulsePath
            </span>

            <span className="text-muted ms-2">
              Healthcare Management System
            </span>
          </div>

          {/* Copyright */}
          <div className="col-md-6 text-center text-md-end">
            <small className="text-muted">
              &copy; {new Date().getFullYear()} PulsePath. All rights reserved.
            </small>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;