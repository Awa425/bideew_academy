import { Injectable } from '@angular/core';

/**
 * Service de stockage sécurisé pour les données sensibles comme les tokens JWT.
 * Utilise sessionStorage avec encryption basique pour améliorer la sécurité.
 *
 * Note: Pour une sécurité maximale en production, utilisez httpOnly cookies côté serveur.
 */
@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly TOKEN_KEY = 'bideew_auth_token';
  private readonly USER_ID_KEY = 'bideew_user_id';
  private readonly USER_ROLE_KEY = 'bideew_user_role';
  private readonly USER_DATA_KEY = 'bideew_user_data';

  // Clé simple pour l'obfuscation (pas une vraie encryption)
  // En production, utilisez une vraie bibliothèque de cryptage ou httpOnly cookies
  private readonly ENCRYPTION_KEY = 'BideewAcademySecretKey2024';

  constructor() {}

  /**
   * Stocke le token JWT de manière sécurisée
   */
  setToken(token: string): void {
    if (!token) return;
    const encrypted = this.simpleEncrypt(token);
    sessionStorage.setItem(this.TOKEN_KEY, encrypted);
  }

  /**
   * Récupère le token JWT
   */
  getToken(): string | null {
    const encrypted = sessionStorage.getItem(this.TOKEN_KEY);
    if (!encrypted) return null;
    return this.simpleDecrypt(encrypted);
  }

  /**
   * Vérifie si le token existe et est valide
   * Note: Laravel Sanctum utilise des tokens opaques (pas des JWT)
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Vérification basique de la longueur du token
    // Les tokens Sanctum ressemblent à: "1|abcd1234..."
    if (token.length < 10) {
      return false;
    }

    // Pour Laravel Sanctum, on vérifie simplement que le token existe
    // La validation réelle se fait côté backend à chaque requête
    return true;
  }

  /**
   * Note: Laravel Sanctum n'utilise pas de JWT décodables
   * Cette méthode retourne null pour les tokens Sanctum
   */
  getTokenData(): any | null {
    // Les tokens Sanctum ne sont pas décodables
    // Utilisez getUserData() à la place pour obtenir les infos utilisateur
    return null;
  }

  /**
   * Note: Laravel Sanctum gère l'expiration côté serveur
   * Cette méthode retourne null car on ne peut pas déterminer l'expiration côté client
   */
  getTokenExpirationTime(): number | null {
    // Laravel Sanctum gère l'expiration côté serveur
    // Pas d'expiration côté client
    return null;
  }

  /**
   * Stocke l'ID utilisateur
   */
  setUserId(userId: string): void {
    if (!userId) return;
    const encrypted = this.simpleEncrypt(userId);
    sessionStorage.setItem(this.USER_ID_KEY, encrypted);
  }

  /**
   * Récupère l'ID utilisateur
   */
  getUserId(): string | null {
    const encrypted = sessionStorage.getItem(this.USER_ID_KEY);
    if (!encrypted) return null;
    return this.simpleDecrypt(encrypted);
  }

  /**
   * Stocke le rôle utilisateur
   */
  setUserRole(role: string): void {
    if (!role) return;
    const encrypted = this.simpleEncrypt(role);
    sessionStorage.setItem(this.USER_ROLE_KEY, encrypted);
  }

  /**
   * Récupère le rôle utilisateur
   */
  getUserRole(): string | null {
    const encrypted = sessionStorage.getItem(this.USER_ROLE_KEY);
    if (!encrypted) return null;
    return this.simpleDecrypt(encrypted);
  }

  /**
   * Stocke les données utilisateur complètes
   */
  setUserData(userData: any): void {
    if (!userData) return;
    const json = JSON.stringify(userData);
    const encrypted = this.simpleEncrypt(json);
    sessionStorage.setItem(this.USER_DATA_KEY, encrypted);
  }

  /**
   * Récupère les données utilisateur
   */
  getUserData(): any | null {
    const encrypted = sessionStorage.getItem(this.USER_DATA_KEY);
    if (!encrypted) return null;

    try {
      const decrypted = this.simpleDecrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  /**
   * Nettoie toutes les données stockées
   */
  clearAll(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_ID_KEY);
    sessionStorage.removeItem(this.USER_ROLE_KEY);
    sessionStorage.removeItem(this.USER_DATA_KEY);
  }

  /**
   * Migration des données de localStorage vers le stockage sécurisé
   * À appeler au démarrage de l'app pour migrer les anciennes données
   */
  migrateFromLocalStorage(): void {
    // Migrer le token (plusieurs noms possibles)
    const oldToken = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (oldToken) {
      this.setToken(oldToken);
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
    }

    // Migrer l'ID utilisateur
    const oldUserId = localStorage.getItem('user_id');
    if (oldUserId) {
      this.setUserId(oldUserId);
      localStorage.removeItem('user_id');
    }

    // Migrer le rôle
    const oldRole = localStorage.getItem('user_role');
    if (oldRole) {
      this.setUserRole(oldRole);
      localStorage.removeItem('user_role');
    }

    // Nettoyer les autres clés legacy
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
  }

  /**
   * Encryption simple (obfuscation) - NE PAS utiliser pour des données ultra-sensibles
   * En production, utilisez crypto-js ou une vraie bibliothèque de cryptage
   */
  private simpleEncrypt(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Base64 encode
  }

  /**
   * Decryption simple
   */
  private simpleDecrypt(encrypted: string): string {
    try {
      const decoded = atob(encrypted); // Base64 decode
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      return '';
    }
  }
}
