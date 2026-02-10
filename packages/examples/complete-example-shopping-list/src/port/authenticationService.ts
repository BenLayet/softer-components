export interface AuthenticationService {
  authenticate(username: string, password: string): Promise<boolean>;
  logout(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  username(): Promise<string | undefined>;
}
