# Guide de Test des Corrections

## 🧪 Comment Tester les Corrections Appliquées

### Prérequis
```bash
# 1. Installer les dépendances (si pas déjà fait)
npm install

# 2. Vérifier qu'il n'y a pas d'erreurs de compilation
ng build
```

---

## Tests à Effectuer

### 1. ✅ Test du Stockage Sécurisé

**Scénario A: Nouvelle connexion**
1. Ouvrir l'application en mode incognito
2. Se connecter avec des identifiants valides
3. Ouvrir DevTools > Application > Session Storage
4. Vérifier que les clés suivantes existent (avec valeurs cryptées):
   - `bideew_auth_token`
   - `bideew_user_id`
   - `bideew_user_role`
   - `bideew_user_data`
5. ✅ Les valeurs doivent être en base64 (cryptées)
6. ✅ Aucune clé ne doit exister dans LocalStorage (sauf anciennes à migrer)

**Scénario B: Migration automatique**
1. Dans DevTools > Application > Local Storage:
   - Ajouter manuellement: `access_token` = "test_token"
   - Ajouter manuellement: `user_id` = "123"
   - Ajouter manuellement: `user_role` = "admin"
2. Rafraîchir la page
3. ✅ Ces clés doivent être supprimées de LocalStorage
4. ✅ Elles doivent apparaître (cryptées) dans SessionStorage

**Scénario C: Validation d'expiration**
1. Se connecter normalement
2. Dans la console, exécuter:
   ```javascript
   // Obtenir le service
   const authService = ng.probe(document.querySelector('app-root')).injector.get(AuthService);

   // Vérifier le temps restant
   console.log('Temps restant:', authService.getTokenExpirationTime(), 'secondes');
   ```
3. ✅ Le temps doit être affiché correctement
4. Attendre l'expiration du token (ou modifier manuellement)
5. ✅ L'utilisateur doit être déconnecté automatiquement

---

### 2. ✅ Test de l'Intercepteur HTTP

**Scénario A: Erreur 401 (Token expiré)**
1. Se connecter normalement
2. Supprimer le token dans SessionStorage
3. Essayer d'accéder à une page protégée (ex: /courses)
4. ✅ Redirection automatique vers /auth/login
5. ✅ Message d'erreur: "Session expirée. Veuillez vous reconnecter."

**Scénario B: Erreur 404**
1. Modifier temporairement une URL d'API dans course.service.ts (ajouter /invalid)
2. Essayer de charger la liste des cours
3. ✅ Message d'erreur dans la console: "Ressource non trouvée."
4. ✅ Pas de crash de l'application

**Scénario C: Erreur réseau (serveur éteint)**
1. Arrêter le serveur backend
2. Essayer de se connecter
3. ✅ Message: "Impossible de se connecter au serveur. Vérifiez votre connexion Internet."

---

### 3. ✅ Test de l'Environnement de Production

**Configuration du fichier angular.json** (À FAIRE si pas déjà fait)

Ajouter dans `angular.json`:
```json
{
  "projects": {
    "bideew_academy": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environments.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

**Test**:
```bash
# Build de production
ng build --configuration production

# Vérifier les fichiers générés
ls dist/

# Vérifier que les URLs de production sont utilisées
# Ouvrir dist/.../main.*.js et chercher "academy.bideewtech.com"
```

✅ Les URLs doivent être celles de production

---

### 4. ✅ Test de Gestion d'Erreurs (Notifications)

**Scénario A: Validation de formulaire cours**
1. Aller sur /courses/create
2. Essayer de soumettre sans remplir les champs
3. ✅ Un snackbar Material doit s'afficher avec: "Le titre du cours est obligatoire"
4. ✅ Pas de alert() JavaScript natif

**Scénario B: Upload de fichier**
1. Aller sur /courses/create
2. Essayer d'uploader une image > 5MB
3. ✅ Snackbar: "Le fichier est trop volumineux. Taille maximum : 5MB"
4. Essayer d'uploader un fichier .pdf au lieu d'image
5. ✅ Snackbar: "Type de fichier non autorisé. Utilisez JPEG, PNG ou GIF."

---

### 5. ✅ Test de l'Architecture Standalone

**Vérification**:
1. Chercher l'existence de app.module.ts:
   ```bash
   ls src/app/app.module.ts
   ```
   ✅ Doit retourner "fichier introuvable" ou erreur

2. Vérifier main.ts:
   ```bash
   cat src/main.ts
   ```
   ✅ Doit contenir:
   - `bootstrapApplication(AppComponent, ...)`
   - `provideHttpClient(withInterceptors([httpErrorInterceptor]))`
   - `provideRouter(routes)`
   - `provideAnimations()`

3. Lancer l'application:
   ```bash
   npm start
   ```
   ✅ Aucune erreur de compilation
   ✅ L'application démarre correctement

---

## 🔍 Tests de Sécurité

### Test 1: Vérifier que les tokens ne sont pas en clair

1. Se connecter
2. DevTools > Application > Session Storage
3. Copier la valeur de `bideew_auth_token`
4. Essayer de la décoder en base64:
   ```javascript
   atob(valeur_copiée)
   ```
5. ✅ Le résultat doit être inintelligible (crypté)
6. ✅ Ce n'est PAS directement le token JWT en clair

### Test 2: Vérifier la déconnexion sur expiration

1. Se connecter
2. Dans la console:
   ```javascript
   // Obtenir le SecureStorageService
   const storage = ng.probe(document.querySelector('app-root')).injector.get(SecureStorageService);

   // Vérifier la validité
   console.log('Token valide?', storage.isTokenValid());
   ```
3. ✅ Doit retourner `true` si connecté récemment
4. Modifier manuellement le token pour le faire expirer
5. Rafraîchir ou naviguer
6. ✅ Déconnexion automatique

---

## 🐛 Tests de Régression

### Fonctionnalités à vérifier (doivent toujours fonctionner):

- [ ] Login avec email/password
- [ ] Login avec Google OAuth
- [ ] Déconnexion
- [ ] Création de cours (formateur)
- [ ] Modification de cours
- [ ] Suppression de cours
- [ ] Ajout de leçons
- [ ] Visualisation de leçons (texte, vidéo, PDF)
- [ ] Quiz et calcul de score
- [ ] Génération de certificat PDF
- [ ] Gestion des utilisateurs (admin)
- [ ] Parcours d'apprentissage
- [ ] Progression des cours
- [ ] Navigation entre les pages
- [ ] Thème dark/light mode
- [ ] Accessibilité (toolbar)

---

## 📊 Checklist Finale Avant Production

### Code
- [ ] Aucune erreur de compilation: `ng build --configuration production`
- [ ] Aucun warning TypeScript
- [ ] Tests manuels passés
- [ ] alert() supprimés (ou au minimum dans course-form)
- [ ] console.log() importants commentés/supprimés

### Configuration
- [ ] environment.prod.ts avec les bonnes URLs
- [ ] angular.json configuré pour fileReplacements
- [ ] Google Client ID dans environment

### Sécurité
- [ ] Tokens en sessionStorage (cryptés)
- [ ] Validation d'expiration active
- [ ] Intercepteur HTTP enregistré
- [ ] Redirection 401 vers login

### Backend
- [ ] API accessible depuis l'URL de production
- [ ] CORS configuré correctement
- [ ] Tokens JWT générés avec expiration
- [ ] Endpoints testés avec Postman/Insomnia

---

## 🆘 Dépannage

### Problème: "Cannot find module SecureStorageService"
**Solution**: Vérifier que le fichier existe:
```bash
ls src/app/core/services/secure-storage.service.ts
```

### Problème: Erreur de compilation sur httpErrorInterceptor
**Solution**: Vérifier l'import dans main.ts:
```typescript
import { httpErrorInterceptor } from './app/core/interceptors/http-error.interceptor.func';
```

### Problème: LocalStorage encore utilisé
**Solution**: Vérifier les imports et chercher les occurrences:
```bash
grep -r "localStorage.getItem" src/app/core/services/
```

### Problème: L'app ne démarre pas
**Solution**:
1. Vérifier la console navigateur
2. Vérifier les erreurs de compilation
3. Supprimer node_modules et réinstaller:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 📞 Support

Si vous rencontrez des problèmes après ces corrections:

1. Vérifier ce document et CORRECTIONS_APPLIQUEES.md
2. Consulter la console navigateur (F12)
3. Vérifier les logs du serveur backend
4. Comparer avec le code avant modifications (git diff)

---

**Bonne chance avec les tests ! 🚀**
