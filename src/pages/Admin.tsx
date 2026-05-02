import React from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  const handleReset = () => {
    const confirmReset = window.confirm("⚠️ Attention : Supprimer TOUS les projets et l'historique ?");
    
    if (confirmReset) {
      // 1. On vide tout le stockage
      localStorage.clear();
      
      // 2. On affiche un message rapide
      alert("Données réinitialisées avec succès.");

      // 3. LA REDIRECTION FORCEE : on reconstruit l'URL complète pour forcer le navigateur
      // On ajoute un slash à la fin pour être sûr que le serveur Vite nous renvoie à l'accueil
      window.location.href = window.location.origin + "/cordeslab/";
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#333", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        Panneau d'administration
      </h1>

      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ffcdd2", borderRadius: "12px", backgroundColor: "#fff5f5" }}>
        <h3 style={{ color: "#d32f2f", marginTop: 0 }}>Zone de danger</h3>
        <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
          Cette action est irréversible. Elle supprimera définitivement tous vos calculs enregistrés, 
          vos projets en cours et votre historique.
        </p>
        
        <button
          onClick={handleReset}
          style={{
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "opacity 0.2s",
            marginTop: "10px"
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          🔥 Réinitialiser l'application
        </button>
      </div>
      
      <button 
        onClick={() => navigate("/cordeslab")}
        style={{ marginTop: "20px", background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline" }}
      >
        Retour au Dashboard
      </button>
    </div>
  );
}