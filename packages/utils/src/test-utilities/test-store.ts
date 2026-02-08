import {
  ComponentContract,
  ComponentDef,
  GetContractAtStatePath,
  State,
  StatePaths,
  Values,
} from "@softer-components/types";

import { findComponentDef } from "../component-def-tree";
import { stringToComponentPath } from "../component-path";
import { EffectsManager } from "../effects-manager";
import { generateEventsToForward } from "../event-forwarding";
import { updateSofterRootState } from "../reducer";
import { RelativePathStateReader } from "../relative-path-state-manager";
import { initializeRootState } from "../state-initializer";
import { baseTree } from "../tree";
import { TreeStateManager } from "../tree-state-manager";
import { GlobalEvent } from "../utils.type";
import { createValueProviders } from "../value-providers";
import { TestListener, TestLogger } from "./test-logger";

export const initTestStore = <TContract extends ComponentContract>(
  rootComponentDef: ComponentDef<TContract>,
) => new TestStore(rootComponentDef);

export class TestStore<TContract extends ComponentContract> {
  private readonly stateManager = new TreeStateManager();
  private readonly effectsManager = new EffectsManager(
    this.rootComponentDef,
    this.stateManager,
  );
  private readonly rootState = baseTree<State>(undefined); //mutable in tests
  private readonly testListener: TestListener | undefined;
  constructor(private readonly rootComponentDef: ComponentDef<TContract>) {
    initializeRootState(this.rootState, rootComponentDef, this.stateManager);
    if (process.env.SOFTER_DEBUG) {
      this.testListener = new TestLogger();
    }
  }

  async when(input: GlobalEvent[] | GlobalEvent) {
    // Normalize to an array
    const globalEvents: GlobalEvent[] = Array.isArray(input) ? input : [input];
    return Promise.all(globalEvents.map(this.whenEventOccurs));
  }
  and = this.when;

  private whenEventOccurs = async (globalEvent: GlobalEvent) => {
    //reducer
    updateSofterRootState(
      this.rootState,
      this.rootComponentDef,
      globalEvent,
      this.stateManager,
    );
    this.testListener?.afterReducer(globalEvent, this.rootState);

    //event forwarding
    const newEvents = generateEventsToForward(
      this.rootState,
      this.rootComponentDef,
      globalEvent,
      this.stateManager,
    );
    newEvents.forEach(this.whenEventOccurs);

    //effects
    return this.effectsManager.eventOccurred(
      globalEvent,
      this.rootState,
      this.whenEventOccurs,
    );
  };

  getValues<P extends StatePaths<TContract>>(
    path: P,
  ): Values<GetContractAtStatePath<TContract, P>>["values"] {
    const componentDef = findComponentDef(
      this.rootComponentDef,
      stringToComponentPath(path),
    );
    const stateReader = new RelativePathStateReader(
      this.rootState,
      this.stateManager,
      stringToComponentPath(path),
    );
    return createValueProviders(componentDef, stateReader).values as any;
  }
  isStateDefined<P extends StatePaths<TContract>>(path: P): boolean {
    const stateReader = new RelativePathStateReader(
      this.rootState,
      this.stateManager,
      stringToComponentPath(path),
    );
    return !!stateReader.readState();
  }
}
