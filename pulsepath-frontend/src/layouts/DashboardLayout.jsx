// Shared shell for protected pages: dashboard navigation, page outlet, and footer.
import { Outlet } from "react-router-dom";

import Navbar from "../components/navbar/navbar";
import Sidebar from "../components/sidebar/sidebar";
import Footer from "../components/footer/footer";

function DashboardLayout() {
  return (
    <>
      <Navbar />

      <div className="d-flex">
        <Sidebar />

        <main className="flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>

      <Footer />
    </>
  );
}

export default DashboardLayout;