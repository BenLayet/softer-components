import {
  GlobalEvent,
  parseEventTypeString,
  toEventTypeString,
} from "@softer-components/base-adapter";
import { Payload } from "@softer-components/types";

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
      ...parseEventTypeString(action.type, this.actionTypePrefix),
      payload: action.payload,
    };
  };

  softerEventToNgRxAction = (event: GlobalEvent): NgRxAction => {
    return {
      type: toEventTypeString(event, this.actionTypePrefix),
      payload: event.payload,
    };
  };
}
