import { Component } from '@angular/core';
import { CounterContract } from './counter.component';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  imports: [FormsModule],
})
export class Counter extends AbstractSofterComponent<CounterContract> {}
