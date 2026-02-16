import { AppDependencies } from "../src/components/app/app.component";
import { List } from "../src/model";
import { AuthenticationService } from "../src/port/authentication.service";
import { ListService } from "../src/port/list.service";

class MockListService implements ListService {
  constructor(private savedList: List[]) {}

  create(name: string): Promise<List> {
    const newList = {
      name,
      id: "fake-uuid",
      listItems: [],
    };
    this.savedList.push(newList);
    return Promise.resolve(newList);
  }

  delete(listId: string): Promise<void> {
    this.savedList.splice(
      this.savedList.findIndex(l => l.id === listId),
      1,
    );
    return Promise.resolve();
  }

  getAll(): Promise<List[]> {
    return Promise.resolve(this.savedList);
  }

  save(list: List): Promise<void> {
    const index = this.savedList.findIndex(l => l.id === list.id);
    if (index !== -1) {
      this.savedList[index] = list;
    } else {
      this.savedList.push(list);
    }
    return Promise.resolve();
  }
}

class MockAuthenticationService implements AuthenticationService {
  private authenticatedUserIndex = -1;
  constructor(
    private readonly users: { username: string; password: string }[],
  ) {}
  signIn(username: string, password: string): Promise<boolean> {
    this.authenticatedUserIndex = this.users.findIndex(
      user => user.username === username && user.password === password,
    );
    return this.isSignedIn();
  }
  signOut(): Promise<void> {
    this.authenticatedUserIndex = -1;
    return Promise.resolve();
  }
  isSignedIn(): Promise<boolean> {
    return Promise.resolve(this.authenticatedUserIndex > -1);
  }
  async username(): Promise<string | undefined> {
    const isSignedIn = await this.isSignedIn();
    return isSignedIn
      ? this.users[this.authenticatedUserIndex].username
      : undefined;
  }
}

export const mockDependencies = (
  savedList: List[],
  users = [{ username: "alice", password: "demo" }],
): AppDependencies => ({
  listService: new MockListService(savedList),
  authenticationService: new MockAuthenticationService(users),
});
