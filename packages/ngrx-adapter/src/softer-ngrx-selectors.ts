import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector,
} from "@ngrx/store";
import {
  ComponentContract,
  ComponentDef,
  ExtractChildrenPaths,
} from "@softer-components/types";
import {
  ChildrenKeys,
  RelativePathStateReader,
  StatePath,
  StateTree,
  TreeStateManager,
  createValueProviders,
  findComponentDefFromStatePath,
  statePathToString,
  stringToStatePath,
} from "@softer-components/utils";

import { NgrxGlobalState } from "./softer-mappers";

export type ChildrenPaths = Record<
  string,
  string[] | string | (string | undefined)
>;

/**
 * Service that creates and caches NgRx selectors for softer components.
 * Given a state path, it gets or creates a selector that can be used to select
 * the state of a softer component from the NgRx store.
 */
export class SofterNgrxSelectors {
  private readonly valuesSelectorsCache = new Map<
    string,
    MemoizedSelector<NgrxGlobalState, Record<string, any>>
  >();
  private readonly childrenPathsSelectorsCache = new Map<
    string,
    MemoizedSelector<NgrxGlobalState, any>
  >();
  private readonly featureSelector: MemoizedSelector<
    NgrxGlobalState,
    StateTree
  >;

  constructor(
    private readonly stateManager: TreeStateManager,
    private readonly rootComponentDef: ComponentDef,
    featureName: string,
  ) {
    this.featureSelector = createFeatureSelector<StateTree>(featureName);

    // Clean up cached selectors when state is removed
    this.stateManager.addStateTreeListener({
      onStateRemoved: statePath => {
        const pathStr = statePathToString(statePath);
        this.valuesSelectorsCache.delete(pathStr);
        this.childrenPathsSelectorsCache.delete(pathStr);
      },
    });
  }

  valuesSelector<T extends ComponentContract>(
    statePath: string,
  ): MemoizedSelector<NgrxGlobalState, Record<string, T["values"]>> {
    if (!this.valuesSelectorsCache.has(statePath)) {
      this.valuesSelectorsCache.set(
        statePath,
        this.createValuesSelector(stringToStatePath(statePath)),
      );
    }
    return this.valuesSelectorsCache.get(statePath)!;
  }

  childrenPathsSelector<T extends ComponentContract>(
    statePath: string,
  ): MemoizedSelector<NgrxGlobalState, ExtractChildrenPaths<T>> {
    if (!this.childrenPathsSelectorsCache.has(statePath)) {
      this.childrenPathsSelectorsCache.set(
        statePath,
        this.createChildrenPathsSelector(stringToStatePath(statePath)),
      );
    }
    return this.childrenPathsSelectorsCache.get(statePath) as MemoizedSelector<
      NgrxGlobalState,
      ExtractChildrenPaths<T>
    >;
  }

  private createValuesSelector(
    statePath: StatePath,
  ): MemoizedSelector<NgrxGlobalState, Record<string, any>> {
    return createSelector(this.featureSelector, (rootState: StateTree) => {
      const values: Record<string, any> = {};
      const valueProviders = createValueProviders(
        this.rootComponentDef,
        new RelativePathStateReader(rootState, this.stateManager, statePath),
      );
      Object.entries(
        (valueProviders.values ?? {}) as Record<string, () => any>,
      ).forEach(([valueName, valueProvider]) => {
        Object.defineProperty(values, valueName, {
          get() {
            return valueProvider();
          },
          enumerable: true,
          configurable: false,
        });
      });
      return values;
    });
  }

  private createChildrenPathsSelector(
    statePath: StatePath,
  ): MemoizedSelector<NgrxGlobalState, ChildrenPaths> {
    const componentDef = findComponentDefFromStatePath(
      this.rootComponentDef,
      statePath,
    );
    const initialChildren =
      typeof componentDef?.initialChildren === "object"
        ? componentDef.initialChildren
        : {};

    const childrenKeysSelector = createSelector(
      this.featureSelector,
      (rootState: StateTree) =>
        this.stateManager.getChildrenKeys(rootState, statePath),
    );

    return createSelector(
      childrenKeysSelector,
      (childrenKeys: ChildrenKeys | undefined): ChildrenPaths =>
        Object.fromEntries(
          Object.entries(childrenKeys ?? {})
            .map(
              ([childName, childKeys]) =>
                [
                  childName,
                  childKeys.map(key =>
                    statePathToString([...statePath, [childName, key]]),
                  ),
                ] as [string, string[]],
            )
            .map(([childName, childPaths]) => [
              childName,
              Array.isArray((initialChildren as Record<string, any>)[childName])
                ? childPaths
                : childPaths[0],
            ]),
        ),
    );
  }
}
