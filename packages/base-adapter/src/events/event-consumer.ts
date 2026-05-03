import {
  ComponentContract,
  ComponentDef,
  EventConsumerInput,
  EventDef,
  Payload,
} from "@softer-components/types";

import { RelativePathStateReader } from "../state/relative-path-state-manager";
import { SofterEvent } from "./softer-event";
import { createValueProviders } from "./value-providers";

export function eventConsumerInputProvider<
  TPayload extends Payload,
  TComponentContract extends ComponentContract = ComponentContract,
>(
  rootComponentDef: ComponentDef,
  event: SofterEvent<EventDef<TPayload>>,
  stateReader: RelativePathStateReader,
): () => EventConsumerInput<TPayload, TComponentContract> {
  let cachedInput: EventConsumerInput<TPayload, TComponentContract> | undefined;
  return () => {
    if (cachedInput) return cachedInput;
    cachedInput = createEventConsumerInput(
      rootComponentDef,
      event,
      stateReader,
    );
    return cachedInput;
  };
}

function createEventConsumerInput<
  TPayload extends Payload,
  TComponentContract extends ComponentContract = ComponentContract,
>(
  rootComponentDef: ComponentDef,
  event: SofterEvent<EventDef<TPayload>>,
  stateReader: RelativePathStateReader,
): EventConsumerInput<TPayload, TComponentContract> {
  const { values, childrenValues } = createValueProviders(
    rootComponentDef,
    stateReader,
  );
  const payload = event.payload as TPayload;
  const childKey = event.statePath?.[event.statePath?.length - 1]?.[1];

  return {
    values,
    childrenValues,
    payload,
    childKey,
  } as EventConsumerInput<TPayload, TComponentContract>;
}
