import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of, timeout, TimeoutError } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, SafeUser, LoginRequest, AuthTokens } from '../interfaces';

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

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  /**
   * Cargar autenticación almacenada
   */
  private loadStoredAuth(): void {
    const token = this.getAccessToken();
    const userStr = localStorage.getItem(USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch {
        this.clearAuth();
      }
    }
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      timeout(10000), // 10 segundos timeout
      tap(response => {
        if (response.success && response.tokens && response.user) {
          this.storeAuth(response.tokens, response.user);
        }
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
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.clearAuth();
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.success && response.tokens && response.user) {
          this.storeAuth(response.tokens, response.user);
        } else {
          this.clearAuth();
        }
      }),
      catchError(error => {
        this.clearAuth();
        return this.handleError(error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      tap(() => this.clearAuth()),
      catchError(error => {
        this.clearAuth();
        return of({ success: true, message: 'Sesión cerrada' });
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
      map(response => response.success ? response.user : null),
      tap(user => {
        if (user) {
          this.currentUserSubject.next(user);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Almacenar autenticación
   */
  private storeAuth(tokens: AuthTokens, user: SafeUser): void {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Limpiar autenticación
   */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Obtener access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
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
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      // Error del servidor
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor';
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
    
    return throwError(() => new Error(errorMessage));
  }
}
