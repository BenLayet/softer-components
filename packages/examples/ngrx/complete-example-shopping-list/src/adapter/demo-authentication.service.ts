import { AuthenticationService } from "../port/authentication.service";

const demoUserNames = ["alice", "bob"];
const demoPassword = "demo";

export class DemoAuthenticationService implements AuthenticationService {
  private usernameCookie: undefined | string;
  async isSignedIn(): Promise<boolean> {
    return !!this.usernameCookie;
  }
  async signIn(username: string, password: string): Promise<boolean> {
    if (!demoUserNames.includes(username) || password !== demoPassword) {
      return false;
    }
    this.usernameCookie = username;
    return true;
  }

  async signOut(): Promise<void> {
    this.usernameCookie = undefined;
  }

  async username(): Promise<string | undefined> {
    return this.usernameCookie;
  }
}
