import { DemoAuthenticationService } from "./adapter/demo-authentication.service";
import { DemoListService } from "./adapter/demo-list.service";

const authenticationService = new DemoAuthenticationService();
const listService = new DemoListService(authenticationService);
export const configuration = { listService, authenticationService };
