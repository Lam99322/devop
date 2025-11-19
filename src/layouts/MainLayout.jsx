import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div style={{ minHeight: "80vh" }}>{children}</div>
      <Footer />
    </div>
  );
}
