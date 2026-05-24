export type AuthenticationService = {
  signIn(username: string, password: string): Promise<boolean>;
  signOut(): Promise<void>;
  isSignedIn(): Promise<boolean>;
  username(): Promise<string | undefined>;
}
