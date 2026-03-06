import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.css',
})
export class Counter {
  v = { count: 42 };
  d = {
    incrementRequested: () => this.v.count++,
    decrementRequested: () => this.v.count--,
  };
}
