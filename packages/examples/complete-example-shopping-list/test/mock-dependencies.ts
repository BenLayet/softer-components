import { AppDependencies } from "../src/components/app/app.component";
import { List } from "../src/model";
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

export const mockDependencies = (savedList: List[]): AppDependencies => ({
  listService: new MockListService(savedList),
});
