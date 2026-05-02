import { Link } from "react-router-dom";

export default function AccessBlocked() {
  return (
    <div className="accessBlockedPage">
      <div className="card accessBlockedCard">
        <h1 className="accessBlockedTitle">Accès désactivé</h1>

        <p className="muted accessBlockedText">
          Votre accès à la Web App CordesLab a été désactivé suite au
          remboursement de la formation.
        </p>

        <div className="accessBlockedActions">
          <a className="btn primary" href="mailto:support@cordeslab.com">
            Contacter le support
          </a>

          <Link className="btn" to="/">
            Retour
          </Link>
        </div>
      </div>
    </div>
  );
}