import {
  ComponentContract,
  ComponentDef,
  GetContractAtStatePath,
  StatePaths,
  Values,
} from "@softer-components/types";

import { findComponentDef } from "../component-def-tree";
import { EffectsManager } from "../effects-manager";
import { GlobalEvent } from "../global-event";
import { RelativePathStateReader } from "../relative-path-state-manager";
import { initializeRootState } from "../state-initializer";
import { baseTree, stringToStatePath } from "../state-tree";
import { TreeStateManager } from "../tree-state-manager";
import { createValueProviders } from "../value-providers";
import { EventProcessorListener, whenEventOccurs } from "./event-processor";
import { TestLogger } from "./test-logger";

export const initTestStore = <TContract extends ComponentContract>(
  rootComponentDef: ComponentDef<TContract>,
) => new TestStore(rootComponentDef);

export class TestStore<TContract extends ComponentContract> {
  private readonly stateManager = new TreeStateManager();
  private readonly effectsManager;
  private readonly rootState = baseTree(undefined); //mutable in tests
  private readonly testListener: EventProcessorListener | undefined;
  constructor(private readonly rootComponentDef: ComponentDef<TContract>) {
    initializeRootState(this.rootState, rootComponentDef, this.stateManager);
    if (process.env.SOFTER_DEBUG) {
      this.testListener = new TestLogger();
    }
    this.effectsManager = new EffectsManager(
      this.rootComponentDef,
      this.stateManager,
    );
  }

  async when(input: GlobalEvent[] | GlobalEvent) {
    // Normalize to an array
    const globalEvents: GlobalEvent[] = Array.isArray(input) ? input : [input];
    return Promise.all(
      globalEvents.map(
        whenEventOccurs(
          this.rootState,
          this.rootComponentDef,
          this.stateManager,
          this.effectsManager,
          this.testListener,
        ),
      ),
    );
  }
  and = this.when;

  getValues<P extends StatePaths<TContract>>(
    path: P = "" as P,
  ): Values<GetContractAtStatePath<TContract, P>>["values"] {
    const componentDef = findComponentDef(
      this.rootComponentDef,
      stringToStatePath(path),
    );
    const stateReader = new RelativePathStateReader(
      this.rootState,
      this.stateManager,
      stringToStatePath(path),
    );
    return createValueProviders(componentDef, stateReader).values as any;
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
