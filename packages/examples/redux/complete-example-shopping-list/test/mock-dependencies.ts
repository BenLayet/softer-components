import { List } from "../src/model";
import { AuthenticationService } from "../src/port/authentication.service";
import { ListService } from "../src/port/list.service";

class MockListService implements ListService {
  readonly savedLists: { [username in string]: List[] } = {};
  get savedList() {
    return this.savedLists[this.authenticationService.authenticatedUser] ?? [];
  }
  constructor(
    private readonly authenticationService: MockAuthenticationService,
  ) {}

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
  authenticatedUser = "anonymous";
  constructor(
    private readonly users: { username: string; password: string }[],
  ) {}
  signIn(username: string, password: string): Promise<boolean> {
    this.authenticatedUser =
      this.users.find(
        user => user.username === username && user.password === password,
      )?.username ?? "anonymous";
    return this.isSignedIn();
  }
  signOut(): Promise<void> {
    this.authenticatedUser = "anonymous";
    return Promise.resolve();
  }
  isSignedIn(): Promise<boolean> {
    return Promise.resolve(this.authenticatedUser !== "anonymous");
  }
  async username(): Promise<string | undefined> {
    const isSignedIn = await this.isSignedIn();
    return isSignedIn ? this.authenticatedUser : undefined;
  }
}

export class MockDependencies {
  authenticationService = new MockAuthenticationService([
    { username: "alice", password: "demo" },
  ]);
  listService = new MockListService(this.authenticationService);
}
