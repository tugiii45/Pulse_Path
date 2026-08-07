import { Link } from "react-router-dom";
import { FaArrowRight, FaHeartbeat } from "react-icons/fa";

function CTA() {
  return (
    <section className="py-5">

      <div className="container">

        <div
          className="rounded-5 p-5 text-center text-white"
          style={{
            background:
              "linear-gradient(135deg, #0d6efd, #087f8c)",
          }}
        >

          <FaHeartbeat className="fs-1 mb-3" />

          <h2 className="display-6 fw-bold">
            Your health journey deserves continuity.
          </h2>

          <p
            className="lead mx-auto my-4"
            style={{
              maxWidth: "650px",
            }}
          >
            Take control of your healthcare journey with PulsePath
            and stay connected from treatment to recovery.
          </p>

          <Link
            to="/register"
            className="btn btn-light btn-lg px-5 d-inline-flex align-items-center"
          >
            Get Started
            <FaArrowRight className="ms-2" />
          </Link>

        </div>

      </div>

    </section>
  );
}

export default CTA;