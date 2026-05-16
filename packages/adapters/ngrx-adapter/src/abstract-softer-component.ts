import { Directive, effect, inject, input } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { Store } from "@ngrx/store";
import { ComponentContract, ExtractChildrenPaths, ExtractUiDispatchers } from "@softer-components/types";
import { Observable, switchMap } from "rxjs";
import { SofterNgrxDispatchers } from "./softer-ngrx-dispatchers";
import { SofterNgrxSelectors } from "./softer-ngrx-selectors";

/**
 * Abstract base class for Angular components that use softer-components.
 *
 * Your Angular component can extend this class to get easy access, in the HTML template, to:
 * - `v$`: observable of the softer component's values (use with async pipe)
 * - `e`: the events, containing the dispatchers for the softer component actions
 * - `c$`: observable of the children's state paths (use with async pipe)
 *
 * Usage:
 * ```typescript
 * @Component({
 *   selector: 'app-counter',
 *   template: `
 *     @if (v$ | async; as v) {
 *       <span>{{ v.count }}</span>
 *       <button (click)="e.incremented()">+</button>
 *       <button (click)="e.decremented()">-</button>
 *     }
 *   `,
 * })
 * export class CounterComponent extends AbstractSofterComponent<CounterContract> {}
 * ```
 */
@Directive()
export abstract class AbstractSofterComponent<TComponentContract extends ComponentContract> {
  private readonly store = inject(Store);
  private readonly selectorFactory = inject(SofterNgrxSelectors);
  private readonly actionFactory = inject(SofterNgrxDispatchers);

  /**
   * The state path of this softer component in the state tree.
   * This determines which component's state this Angular component displays.
   */
 public readonly path = input("");

  private readonly path$ = toObservable(this.path);

  protected readonly v$: Observable<TComponentContract["values"]> = this.path$.pipe(
    switchMap((path) => this.store.select(this.selectorFactory.valuesSelector(path)))
  );

  protected readonly c$: Observable<ExtractChildrenPaths<TComponentContract>> = this.path$.pipe(
    switchMap((path) => this.store.select(this.selectorFactory.childrenPathsSelector(path)) as Observable<ExtractChildrenPaths<TComponentContract>>)
  );

  protected e = {} as ExtractUiDispatchers<TComponentContract>;

  constructor() {
    effect(() => {
      this.e = this.actionFactory.createDispatchers(this.path()) as ExtractUiDispatchers<TComponentContract>;
    });
  }
}

