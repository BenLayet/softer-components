import { AuthenticationService } from "../port/authenticationService";

const demoUserNames = ["alice", "bob", "charlie"];
const demoPassword = "demo";

const USERNAME_COOKIE = "authenticatedUser";
export class DemoAuthenticationService implements AuthenticationService {
  async isAuthenticated(): Promise<boolean> {
    const value = await cookieStore.get(USERNAME_COOKIE);
    return !!value;
  }
  async authenticate(username: string, password: string): Promise<boolean> {
    if (!demoUserNames.includes(username) || password !== demoPassword) {
      return Promise.resolve(false);
    }
    await cookieStore.set({ name: USERNAME_COOKIE, value: username });
    return Promise.resolve(true);
  }

  async logout(): Promise<void> {
    await cookieStore.delete(USERNAME_COOKIE);
    return Promise.resolve(undefined);
  }

  async username(): Promise<string | undefined> {
    const cookieListItem = await cookieStore.get(USERNAME_COOKIE);
    return cookieListItem?.value;
  }
}
