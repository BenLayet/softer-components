import { DemoAuthenticationService } from "./adapter/demo-authentication-service";
import { ListStorageService } from "./adapter/list-storage-service";
import { ListServiceImpl } from "./adapter/list.service-impl";

export const configuration = {
  listService: new ListServiceImpl(new ListStorageService()),
  authenticationService: new DemoAuthenticationService(),
};
