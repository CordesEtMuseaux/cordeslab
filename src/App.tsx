import { useState, useEffect } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewCalc from "./pages/NewCalc";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Offers from "./pages/Offers";
import GuidesLibrary from "./pages/GuidesLibrary";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";

import { LogoMark } from "./components/LogoMark";

// getUserPlan vit maintenant dans shared/catalog.ts (source unique de vérité,
// réutilisée par le calculateur ET la bibliothèque de guides). Ré-exporté ici
// pour ne rien casser si du code existant l'importe encore depuis "./App".
export { getUserPlan } from "./shared/catalog";

// ─── Suivi Google Analytics des routes React ─────────────────────────────────
declare global {
  interface Window { gtag?: (...args: any[]) => void; }
}

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location]);
}

// ─── Bannière installation PWA ────────────────────────────────────────────────
function InstallBanner() {
  const [visible, setVisible]             = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isIOS             = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    if (isInStandaloneMode) return;
    if (localStorage.getItem("installBannerDismissed")) return;
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", handler);
    if (isIOS) setVisible(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; setVisible(false); }
  };
  const handleDismiss = () => { localStorage.setItem("installBannerDismissed", "true"); setVisible(false); };

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#3d2b1f", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", zIndex: 9999, boxShadow: "0 -2px 12px rgba(0,0,0,0.2)" }}>
      <div style={{ fontSize: "14px", flex: 1 }}>
        📲 <strong>Installer CordesLab</strong> sur votre téléphone
        {isIOS && !deferredPrompt && <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "4px" }}>Safari → icône Partager → "Sur l'écran d'accueil"</div>}
      </div>
      {deferredPrompt && <button onClick={handleInstall} style={{ background: "#c8a97e", color: "#3d2b1f", border: "none", borderRadius: "6px", padding: "8px 14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Installer</button>}
      <button onClick={handleDismiss} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const linkClass = ({ isActive }: { isActive: boolean }) => "topbar-link" + (isActive ? " active" : "");
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link to="/" className="brand" onClick={handleLinkClick}>
          <LogoMark className="brand-mark" />
          <div className="brand-text">
            <div className="brand-title">CordesLab</div>
            <div style={{ fontSize: "10px", opacity: 0.7, fontWeight: 400, marginTop: "2px", whiteSpace: "nowrap" }}>
              Laboratoire Paracorde — by Corinne Chatelet · CordesEtMuseaux
            </div>
          </div>
        </Link>
        <button className="hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          <span className={`hamburger-icon ${menuOpen ? "open" : ""}`}><span /><span /><span /></span>
        </button>
      </div>
      <nav className={`topbar-nav ${menuOpen ? "mobile-open" : ""}`}>
        <NavLink to="/"         className={linkClass} onClick={handleLinkClick}>Dashboard</NavLink>
        <NavLink to="/newcalc"  className={linkClass} onClick={handleLinkClick}>Nouveau</NavLink>
        <NavLink to="/projects" className={linkClass} onClick={handleLinkClick}>Projets</NavLink>
        <NavLink to="/history"  className={linkClass} onClick={handleLinkClick}>Historique</NavLink>
        <NavLink to="/bibliotheque" className={linkClass} onClick={handleLinkClick}>Guides</NavLink>
        <NavLink to="/offers"   className={linkClass} onClick={handleLinkClick}>Offres</NavLink>
      </nav>
    </header>
  );
}

// ─── App principale ───────────────────────────────────────────────────────────
function AppInner() {
  usePageTracking();

  return (
    <div style={{ width: "100%" }}>
      <TopNav />
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/newcalc"   element={<NewCalc />} />
        <Route path="/projects"  element={<Projects />} />
        <Route path="/history"   element={<History />} />
        <Route path="/bibliotheque" element={<GuidesLibrary />} />
        <Route path="/offers"    element={<Offers />} />
        <Route path="/settings"  element={<Settings />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin"     element={<Admin />} />
      </Routes>
      <InstallBanner />
    </div>
  );
}

export default function App() {
  return <AppInner />;
}
