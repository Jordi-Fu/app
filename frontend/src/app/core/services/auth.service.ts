import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of, timeout, TimeoutError, from } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
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

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.loadStoredAuth();
  }

  /**
   * Cargar autenticación almacenada
   */
  private async loadStoredAuth(): Promise<void> {
    try {
      const token = await this.storage.get(TOKEN_KEY);
      const user = await this.storage.getObject<SafeUser>(USER_KEY);
      
      if (token && user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error('Error cargando autenticación:', error);
      await this.clearAuth();
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
   * Verificar si está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
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
