import { Payload } from "@softer-components/types";
import {
  GlobalEvent,
  parseEventTypeString,
  toEventTypeString,
} from "@softer-components/utils";

export type NgRxAction = {
  type: string;
  payload?: Payload;
};

export class SofterNgrxEventMapper {
  constructor(private readonly actionTypePrefix: string) {}
  isSofterAction = (action: { type: string }) =>
    action.type.startsWith(this.actionTypePrefix);
  ngrxActionToSofterEvent = (action: NgRxAction): GlobalEvent => {
    if (!this.isSofterAction(action)) {
      throw new Error(`Not a softer event: '${action.type}'`);
    }
    return {
      ...parseEventTypeString(this.removeSofterActionTypePrefix(action.type)),
      payload: action.payload,
    };
  };

  softerEventToNgRxAction = (event: GlobalEvent): NgRxAction => {
    return {
      type: this.addSofterActionTypePrefix(toEventTypeString(event)),
      payload: event.payload,
    };
  };
  private removeSofterActionTypePrefix(actionType: string): string {
    return actionType.slice(this.actionTypePrefix.length);
  }
  private addSofterActionTypePrefix(actionType: string): string {
    return `${this.actionTypePrefix}${actionType}`;
  }
}
