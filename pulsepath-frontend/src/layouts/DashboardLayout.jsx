import { Outlet } from "react-router-dom";

import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import Footer from "../components/footer/Footer";

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