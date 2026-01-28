import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of, timeout, TimeoutError, from, ReplaySubject, firstValueFrom } from 'rxjs';
import { catchError, tap, map, switchMap, filter, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, SafeUser, LoginRequest, RegisterRequest, AuthTokens } from '../interfaces';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'kurro_access_token';
const REFRESH_TOKEN_KEY = 'kurro_refresh_token';
const USER_KEY = 'kurro_user';

/**
 * Servicio de autenticación con almacenamiento SEGURO de tokens.
 * 
 * ⚠️ SEGURIDAD: Los tokens se almacenan ÚNICAMENTE en Secure Storage:
 * - iOS: Keychain
 * - Android: EncryptedSharedPreferences (Android Keystore)
 * - Web: Web Crypto API con cifrado AES-GCM
 * 
 * NO se usa: localStorage, sessionStorage sin cifrar, IndexedDB, cookies, variables globales.
 * 
 * El access token se mantiene en memoria para acceso rápido y se persiste
 * en Secure Storage para restaurarlo al reiniciar la app.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  // Access token en memoria para acceso rápido
  private accessTokenInMemory: string | null = null;
  
  private currentUserSubject = new BehaviorSubject<SafeUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  // Indicador de que la autenticación ha sido inicializada (cargada del storage)
  private authInitializedSubject = new ReplaySubject<boolean>(1);
  public authInitialized$ = this.authInitializedSubject.asObservable();
  private _authInitialized = false;

  // Control de refresh en progreso para evitar llamadas duplicadas
  private refreshInProgress = false;
  private refreshPromise: Promise<AuthResponse> | null = null;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.loadStoredAuth();
  }

  /**
   * Espera a que la autenticación esté inicializada
   * Útil para componentes que necesitan esperar a que se cargue el usuario del storage
   */
  async waitForAuthInit(): Promise<void> {
    if (this._authInitialized) return;
    await firstValueFrom(this.authInitialized$.pipe(filter(v => v), take(1)));
  }

  /**
   * Cargar autenticación almacenada
   * Este método es más permisivo con errores para no cerrar sesión innecesariamente
   */
  private async loadStoredAuth(): Promise<void> {
    try {
      console.log('[Auth] Cargando autenticación del Secure Storage...');
      const token = await this.storage.get(TOKEN_KEY);
      const user = await this.storage.getObject<SafeUser>(USER_KEY);
      
     
      
      if (token && user) {
        // Guardar en memoria para acceso rápido
        this.accessTokenInMemory = token;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('[Auth] Sesión restaurada desde Secure Storage');
        
        // Verificar si el token está próximo a expirar
        if (this.isTokenExpiredSync(token, 300)) {
          console.log('[Auth] Token próximo a expirar, renovando...');
          this.refreshToken().subscribe({
            next: () => console.log('[Auth] Token renovado al iniciar'),
            error: (err) => console.warn('[Auth] Error renovando token al iniciar:', err)
          });
        }
      } else {
      }
    } catch (error) {
      // NO llamar a clearAuth() aquí - solo loguear el error
      // El storage podría estar temporalmente inaccesible
      console.warn('[Auth] Error al cargar autenticación del storage:', error);
    } finally {
      // Marcar la autenticación como inicializada (independientemente del resultado)
      this._authInitialized = true;
      this.authInitializedSubject.next(true);
    }
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      timeout(10000), // 10 segundos timeout
      switchMap(response => {
        if (response.success && response.tokens && response.user) {
          // Convertir la promesa a Observable
          return from(this.storeAuth(response.tokens, response.user)).pipe(
            map(() => response)
          );
        }
        return of(response);
      }),
      catchError(error => {
        
        if (error instanceof TimeoutError) {
          return throwError(() => ({
            status: 0,
            message: 'Tiempo de espera agotado. El servidor no responde.',
            error: 'timeout'
          }));
        }
        
        return this.handleError(error);
      })
    );
  }

  /**
   * Registro de nuevo usuario
   */
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData).pipe(
      timeout(10000), // 10 segundos timeout
      switchMap(response => {
        if (response.success && response.tokens && response.user) {
          // Convertir la promesa a Observable y guardar autenticación
          return from(this.storeAuth(response.tokens, response.user)).pipe(
            map(() => response)
          );
        }
        return of(response);
      }),
      catchError(error => {
        if (error instanceof TimeoutError) {
          return throwError(() => ({
            status: 0,
            message: 'Tiempo de espera agotado. El servidor no responde.',
            error: 'timeout'
          }));
        }
        
        return this.handleError(error);
      })
    );
  }

  /**
   * Refrescar tokens.
   * Implementa protección contra llamadas duplicadas y rotación de refresh token.
   */
  refreshToken(): Observable<AuthResponse> {
    // Si ya hay un refresh en progreso, esperar a que termine
    if (this.refreshInProgress && this.refreshPromise) {
      return from(this.refreshPromise);
    }

    this.refreshInProgress = true;
    
    this.refreshPromise = new Promise<AuthResponse>((resolve, reject) => {
      from(this.storage.get(REFRESH_TOKEN_KEY)).pipe(
        switchMap(refreshToken => {
          if (!refreshToken) {
            return from(this.clearAuth()).pipe(
              switchMap(() => throwError(() => new Error('No refresh token available')))
            );
          }
          
          return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
            switchMap(response => {
              if (response.success && response.tokens && response.user) {
                // Guardar nuevos tokens - soporta rotación de refresh token
                return from(this.storeAuth(response.tokens, response.user)).pipe(
                  map(() => response)
                );
              } else {
                return from(this.clearAuth()).pipe(
                  map(() => response)
                );
              }
            }),
            catchError(error => {
              return from(this.clearAuth()).pipe(
                switchMap(() => this.handleError(error))
              );
            })
          );
        })
      ).subscribe({
        next: (response) => {
          this.refreshInProgress = false;
          this.refreshPromise = null;
          resolve(response);
        },
        error: (error) => {
          this.refreshInProgress = false;
          this.refreshPromise = null;
          reject(error);
        }
      });
    });

    return from(this.refreshPromise);
  }

  /**
   * Logout
   */
  logout(): Observable<AuthResponse> {
    return from(this.storage.get(REFRESH_TOKEN_KEY)).pipe(
      switchMap(refreshToken => {
        return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
          switchMap(() => from(this.clearAuth()).pipe(
            map(() => ({ success: true, message: 'Sesión cerrada' }))
          )),
          catchError(() => {
            return from(this.clearAuth()).pipe(
              map(() => ({ success: true, message: 'Sesión cerrada' }))
            );
          })
        );
      })
    );
  }

  /**
   * Verificar token
   */
  verifyToken(): Observable<boolean> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/verify`).pipe(
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Observable<SafeUser | null> {
    return this.http.get<{ success: boolean; user: SafeUser }>(`${this.apiUrl}/me`).pipe(
      switchMap(response => {
        if (response.success && response.user) {
          return from(this.storage.setObject(USER_KEY, response.user)).pipe(
            tap(() => this.currentUserSubject.next(response.user)),
            map(() => response.user)
          );
        }
        return of(null);
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Almacenar autenticación en Secure Storage
   */
  private async storeAuth(tokens: AuthTokens, user: SafeUser): Promise<void> {
    // Guardar tokens en Secure Storage
    await this.storage.set(TOKEN_KEY, tokens.accessToken);
    await this.storage.set(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await this.storage.setObject(USER_KEY, user);
    
    // Mantener access token en memoria para acceso rápido
    this.accessTokenInMemory = tokens.accessToken;
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    
    console.log('[Auth] Tokens guardados en Secure Storage');
  }

  /**
   * Limpiar autenticación (logout)
   */
  async clearAuth(): Promise<void> {
    // Limpiar memoria
    this.accessTokenInMemory = null;
    
    // Limpiar Secure Storage
    await this.storage.remove(TOKEN_KEY);
    await this.storage.remove(REFRESH_TOKEN_KEY);
    await this.storage.remove(USER_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    console.log('[Auth] Tokens eliminados del Secure Storage');
  }

  // ==================== MÉTODOS PÚBLICOS PARA GESTIÓN DE TOKENS ====================

  /**
   * Guardar ambos tokens en Secure Storage.
   * 
   * @param accessToken - Token de acceso JWT
   * @param refreshToken - Token de refresco
   * 
   * @example
   * await authService.setTokens(response.accessToken, response.refreshToken);
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    if (!accessToken || !refreshToken) {
      throw new Error('Ambos tokens son requeridos');
    }
    
    await this.storage.set(TOKEN_KEY, accessToken);
    await this.storage.set(REFRESH_TOKEN_KEY, refreshToken);
    this.accessTokenInMemory = accessToken;
    this.isAuthenticatedSubject.next(true);
    
    console.log('[Auth] Tokens guardados con setTokens()');
  }

  /**
   * Obtener access token.
   * Primero intenta obtenerlo de memoria, si no lo recupera del Secure Storage.
   * 
   * @returns Promise con el access token o null
   * 
   * @example
   * const token = await authService.getAccessToken();
   * if (token) {
   *   headers.set('Authorization', `Bearer ${token}`);
   * }
   */
  getAccessToken(): Promise<string | null> {
    // Primero intentar memoria (más rápido)
    if (this.accessTokenInMemory) {
      return Promise.resolve(this.accessTokenInMemory);
    }
    // Si no está en memoria, recuperar del Secure Storage
    return this.storage.get(TOKEN_KEY).then(token => {
      if (token) {
        this.accessTokenInMemory = token;
      }
      return token;
    });
  }

  /**
   * Obtener access token de forma síncrona (solo memoria).
   * ⚠️ Puede devolver null si el token aún no se ha cargado del storage.
   */
  getAccessTokenSync(): string | null {
    return this.accessTokenInMemory;
  }

  /**
   * Obtener refresh token del Secure Storage.
   * El refresh token NUNCA se mantiene en memoria por seguridad.
   * 
   * @returns Promise con el refresh token o null
   * 
   * @example
   * const refreshToken = await authService.getRefreshToken();
   * if (refreshToken) {
   *   await authService.refreshToken();
   * }
   */
  getRefreshToken(): Promise<string | null> {
    return this.storage.get(REFRESH_TOKEN_KEY);
  }

  /**
   * Limpiar todos los tokens (logout).
   * 
   * @example
   * async logout() {
   *   await authService.clearTokens();
   *   router.navigate(['/login']);
   * }
   */
  async clearTokens(): Promise<void> {
    await this.clearAuth();
  }

  /**
   * Obtener usuario actual del storage (sin llamar al servidor)
   */
  getCurrentUserFromStorage(): Promise<SafeUser | null> {
    return this.storage.getObject<SafeUser>(USER_KEY);
  }

  /**
   * Verificar si está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // ==================== UTILIDADES PARA TOKENS JWT ====================

  /**
   * Decodifica un token JWT sin verificar la firma.
   * ⚠️ Solo para lectura de claims, NO para validación de seguridad.
   */
  decodeToken<T = any>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as T;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si un token ha expirado (síncrono).
   * @param token - Token JWT
   * @param bufferSeconds - Margen en segundos antes de considerar expirado
   */
  isTokenExpiredSync(token: string, bufferSeconds: number = 60): boolean {
    const payload = this.decodeToken<{ exp?: number }>(token);
    if (!payload?.exp) return true;

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const bufferTime = bufferSeconds * 1000;

    return currentTime >= (expirationTime - bufferTime);
  }

  /**
   * Verifica si el access token actual ha expirado.
   * @param bufferSeconds - Margen en segundos antes de considerar expirado
   */
  async isAccessTokenExpired(bufferSeconds: number = 60): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return true;
    return this.isTokenExpiredSync(token, bufferSeconds);
  }

  /**
   * Obtiene el tiempo restante hasta la expiración del access token.
   * @returns Milliseconds hasta expiración, o 0 si ya expiró
   */
  async getAccessTokenTimeToExpiry(): Promise<number> {
    const token = await this.getAccessToken();
    if (!token) return 0;

    const payload = this.decodeToken<{ exp?: number }>(token);
    if (!payload?.exp) return 0;

    const expirationTime = payload.exp * 1000;
    const remaining = expirationTime - Date.now();

    return remaining > 0 ? remaining : 0;
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  requestPasswordReset(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, { email }).pipe(
      timeout(10000),
      catchError(error => {
        if (error instanceof TimeoutError) {
          return throwError(() => ({
            status: 0,
            message: 'Tiempo de espera agotado. El servidor no responde.',
            error: 'timeout'
          }));
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Verificar código de restablecimiento
   */
  verifyResetCode(email: string, code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-reset-code`, { email, code }).pipe(
      timeout(10000),
      catchError(error => {
        if (error instanceof TimeoutError) {
          return throwError(() => ({
            status: 0,
            message: 'Tiempo de espera agotado. El servidor no responde.',
            error: 'timeout'
          }));
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Restablecer contraseña con token
   */
  resetPassword(resetToken: string, newPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, { 
      resetToken, 
      newPassword 
    }).pipe(
      timeout(10000),
      catchError(error => {
        if (error instanceof TimeoutError) {
          return throwError(() => ({
            status: 0,
            message: 'Tiempo de espera agotado. El servidor no responde.',
            error: 'timeout'
          }));
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    let errorDetails = error;
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      // Error del servidor
      errorMessage = error.error.message;
      
      // Si hay errores de validación, agregarlos
      if (error.error.errors && Array.isArray(error.error.errors)) {
        const validationMessages = error.error.errors
          .map((e: any) => e.message || e.msg)
          .join(', ');
        errorMessage = `${errorMessage}: ${validationMessages}`;
      }
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor';
          break;
        case 400:
          errorMessage = 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'Credenciales inválidas';
          break;
        case 429:
          errorMessage = 'Demasiados intentos. Intenta más tarde.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error: ${error.status}`;
      }
    }
    
    // Crear un error con toda la información
    const errorObj = new Error(errorMessage);
    (errorObj as any).error = errorDetails.error;
    (errorObj as any).status = errorDetails.status;
    
    return throwError(() => errorObj);
  }
}
