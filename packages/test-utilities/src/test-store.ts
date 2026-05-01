import {
  ContextEventManager,
  EffectsManager,
  GlobalEvent,
  RelativePathStateReader,
  TreeStateManager,
  baseTree,
  createValueProviders,
  initializeRootState,
  stringToStatePath,
} from "@softer-components/base-adapter";
import {
  ComponentContract,
  ComponentDef,
  Values,
} from "@softer-components/types";

import { EventProcessorListener, whenEventOccurs } from "./event-processor";
import { ContractAtStatePathString, StatePathString } from "./state-path";
import { TestLogger } from "./test-logger";

export const initTestStore = <TContract extends ComponentContract>(
  rootComponentDef: ComponentDef<TContract, any>,
) => new TestStore(rootComponentDef);
const isSofterDebugEnabled = (): boolean => {
  const g = globalThis as {
    __SOFTER_DEBUG__?: boolean;
  };

  return g.__SOFTER_DEBUG__ === true;
};
export class TestStore<TContract extends ComponentContract> {
  private readonly stateManager = new TreeStateManager();
  private readonly effectsManager;
  private readonly rootState = baseTree(undefined); //mutable in tests
  private readonly testListener: EventProcessorListener | undefined;
  private readonly contextEventManager: ContextEventManager;
  private readonly rootComponentDef: ComponentDef;
  constructor(rootComponentDef: ComponentDef<TContract, any>) {
    this.rootComponentDef = rootComponentDef as ComponentDef;
    this.contextEventManager = new ContextEventManager(
      rootComponentDef as ComponentDef,
      this.stateManager,
    );

    initializeRootState(
      this.rootState,
      this.rootComponentDef,
      this.stateManager,
    );

    if (isSofterDebugEnabled()) {
      this.testListener = new TestLogger();
    }
    this.effectsManager = new EffectsManager(
      this.rootComponentDef,
      this.stateManager,
    );
  }

  async when(eventOrEventArray: GlobalEvent[] | GlobalEvent) {
    // Normalize to an array
    const globalEvents: GlobalEvent[] = Array.isArray(eventOrEventArray)
      ? eventOrEventArray
      : [eventOrEventArray];
    return Promise.all(
      globalEvents.map(
        whenEventOccurs(
          this.rootState,
          this.rootComponentDef as ComponentDef,
          this.stateManager,
          this.effectsManager,
          this.contextEventManager,
          this.testListener,
        ),
      ),
    );
  }
  and = this.when;

  getValues<P extends StatePathString<TContract>>(
    path: P = "" as P,
  ): Values<ContractAtStatePathString<TContract, P>>["values"] {
    const stateReader = new RelativePathStateReader(
      this.rootState,
      this.stateManager,
      stringToStatePath(path),
    );
    return createValueProviders(
      this.rootComponentDef as ComponentDef,
      stateReader,
    ).values as any;
  }
  isStateDefined<P extends StatePathString<TContract>>(path: P): boolean {
    const stateReader = new RelativePathStateReader(
      this.rootState,
      this.stateManager,
      stringToStatePath(path),
    );
    return !!stateReader.readState();
  }
}
//TODO
export type { GlobalEvent };
export { stringToStatePath };
