import { Directive, inject, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { Store } from "@ngrx/store";
import { ComponentContract, ExtractChildrenPaths, ExtractUiDispatchers } from "@softer-components/types";
import { Subject, takeUntil } from "rxjs";
import { SofterNgrxDispatchers } from "./softer-ngrx-dispatchers";
import { SofterNgrxSelectors } from "./softer-ngrx-selectors";

/**
 * Abstract base class for Angular components that use softer-components.
 *
 * Your Angular component can extend this class to get easy access, in the HTML template, to:
 * - `v`: the view, containing the result of the softer component selector
 * - `e`: the events, containing the dispatchers for the softer component actions
 * - `c`: the children, containing the state paths of the sub softer components
 *
 * Usage:
 * ```typescript
 * @Component({
 *   selector: 'app-counter',
 *   template: `
 *     <div *ngIf="v | async as values">
 *       <span>{{ values.count }}</span>
 *       <button (click)="e.incremented()">+</button>
 *       <button (click)="e.decremented()">-</button>
 *     </div>
 *   `,
 * })
 * export class CounterComponent extends AbstractSofterComponent<CounterContract> {}
 * ```
 */
@Directive()
export abstract class AbstractSofterComponent<TComponentContract extends ComponentContract>
  implements OnChanges, OnDestroy
{
  private readonly store = inject(Store);
  private readonly selectorFactory = inject(SofterNgrxSelectors);
  private readonly actionFactory = inject(SofterNgrxDispatchers);

  /**
   * The state path of this softer component in the state tree.
   * This determines which component's state this Angular component displays.
   */
  @Input() path = "";

  private readonly reset$ = new Subject<void>();
  protected e = {} as ExtractUiDispatchers<TComponentContract>;
  protected v= {} as TComponentContract["values"];
  protected c= {} as ExtractChildrenPaths<TComponentContract>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["path"]) {
      this.reset$.next();
      this.store.select(this.selectorFactory.valuesSelector(this.path)).pipe(takeUntil(this.reset$))
        .subscribe((values:TComponentContract["values"]) => {
          this.v = values;
        });
      this.store.select(this.selectorFactory.childrenPathsSelector(this.path)).pipe(takeUntil(this.reset$))
        .subscribe((childrenPaths) => {
          this.c = childrenPaths as ExtractChildrenPaths<TComponentContract>;
        });
      this.e = this.actionFactory.createDispatchers(this.path) as ExtractUiDispatchers<TComponentContract>;
    }
  }

  ngOnDestroy(): void {
    this.reset$.complete();
  }
}

