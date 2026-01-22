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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  private currentUserSubject = new BehaviorSubject<SafeUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  // Indicador de que la autenticación ha sido inicializada (cargada del storage)
  private authInitializedSubject = new ReplaySubject<boolean>(1);
  public authInitialized$ = this.authInitializedSubject.asObservable();
  private _authInitialized = false;

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
      console.log('[Auth] Cargando autenticación del storage...');
      const token = await this.storage.get(TOKEN_KEY);
      const user = await this.storage.getObject<SafeUser>(USER_KEY);
      
      console.log('[Auth] Token encontrado:', !!token);
      console.log('[Auth] Usuario encontrado:', !!user);
      
      if (token && user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('[Auth] Sesión restaurada desde storage');
      } else {
        console.log('[Auth] No hay sesión guardada en storage');
      }
    } catch (error) {
      // NO llamar a clearAuth() aquí - solo loguear el error
      // El storage podría estar temporalmente inaccesible
      console.warn('[Auth] Error al cargar autenticación del storage:', error);
    } finally {
      // Marcar la autenticación como inicializada (independientemente del resultado)
      this._authInitialized = true;
      this.authInitializedSubject.next(true);
      console.log('[Auth] Inicialización completada');
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
   * Refrescar tokens
   */
  refreshToken(): Observable<AuthResponse> {
    return from(this.storage.get(REFRESH_TOKEN_KEY)).pipe(
      switchMap(refreshToken => {
        if (!refreshToken) {
          return from(this.clearAuth()).pipe(
            switchMap(() => throwError(() => new Error('No refresh token available')))
          );
        }
        
        return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
          switchMap(response => {
            if (response.success && response.tokens && response.user) {
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
    );
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
   * Almacenar autenticación
   */
  private async storeAuth(tokens: AuthTokens, user: SafeUser): Promise<void> {
    await this.storage.set(TOKEN_KEY, tokens.accessToken);
    await this.storage.set(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await this.storage.setObject(USER_KEY, user);
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Limpiar autenticación
   */
  async clearAuth(): Promise<void> {
    await this.storage.remove(TOKEN_KEY);
    await this.storage.remove(REFRESH_TOKEN_KEY);
    await this.storage.remove(USER_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Obtener access token
   */
  getAccessToken(): Promise<string | null> {
    return this.storage.get(TOKEN_KEY);
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): Promise<string | null> {
    return this.storage.get(REFRESH_TOKEN_KEY);
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
