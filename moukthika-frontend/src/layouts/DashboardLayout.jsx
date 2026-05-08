import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-8">{children}</main>
      <Footer />
    </div>
  );
}

export default DashboardLayout;

