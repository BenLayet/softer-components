import {
  ComponentContract,
  ComponentDef,
  GetContractAtStatePath,
  StatePaths,
  Values,
} from "@softer-components/types";

import { ContextEventManager } from "../context-event-manager";
import { EffectsManager } from "../effects-manager";
import { GlobalEvent } from "../global-event";
import { stringToStatePath } from "../path";
import { RelativePathStateReader } from "../relative-path-state-manager";
import { initializeRootState } from "../state-initializer";
import { baseTree } from "../state-tree";
import { TreeStateManager } from "../tree-state-manager";
import { createValueProviders } from "../value-providers";
import { EventProcessorListener, whenEventOccurs } from "./event-processor";
import { TestLogger } from "./test-logger";

export const initTestStore = <TContract extends ComponentContract>(
  rootComponentDef: ComponentDef<TContract, any>,
) => new TestStore(rootComponentDef);

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

    if (process.env.SOFTER_DEBUG) {
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

  getValues<P extends StatePaths<TContract>>(
    path: P = "" as P,
  ): Values<GetContractAtStatePath<TContract, P>>["values"] {
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
  isStateDefined<P extends StatePaths<TContract>>(path: P): boolean {
    const stateReader = new RelativePathStateReader(
      this.rootState,
      this.stateManager,
      stringToStatePath(path),
    );
    return !!stateReader.readState();
  }
}
