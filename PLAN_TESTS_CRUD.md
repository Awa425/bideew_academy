# Plan de Tests CRUD - Bideew Academy

**Date**: 11 novembre 2025
**Version**: 1.0
**Application**: http://localhost:4200

---

## 📋 Préparation des Tests

### Comptes de Test Requis

Pour tester toutes les fonctionnalités, vous aurez besoin de 3 types de comptes :

1. **Admin** - Peut tout faire
2. **Formateur** - Peut créer/modifier/supprimer ses cours et leçons
3. **Apprenant** - Peut consulter et suivre les cours

### Vérifier que l'application tourne

```bash
# Terminal 1 - Frontend Angular
cd C:\Users\HP\Documents\bideew_academy
npm start
# Devrait être sur http://localhost:4200

# Terminal 2 - Backend Laravel
cd C:\Users\HP\Documents\api_bidew_academy
php artisan serve
# Devrait être sur http://localhost:8000
```

---

## 🎯 TESTS DES COURS

### ✅ TEST 1: Création de Cours (FORMATEUR/ADMIN)

**Prérequis**: Connecté en tant que formateur ou admin

**Étapes**:
1. Aller sur la page d'accueil
2. Cliquer sur "Créer un cours" ou naviguer vers `/courses/create`
3. Remplir le formulaire:
   - **Titre**: "Test - Introduction à Angular"
   - **Description**: "Ce cours couvre les bases d'Angular 19"
   - **Catégorie**: "Développement Web"
   - **Prérequis**: "Connaissances en JavaScript"
   - **Objectif**: "Maîtriser les composants Angular"
   - **Niveau**: Beginner
   - **Durée**: 120 minutes
   - **Image**: Choisir une image (JPG/PNG, < 5MB)
4. Cliquer sur "Créer le cours"

**Résultat attendu**:
- ✅ Message de succès affiché (snackbar Material)
- ✅ Redirection vers la liste des cours
- ✅ Le nouveau cours apparaît dans la liste
- ✅ L'image est affichée correctement

**Points à vérifier**:
- ❌ Essayer de soumettre sans titre → Message d'erreur
- ❌ Essayer avec une image > 5MB → Message d'erreur
- ❌ Essayer avec un fichier PDF au lieu d'image → Message d'erreur

---

### ✅ TEST 2: Lecture/Affichage des Cours (TOUS)

**Prérequis**: Connecté (n'importe quel rôle)

**Étapes**:
1. Aller sur `/courses`
2. Observer la liste des cours

**Résultat attendu**:
- ✅ Liste paginée des cours affichée
- ✅ Chaque cours montre: titre, description, image, durée, niveau
- ✅ Pour **formateur**: boutons "Modifier" et "Supprimer" visibles
- ✅ Pour **apprenant**: bouton "Commencer le cours" visible
- ✅ Pagination fonctionne (si > 10 cours)

**Test de recherche**:
- Taper dans la barre de recherche
- ✅ Les cours sont filtrés en temps réel

---

### ✅ TEST 3: Modification de Cours (FORMATEUR/ADMIN)

**Prérequis**: Connecté en tant que formateur/admin, avoir créé un cours

**Étapes**:
1. Sur la liste des cours, cliquer sur "Modifier" pour le cours de test
2. Modifier les champs:
   - **Titre**: "Test - Angular Avancé" (modifier)
   - **Durée**: 180 minutes (modifier)
   - **Niveau**: Intermediate (modifier)
3. (Optionnel) Changer l'image
4. Cliquer sur "Enregistrer les modifications"

**Résultat attendu**:
- ✅ Message de succès affiché
- ✅ Redirection vers la liste
- ✅ Les modifications sont visibles
- ✅ Si image changée, la nouvelle image s'affiche

**Points à vérifier**:
- ✅ Les anciennes valeurs sont pré-remplies dans le formulaire
- ✅ Message de confirmation si on essaie de quitter avec modifications non sauvegardées

---

### ✅ TEST 4: Suppression de Cours (FORMATEUR/ADMIN)

**Prérequis**: Connecté en tant que formateur/admin

**Étapes**:
1. Sur la liste des cours, cliquer sur "Supprimer"
2. Une modal de confirmation apparaît
3. Confirmer la suppression

**Résultat attendu**:
- ✅ Modal de confirmation s'affiche
- ✅ Après confirmation: message de succès
- ✅ Le cours disparaît de la liste
- ✅ Si on annule: le cours reste dans la liste

**Sécurité**:
- ❌ Connecté en tant qu'apprenant: bouton "Supprimer" ne doit PAS être visible

---

## 📚 TESTS DES LEÇONS

### ✅ TEST 5: Ajout de Leçon TEXTE (FORMATEUR/ADMIN)

**Prérequis**: Avoir un cours créé, connecté en tant que formateur/admin

**Étapes**:
1. Ouvrir un cours
2. Cliquer sur "Ajouter une leçon" ou "NOUVEAU LECONS"
3. Naviguer vers `/courses/{id}/addlessons`
4. Sélectionner le type: **TEXTE**
5. Remplir:
   - **Titre**: "Introduction aux composants"
   - **Durée**: 30 minutes
   - **Ordre**: 1
   - **Contenu texte**: Écrire un long texte avec plusieurs paragraphes
6. Cocher "Publié"
7. Soumettre

**Résultat attendu**:
- ✅ Message de succès
- ✅ Redirection vers la liste des leçons du cours
- ✅ La nouvelle leçon apparaît

**Test de lecture**:
1. Cliquer sur la leçon
2. ✅ Le contenu texte est affiché
3. ✅ Navigation par slides fonctionne (si le texte est long)
4. ✅ **Sécurité**: Pas de script malveillant exécuté (XSS bloqué)

---

### ✅ TEST 6: Ajout de Leçon VIDÉO - Mode URL (FORMATEUR/ADMIN)

**Étapes**:
1. Ajouter une nouvelle leçon
2. Type: **VIDÉO**
3. Remplir:
   - **Titre**: "Tutoriel vidéo"
   - **Durée**: 45 minutes
   - **Ordre**: 2
4. Choisir mode: **URL externe**
5. Coller une URL YouTube ou Vimeo (ex: https://www.youtube.com/watch?v=...)
6. Soumettre

**Résultat attendu**:
- ✅ Leçon créée avec succès
- ✅ En lecture: la vidéo s'affiche et est lisible
- ✅ Boutons précédent/suivant fonctionnent
- ✅ Progression de la vidéo est sauvegardée

---

### ✅ TEST 7: Ajout de Leçon VIDÉO - Mode Upload (FORMATEUR/ADMIN)

**Étapes**:
1. Ajouter une nouvelle leçon
2. Type: **VIDÉO**
3. Choisir mode: **Upload fichier**
4. Sélectionner un fichier vidéo (MP4, < 100MB recommandé)
5. Soumettre

**Résultat attendu**:
- ✅ Upload réussi
- ✅ Vidéo lisible depuis le serveur
- ✅ Bouton "Télécharger" fonctionne

**Points à vérifier**:
- ❌ Essayer avec un fichier non-vidéo → Erreur
- ❌ Fichier trop volumineux → Erreur ou timeout

---

### ✅ TEST 8: Ajout de Leçon PDF (FORMATEUR/ADMIN)

**Étapes**:
1. Ajouter une nouvelle leçon
2. Type: **PDF**
3. Remplir:
   - **Titre**: "Support de cours PDF"
   - **Durée**: 20 minutes
4. Uploader un fichier PDF
5. Soumettre

**Résultat attendu**:
- ✅ Upload réussi
- ✅ En lecture: PDF s'affiche avec ng2-pdf-viewer
- ✅ Navigation de pages fonctionne (première, précédente, suivante, dernière)
- ✅ Zoom in/out fonctionne
- ✅ Téléchargement du PDF fonctionne

**Points à vérifier**:
- ❌ Uploader un fichier non-PDF → Erreur

---

### ✅ TEST 9: Ajout de Leçon QUIZ (FORMATEUR/ADMIN)

**Étapes**:
1. Ajouter une nouvelle leçon/quiz
2. Type: **QUIZ**
3. Remplir:
   - **Titre du quiz**: "Quiz final Angular"
   - **Description**: "Testez vos connaissances"
4. Ajouter au moins 3 questions:

**Question 1** (Choix unique):
- **Type**: Single choice
- **Texte**: "Qu'est-ce qu'un composant Angular ?"
- **Réponses**:
  - Une classe TypeScript ✅ (cocher "Correcte")
  - Un fichier HTML ❌
  - Une fonction JavaScript ❌

**Question 2** (Choix multiple):
- **Type**: Multiple choice
- **Texte**: "Quels sont les fichiers d'un composant Angular ?"
- **Réponses**:
  - .ts ✅ (cocher "Correcte")
  - .html ✅ (cocher "Correcte")
  - .scss ✅ (cocher "Correcte")
  - .java ❌

**Question 3** (Texte libre):
- **Type**: Text
- **Texte**: "Expliquez ce qu'est le Data Binding"
- (Pas de réponses prédéfinies)

5. Soumettre

**Résultat attendu**:
- ✅ Quiz créé avec succès
- ✅ En lecture (apprenant): les questions s'affichent
- ✅ Apprenant peut répondre
- ✅ Après soumission: score calculé et affiché
- ✅ Bonnes/mauvaises réponses indiquées

---

### ✅ TEST 10: Modification de Leçon (FORMATEUR/ADMIN) ⭐ NOUVEAU

**Prérequis**: Avoir créé une leçon

**Étapes**:
1. Sur la liste des leçons, cliquer sur "Modifier"
2. Modifier le titre et la durée
3. (Si vidéo/PDF) Changer le fichier
4. Cliquer sur "Enregistrer"

**Résultat attendu**:
- ✅ Message de succès (Material Snackbar, PAS alert())
- ✅ Modifications sauvegardées
- ✅ Si fichier changé: nouveau fichier utilisé

**Note**: Correction appliquée - FormData est maintenant utilisé correctement.

---

### ✅ TEST 11: Suppression de Leçon (FORMATEUR/ADMIN) ⭐ NOUVEAU

**Prérequis**: Avoir créé plusieurs leçons

**Étapes**:
1. Sur la liste des leçons d'un cours
2. Connecté en tant que **formateur** ou **admin**
3. Cliquer sur le bouton rouge "Supprimer" sur une leçon
4. Modal de confirmation s'affiche
5. Confirmer la suppression

**Résultat attendu**:
- ✅ Bouton "Supprimer" est rouge (color="warn")
- ✅ Modal avec message d'avertissement s'affiche
- ✅ Texte indique que l'action est irréversible
- ✅ Après confirmation: message de succès
- ✅ La leçon disparaît de la liste
- ✅ Si annulation: leçon reste dans la liste

**Sécurité - Vérifier les rôles**:
1. Se connecter en tant qu'**apprenant**
2. Aller sur la liste des leçons
3. ✅ Le bouton "Supprimer" ne doit PAS être visible
4. Se connecter en tant que **formateur**
5. ✅ Le bouton "Supprimer" est visible
6. Se connecter en tant qu'**admin**
7. ✅ Le bouton "Supprimer" est visible

---

### ✅ TEST 12: Lecture de Leçon TEXTE (APPRENANT)

**Prérequis**: Connecté en tant qu'apprenant, cours avec leçon texte

**Étapes**:
1. Démarrer un cours
2. Cliquer sur une leçon de type TEXTE
3. Lire le contenu

**Résultat attendu**:
- ✅ Contenu affiché correctement
- ✅ Navigation entre slides (si applicable)
- ✅ Boutons "Suivant" / "Précédent" fonctionnent
- ✅ **Sécurité**: HTML sanitisé (protection XSS) ⭐ CORRIGÉ

**Test de sécurité XSS** (pour développeur):
- Créer une leçon avec contenu: `<script>alert('XSS')</script>`
- ✅ En lecture: le script ne doit PAS s'exécuter
- ✅ Le contenu est affiché comme texte ou filtré

---

### ✅ TEST 13: Lecture de Leçon VIDÉO (APPRENANT)

**Prérequis**: Connecté en tant qu'apprenant

**Étapes**:
1. Démarrer une leçon vidéo
2. Lancer la lecture
3. Avancer dans la vidéo
4. Cliquer sur "Marquer comme terminé"
5. Cliquer sur "Leçon suivante"

**Résultat attendu**:
- ✅ Vidéo se charge et est lisible
- ✅ Barre de progression de la vidéo fonctionne
- ✅ Progression sauvegardée localement
- ✅ Bouton "Télécharger" fonctionne
- ✅ **Navigation**: Bouton "Leçon suivante" mène à la leçon suivante (PAS à la liste) ⭐ CORRIGÉ
- ✅ **Navigation**: Bouton "Leçon précédente" mène à la leçon précédente ⭐ CORRIGÉ

**Test de navigation** (Important):
1. Être sur la leçon vidéo #2
2. Cliquer "Leçon suivante"
3. ✅ Doit aller sur la leçon #3, PAS sur la liste des leçons
4. Cliquer "Leçon précédente"
5. ✅ Doit retourner sur la leçon #2

---

### ✅ TEST 14: Lecture de Leçon PDF (APPRENANT)

**Étapes**:
1. Ouvrir une leçon PDF
2. Naviguer entre les pages
3. Zoomer/dézoomer
4. Télécharger le PDF

**Résultat attendu**:
- ✅ PDF s'affiche correctement
- ✅ Boutons de navigation (première, précédente, suivante, dernière page) fonctionnent
- ✅ Zoom in/out/reset fonctionnent
- ✅ Téléchargement fonctionne
- ✅ Compteur de pages affiché (ex: "3 / 15")

---

### ✅ TEST 15: Passage de Quiz (APPRENANT)

**Prérequis**: Avoir complété au moins 80% des leçons

**Étapes**:
1. Accéder au quiz final
2. Répondre à toutes les questions
3. Soumettre le quiz

**Résultat attendu**:
- ✅ Questions affichées aléatoirement
- ✅ Boutons radio pour choix unique
- ✅ Checkboxes pour choix multiples
- ✅ Champ texte pour questions ouvertes
- ✅ Après soumission: score calculé et affiché
- ✅ Bonnes/mauvaises réponses indiquées
- ✅ Si score > 70%: possibilité de générer le certificat

---

## 🔐 TESTS DE SÉCURITÉ ET PERMISSIONS

### ✅ TEST 16: Vérification des Rôles

**Test 1: Apprenant**
- Se connecter en tant qu'apprenant
- ✅ Bouton "Créer un cours" → NON visible
- ✅ Boutons "Modifier"/"Supprimer" cours → NON visibles
- ✅ Bouton "Ajouter leçon" → NON visible
- ✅ Boutons "Modifier"/"Supprimer" leçons → NON visibles
- ✅ Bouton "Commencer le cours" → Visible
- ✅ Progression affichée

**Test 2: Formateur**
- Se connecter en tant que formateur
- ✅ Bouton "Créer un cours" → Visible
- ✅ Boutons "Modifier"/"Supprimer" SES cours → Visibles
- ✅ Bouton "Ajouter leçon" → Visible
- ✅ Boutons "Modifier"/"Supprimer" leçons → Visibles ⭐ NOUVEAU
- ✅ Peut voir tous les cours mais modifier seulement les siens

**Test 3: Admin**
- Se connecter en tant qu'admin
- ✅ Tous les boutons de gestion visibles
- ✅ Peut modifier/supprimer tous les cours
- ✅ Peut modifier/supprimer toutes les leçons ⭐ NOUVEAU
- ✅ Accès à la gestion des utilisateurs

---

### ✅ TEST 17: Sécurité du Token

**Étapes**:
1. Se connecter
2. Ouvrir DevTools → Application → Session Storage
3. Vérifier les clés stockées

**Résultat attendu**:
- ✅ Token stocké dans `bideew_auth_token` (sessionStorage)
- ✅ Valeur en base64 (cryptée/obfusquée)
- ❌ Pas de `access_token` en clair dans localStorage
- ✅ Si on copie le token et le décode (atob): résultat inintelligible

**Test d'expiration**:
1. Attendre l'expiration du token (ou modifier manuellement)
2. Essayer d'accéder à une page protégée
3. ✅ Redirection automatique vers `/auth/login`
4. ✅ Message: "Session expirée. Veuillez vous reconnecter."

---

## 📊 RÉCAPITULATIF DES TESTS

### Cours (4 tests)
- [x] Création
- [x] Lecture/Affichage
- [x] Modification
- [x] Suppression

### Leçons (11 tests)
- [x] Ajout leçon TEXTE
- [x] Ajout leçon VIDÉO (URL)
- [x] Ajout leçon VIDÉO (Upload)
- [x] Ajout leçon PDF
- [x] Ajout QUIZ
- [x] Modification leçon ⭐ NOUVEAU
- [x] Suppression leçon ⭐ NOUVEAU
- [x] Lecture TEXTE (avec sanitization XSS) ⭐ CORRIGÉ
- [x] Lecture VIDÉO (navigation corrigée) ⭐ CORRIGÉ
- [x] Lecture PDF
- [x] Passage Quiz

### Sécurité (2 tests)
- [x] Vérification des rôles
- [x] Sécurité du token

**Total**: 17 scénarios de test

---

## 🐛 PROBLÈMES CONNUS CORRIGÉS

### ✅ Corrections Appliquées (11/11/2025)

1. **Sécurité XSS** - TextLessonComponent
   - ✅ HTML maintenant sanitisé avec DomSanitizer
   - Protection contre l'injection de scripts malveillants

2. **Modification de leçon**
   - ✅ Utilise maintenant FormData au lieu de JSON
   - ✅ Gère correctement les fichiers (vidéo, PDF)
   - ✅ Notifications Material au lieu de alert()

3. **Suppression de leçon**
   - ✅ Endpoint API ajouté dans CourseService
   - ✅ Bouton "Supprimer" ajouté dans l'UI
   - ✅ Modal de confirmation implémentée
   - ✅ Gestion des rôles (admin/formateur uniquement)

4. **Navigation vidéo**
   - ✅ Boutons précédent/suivant naviguent maintenant vers la bonne leçon
   - ✅ Ne redirigent plus vers la liste

5. **Stockage sécurisé**
   - ✅ SecureStorageService implémenté
   - ✅ Tokens cryptés dans sessionStorage
   - ✅ Validation automatique d'expiration

---

## 📝 RAPPORT DE BUGS

Si vous trouvez des bugs pendant les tests, notez-les ici :

### Format de rapport:
```
**Bug #X**: [Titre court]
**Sévérité**: Critique / Majeur / Mineur
**Étapes de reproduction**:
1. ...
2. ...

**Résultat actuel**: ...
**Résultat attendu**: ...
**Capture d'écran**: [Si applicable]
```

---

## ✅ CHECKLIST FINALE

Avant de déployer en production:

### Fonctionnel
- [ ] Tous les tests CRUD passent
- [ ] Tous les types de leçons fonctionnent
- [ ] Navigation entre leçons OK
- [ ] Quiz fonctionnel
- [ ] Certificats générés

### Sécurité
- [ ] Tokens sécurisés (sessionStorage crypté)
- [ ] Validation d'expiration active
- [ ] XSS bloqué (sanitization HTML)
- [ ] Permissions par rôle respectées
- [ ] Pas de données sensibles en clair

### Performance
- [ ] Chargement des cours < 2s
- [ ] Vidéos se chargent correctement
- [ ] PDF s'affichent rapidement
- [ ] Pas de console.error en production

### UX
- [ ] Tous les messages utilisent NotificationService (pas alert())
- [ ] Modals de confirmation présentes
- [ ] Messages clairs et en français
- [ ] Icônes Material cohérentes

---

**Bon testing ! 🧪**

Si vous rencontrez des problèmes, consultez `CORRECTIONS_APPLIQUEES.md` pour les détails des correctifs.
