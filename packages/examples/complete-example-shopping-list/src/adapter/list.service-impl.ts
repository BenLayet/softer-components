import { List } from "../model";
import { ListService } from "../port/list-service";
import { ListStorageService } from "./list-storage-service";

export class ListServiceImpl implements ListService {
  constructor(private readonly listStorageService: ListStorageService) {}
  async create(name: string) {
    const list: List = {
      name,
      id: crypto.randomUUID(),
      listItems: [],
    };
    await this.listStorageService.saveList(list);
    return list;
  }
  getAll() {
    return this.listStorageService.loadAllLists();
  }

  async delete(listId: string) {
    await this.listStorageService.deleteList(listId);
  }

  async save(list: List) {
    await this.listStorageService.saveList(list);
  }
}
