# CordesLab Web App — Starter (Vite + React + TS)

## 1) Lancer en local
1. Installer Node.js (18+)
2. Ouvrir un terminal dans ce dossier
3. `npm install`
4. `npm run dev`
5. Ouvrir l’URL affichée (ex: http://localhost:5173/cordeslab)

## 2) Publier sur IONOS
- On publie l’app dans un sous-dossier: `/cordeslab/`
- Le `vite.config.ts` est déjà configuré avec `base: '/cordeslab/'`.

Build:
- `npm run build`
- Uploader le contenu du dossier `dist/` via FTP dans `.../cordeslab/`.

## 3) Routing (important)
Sur hébergement statique, il faudra rediriger toutes les routes vers `index.html`.
On te fournira un `.htaccess` adapté IONOS quand tu seras prête à publier.

## Notes
- Cette v0.1 inclut déjà : Étape 1 + Étape 2 + moteur Cobra / Carré / King Cobra (estimé).
- PDF : export via impression navigateur (v0.1). On fera le vrai PDF “fiche coupe” ensuite.
