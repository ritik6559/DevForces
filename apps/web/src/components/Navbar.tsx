import { Link } from "react-router-dom";
import Logo from "./Logo";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/data";

const Navbar = () => {
  // const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Logo />

          {/* <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  location.pathname.startsWith(link.href) && link.href !== "#"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div> */}

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-mono text-xs font-bold">
                  YD
                </div>
                <span className="text-foreground font-medium">you_dev</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-lg shadow-xl py-1 z-50"
                  >
                    <Link to="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => setDropdownOpen(false)}>Profile</Link>
                    <button className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors" onClick={() => setDropdownOpen(false)}>Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border bg-card"
          >
            <div className="px-4 py-3 space-y-2">
              {navLinks.map(link => (
                <Link key={link.label} to={link.href} className="block py-2 text-sm text-foreground" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link to="/profile" className="block py-2 text-sm text-foreground" onClick={() => setMobileOpen(false)}>Profile</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;