import { Component } from '@angular/core';
import { CounterContract } from './counter.component';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
})
export class Counter extends AbstractSofterComponent<CounterContract> {}
