import {
  INPUTTED_BY_USER,
  type SofterEvent,
  stringToStatePath,
} from "@softer-components/base-adapter";
import type { Payload } from "@softer-components/types";

type SequenceArgs<TInput> = TInput extends undefined
  ? []
  : TInput extends unknown[]
    ? TInput
    : [TInput];
type PayloadResolver<TInput> = (...input: SequenceArgs<TInput>) => Payload;
type SequenceStep<TInput> = {
  name: string;
  path: string;
  payloadResolver: PayloadResolver<TInput>;
};

type EventSequenceChain<TInput> = ((
  ...input: SequenceArgs<TInput>
) => SofterEvent[]) & {
  events: (...eventNames: string[]) => EventSequenceChain<TInput>;
  thenAtPath: (path: string) => EventSequenceChain<TInput>;
  withPayload: (
    payloadResolver: PayloadResolver<TInput>,
  ) => EventSequenceChain<TInput>;
};

const defaultPayloadResolver = <TInput>(
  ...args: SequenceArgs<TInput>
): Payload => args[0] as Payload;

export const eventSequenceFactory = <TInput = undefined>() => {
  const steps: SequenceStep<TInput>[] = [];
  let currentPath: string = "";
  let pendingPayloadIndexes: number[] = [];

  const chain = ((...input: SequenceArgs<TInput>) =>
    steps.map(
      step =>
        ({
          name: step.name,
          statePath: stringToStatePath(step.path),
          payload: step.payloadResolver(...input),
          source: INPUTTED_BY_USER,
        }) satisfies SofterEvent,
    )) as EventSequenceChain<TInput>;

  chain.events = (...eventNames: string[]) => {
    const path = currentPath;

    pendingPayloadIndexes = eventNames.map(name => {
      steps.push({
        name,
        path,
        payloadResolver: defaultPayloadResolver<TInput>,
      });
      return steps.length - 1;
    });

    return chain;
  };

  chain.withPayload = payloadResolver => {
    if (pendingPayloadIndexes.length === 0) {
      throw new Error(
        "eventSequenceFactory.withPayload() must be called right after events().",
      );
    }

    for (const stepIndex of pendingPayloadIndexes) {
      steps[stepIndex].payloadResolver = payloadResolver;
    }

    pendingPayloadIndexes = [];
    return chain;
  };

  chain.thenAtPath = path => {
    currentPath = path;
    pendingPayloadIndexes = [];
    return chain;
  };

  return {
    atPath: (path: string) => chain.thenAtPath(path),
    events: chain.events,
  };
};
