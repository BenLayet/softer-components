import {
  ComponentContract,
  ComponentDef,
  Event,
  EventConsumerInput,
  Payload,
} from "@softer-components/types";

import { GlobalEvent } from "./global-event";
import { RelativePathStateReader } from "./relative-path-state-manager";
import { createValueProviders } from "./value-providers";

export function eventConsumerInputProvider<
  TPayload extends Payload,
  TComponentContract extends ComponentContract = ComponentContract,
>(
  rootComponentDef: ComponentDef,
  event: GlobalEvent<Event<TPayload>>,
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
  event: GlobalEvent<Event<TPayload>>,
  stateReader: RelativePathStateReader,
): EventConsumerInput<TPayload, TComponentContract> {
  const { values, childrenValues } = createValueProviders<TComponentContract>(
    rootComponentDef as ComponentDef,
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
