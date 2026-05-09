import {
  INPUTTED_BY_USER,
  type SofterEvent,
  stringToStatePath,
} from "@softer-components/base-adapter";
import type { ComponentContract, Payload } from "@softer-components/types";

import type { ComponentTreePaths } from "./component-path";

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

type AfterThenAtPathStage<
  TRootComponentContract extends ComponentContract,
  TInput,
> = {
  events: (
    ...eventNames: string[]
  ) => AfterEventsStage<TRootComponentContract, TInput>;
};

type AfterWithPayloadsStage<
  TRootComponentContract extends ComponentContract,
  TInput,
> = ((...input: SequenceArgs<TInput>) => SofterEvent[]) & {
  thenAtPath: (
    path: ComponentTreePaths<TRootComponentContract>,
  ) => AfterThenAtPathStage<TRootComponentContract, TInput>;
};

type AfterEventsStage<
  TRootComponentContract extends ComponentContract,
  TInput,
> = ((...input: SequenceArgs<TInput>) => SofterEvent[]) & {
  withPayloads: (
    payloadResolver: PayloadResolver<TInput>,
  ) => AfterWithPayloadsStage<TRootComponentContract, TInput>;
  thenAtPath: (
    path: string,
  ) => AfterThenAtPathStage<TRootComponentContract, TInput>;
};

type InitialStage<TRootComponentContract extends ComponentContract, TInput> = {
  atPath: (
    path: ComponentTreePaths<TRootComponentContract>,
  ) => AfterThenAtPathStage<TRootComponentContract, TInput>;
  events: (
    ...eventNames: string[]
  ) => AfterEventsStage<TRootComponentContract, TInput>;
};

const defaultPayloadResolver = <TInput>(
  ...args: SequenceArgs<TInput>
): Payload => args[0] as Payload;

export const eventSequenceFactory = <
  TRootComponentContract extends ComponentContract = ComponentContract,
  TInput = undefined,
>() => {
  const steps: SequenceStep<TInput>[] = [];
  let currentPath: string = "";
  let pendingPayloadIndexes: number[] = [];

  const createEvents = <T extends ComponentContract>(
    ...input: SequenceArgs<TInput>
  ) =>
    steps.map(
      step =>
        ({
          name: step.name,
          statePath: stringToStatePath(step.path),
          payload: step.payloadResolver(...input),
          source: INPUTTED_BY_USER,
        }) satisfies SofterEvent,
    );

  const events = <T extends ComponentContract>(
    firstEventName: string,
    ...otherEventNames: string[]
  ): AfterEventsStage<TRootComponentContract, TInput> => {
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
  ): AfterWithPayloadsStage<TRootComponentContract, TInput> => {
    if (pendingPayloadIndexes.length === 0) {
      throw new Error("withPayloads can only be called right after events().");
    }

    for (const stepIndex of pendingPayloadIndexes) {
      steps[stepIndex].payloadResolver = payloadResolver;
    }

    pendingPayloadIndexes = [];
    return afterWithPayloads;
  };

  const thenAtPath = (
    path: ComponentTreePaths<TRootComponentContract>,
  ): AfterThenAtPathStage<TRootComponentContract, TInput> => {
    currentPath = path;
    return afterThenAtPath;
  };
  const afterEvents = Object.assign(createEvents, {
    withPayloads,
    thenAtPath,
  }) as AfterEventsStage<TRootComponentContract, TInput>;
  const afterThenAtPath: AfterThenAtPathStage<TRootComponentContract, TInput> =
    {
      events,
    };
  const afterWithPayloads = Object.assign(createEvents, {
    thenAtPath,
  }) as AfterWithPayloadsStage<TRootComponentContract, TInput>;

  const initialStage: InitialStage<TRootComponentContract, TInput> = {
    atPath: thenAtPath,
    events,
  };

  return initialStage;
};
