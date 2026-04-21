import { Component } from '@angular/core';
import { CounterContract } from './counter.component';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  imports: [AsyncPipe],
})
export class Counter extends AbstractSofterComponent<CounterContract> {}
