import { List } from "../model";
import { AuthenticationService } from "../port/authentication.service";
import { ListService } from "../port/list.service";
import { demoLists } from "./demo-lists";

export class DemoListService implements ListService {
  constructor(private readonly authenticationService: AuthenticationService) {}
  async create(name: string) {
    const list: List = {
      name,
      id: crypto.randomUUID(),
      listItems: [],
    };
    await this.save(list);
    return list;
  }
  async getAll() {
    const username =
      (await this.authenticationService.username()) ?? "anonymous";

    return structuredClone(demoLists[username]) ?? [];
  }

  async delete(listId: string) {
    const username =
      (await this.authenticationService.username()) ?? "anonymous";
    demoLists[username] =
      demoLists[username]?.filter(list => list.id !== listId) ?? [];
  }

  async save(list: List) {
    const username =
      (await this.authenticationService.username()) ?? "anonymous";
    const existingList = demoLists[username]?.find(l => l.id === list.id);
    if (existingList) {
      existingList.listItems = list.listItems;
      existingList.name = list.name;
      return;
    } else {
      demoLists[username] = [...(demoLists[username] ?? []), list];
    }
  }
}
