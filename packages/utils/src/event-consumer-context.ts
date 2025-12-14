import {
  ComponentContract,
  ComponentDef,
  Event,
  EventConsumerContext,
  Payload,
} from "@softer-components/types";

import { RelativePathStateReader } from "./relative-path-state-manager";
import { GlobalEvent } from "./utils.type";
import { createValueProviders } from "./value-providers";

export function eventConsumerContextProvider<
  TPayload extends Payload,
  TComponentContract extends ComponentContract = ComponentContract,
>(
  componentDef: ComponentDef<TComponentContract>,
  event: GlobalEvent<Event<TPayload>>,
  stateReader: RelativePathStateReader,
): () => EventConsumerContext<TPayload, TComponentContract> {
  let cachedContext:
    | EventConsumerContext<TPayload, TComponentContract>
    | undefined;
  return () => {
    if (cachedContext) return cachedContext;
    cachedContext = createEventConsumerContext(
      componentDef,
      event,
      stateReader,
    );
    return cachedContext;
  };
}

function createEventConsumerContext<
  TPayload extends Payload,
  TComponentContract extends ComponentContract = ComponentContract,
>(
  componentDef: ComponentDef<TComponentContract>,
  event: GlobalEvent<Event<TPayload>>,
  stateReader: RelativePathStateReader,
): EventConsumerContext<TPayload, TComponentContract> {
  const { selectors, children } = createValueProviders(
    componentDef,
    stateReader,
  );
  const payload = event.payload;
  const childKey = event.componentPath?.[event.componentPath?.length - 1]?.[1];

  return {
    selectors,
    children,
    payload,
    childKey,
  };
}
