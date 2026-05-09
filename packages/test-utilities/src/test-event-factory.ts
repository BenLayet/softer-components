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

type AfterThenAtPathStage<TInput> = {
  events: (...eventNames: string[]) => AfterEventsStage<TInput>;
};

type AfterWithPayloadsStage<TInput> = ((
  ...input: SequenceArgs<TInput>
) => SofterEvent[]) & {
  thenAtPath: (path: string) => AfterThenAtPathStage<TInput>;
};

type AfterEventsStage<TInput> = ((
  ...input: SequenceArgs<TInput>
) => SofterEvent[]) & {
  withPayloads: (
    payloadResolver: PayloadResolver<TInput>,
  ) => AfterWithPayloadsStage<TInput>;
  thenAtPath: (path: string) => AfterThenAtPathStage<TInput>;
};

type InitialStage<TInput> = {
  atPath: (path: string) => AfterThenAtPathStage<TInput>;
  events: (...eventNames: string[]) => AfterEventsStage<TInput>;
};

const defaultPayloadResolver = <TInput>(
  ...args: SequenceArgs<TInput>
): Payload => args[0] as Payload;

export const eventSequenceFactory = <TInput = undefined>() => {
  const steps: SequenceStep<TInput>[] = [];
  let currentPath: string = "";
  let pendingPayloadIndexes: number[] = [];

  const createEvents = (...input: SequenceArgs<TInput>) =>
    steps.map(
      step =>
        ({
          name: step.name,
          statePath: stringToStatePath(step.path),
          payload: step.payloadResolver(...input),
          source: INPUTTED_BY_USER,
        }) satisfies SofterEvent,
    );

  const events = (
    firstEventName: string,
    ...otherEventNames: string[]
  ): AfterEventsStage<TInput> => {
    const path = currentPath;

    pendingPayloadIndexes = [firstEventName, ...otherEventNames].map(name => {
      steps.push({
        name,
        path,
        payloadResolver: defaultPayloadResolver<TInput>,
      });
      return steps.length - 1;
    });

    return afterEvents;
  };

  const withPayloads = (
    payloadResolver: PayloadResolver<TInput>,
  ): AfterWithPayloadsStage<TInput> => {
    if (pendingPayloadIndexes.length === 0) {
      throw new Error("withPayloads can only be called right after events().");
    }

    for (const stepIndex of pendingPayloadIndexes) {
      steps[stepIndex].payloadResolver = payloadResolver;
    }

    pendingPayloadIndexes = [];
    return afterWithPayloads;
  };

  const thenAtPath = (path: string): AfterThenAtPathStage<TInput> => {
    currentPath = path;
    return afterThenAtPath;
  };

  const afterEvents = Object.assign(createEvents, {
    withPayloads,
    thenAtPath,
  }) as AfterEventsStage<TInput>;
  const afterThenAtPath: AfterThenAtPathStage<TInput> = {
    events,
  };
  const afterWithPayloads = Object.assign(createEvents, {
    thenAtPath,
  }) as AfterWithPayloadsStage<TInput>;

  const initialStage: InitialStage<TInput> = {
    atPath: thenAtPath,
    events,
  };

  return initialStage;
};
