export const envVars  = {
  production: false, // false en développement, true dans environment.prod.ts

  // URL de l'API backend (à adapter selon ton serveur local ou distant)
  apiBaseUrl: 'http://localhost:8000/api',

  // URL du dossier de fichiers publics (ex: fichiers de cours, images, etc.)
  fileBaseUrl: 'http://localhost:8000/storage',

  // Autres configs personnalisées (clé de Google Maps, Firebase, etc.)
  appName: 'Bideew Academy',
  version: '1.0.0-dev',
};
