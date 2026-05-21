import { useState, useEffect } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewCalc from "./pages/NewCalc";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Offers from "./pages/Offers";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";

import { LogoMark } from "./components/LogoMark";

// ─── Système de token Pro ─────────────────────────────────────────────────────

const VALID_TOKEN = "CDB-PRO-X7K2";
const STORAGE_KEY_PLAN     = "cordeslab_plan";
const STORAGE_KEY_EXPIRY   = "cordeslab_plan_expiry";
const SIX_MONTHS_MS        = 6 * 30 * 24 * 60 * 60 * 1000;

export function getUserPlan(): "Atelier" | "Creator" | "Pro" {
  try {
    const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY);
    const plan   = localStorage.getItem(STORAGE_KEY_PLAN);
    if (plan === "Pro" && expiry && Date.now() < parseInt(expiry)) {
      return "Pro";
    }
    localStorage.removeItem(STORAGE_KEY_PLAN);
    localStorage.removeItem(STORAGE_KEY_EXPIRY);
  } catch { /* ignore */ }
  return "Atelier";
}

function activateProFromToken(token: string): boolean {
  if (token !== VALID_TOKEN) return false;
  try {
    const expiry = Date.now() + SIX_MONTHS_MS;
    localStorage.setItem(STORAGE_KEY_PLAN,   "Pro");
    localStorage.setItem(STORAGE_KEY_EXPIRY, String(expiry));
    return true;
  } catch { return false; }
}

// ─── Suivi Google Analytics des routes React ─────────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
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
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    if (isInStandaloneMode) return;
    if (localStorage.getItem("installBannerDismissed")) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (isIOS) setVisible(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("installBannerDismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#3d2b1f", color: "#fff",
      padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
      zIndex: 9999, boxShadow: "0 -2px 12px rgba(0,0,0,0.2)",
    }}>
      <div style={{ fontSize: "14px", flex: 1 }}>
        📲 <strong>Installer CordesLab</strong> sur votre téléphone
        {isIOS && !deferredPrompt && (
          <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "4px" }}>
            Safari → icône Partager → "Sur l'écran d'accueil"
          </div>
        )}
      </div>
      {deferredPrompt && (
        <button onClick={handleInstall} style={{
          background: "#c8a97e", color: "#3d2b1f", border: "none",
          borderRadius: "6px", padding: "8px 14px", fontWeight: 600,
          cursor: "pointer", whiteSpace: "nowrap",
        }}>
          Installer
        </button>
      )}
      <button onClick={handleDismiss} style={{
        background: "transparent", border: "none", color: "#fff",
        fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "0 4px",
      }}>
        ×
      </button>
    </div>
  );
}

// ─── Bannière activation Pro ──────────────────────────────────────────────────

function ProActivationBanner({ onDismiss }: { onDismiss: () => void }) {
  const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY);
  const expiryDate = expiry
    ? new Date(parseInt(expiry)).toLocaleDateString("fr-FR")
    : "";

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.55)", zIndex: 99999,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "24px", padding: "36px 32px",
        maxWidth: "420px", width: "100%", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#006D6F", marginBottom: "10px" }}>
          Plan Pro activé !
        </h2>
        <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "8px" }}>
          Toutes les fonctionnalités CordesLab sont débloquées pour <strong>6 mois</strong>.
        </p>
        {expiryDate && (
          <p style={{ fontSize: "13px", color: "#999", marginBottom: "24px" }}>
            Accès valide jusqu'au <strong>{expiryDate}</strong>
          </p>
        )}
        <button onClick={onDismiss} style={{
          background: "#006D6F", color: "#fff", border: "none",
          padding: "14px 32px", borderRadius: "14px",
          fontWeight: "bold", fontSize: "15px", cursor: "pointer", width: "100%",
        }}>
          Commencer à tresser →
        </button>
      </div>
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    "topbar-link" + (isActive ? " active" : "");

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link to="/" className="brand" onClick={handleLinkClick}>
          <LogoMark className="brand-mark" />
          <div className="brand-text">
            <div className="brand-title">CordesLab</div>
            <div style={{
              fontSize: "10px", opacity: 0.7, fontWeight: 400,
              marginTop: "2px", whiteSpace: "nowrap",
            }}>
              Laboratoire Paracorde — by Corinne Chatelet · CordesEtMuseaux
            </div>
          </div>
        </Link>

        <button
          className="hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <span className={`hamburger-icon ${menuOpen ? "open" : ""}`}>
            <span /><span /><span />
          </span>
        </button>
      </div>

      <nav className={`topbar-nav ${menuOpen ? "mobile-open" : ""}`}>
        <NavLink to="/" className={linkClass} onClick={handleLinkClick}>Dashboard</NavLink>
        <NavLink to="/newcalc" className={linkClass} onClick={handleLinkClick}>Nouveau</NavLink>
        <NavLink to="/projects" className={linkClass} onClick={handleLinkClick}>Projets</NavLink>
        <NavLink to="/history" className={linkClass} onClick={handleLinkClick}>Historique</NavLink>
        <NavLink to="/offers" className={linkClass} onClick={handleLinkClick}>Offres</NavLink>
      </nav>
    </header>
  );
}

// ─── Composant interne avec accès au router ───────────────────────────────────

function AppInner() {
  const [showActivation, setShowActivation] = useState(false);

  usePageTracking();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    if (token) {
      const activated = activateProFromToken(token);
      if (activated) {
        setShowActivation(true);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <TopNav />
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/newcalc"   element={<NewCalc />} />
        <Route path="/projects"  element={<Projects />} />
        <Route path="/history"   element={<History />} />
        <Route path="/offers"    element={<Offers />} />
        <Route path="/settings"  element={<Settings />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin"     element={<Admin />} />
      </Routes>
      <InstallBanner />
      {showActivation && (
        <ProActivationBanner onDismiss={() => setShowActivation(false)} />
      )}
    </div>
  );
}

// ─── App principale ───────────────────────────────────────────────────────────

export default function App() {
  return <AppInner />;
}
