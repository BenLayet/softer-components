import { Component } from '@angular/core';
import { Contract } from './lists.component.contract';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  imports: [AsyncPipe],
})
export class Lists extends AbstractSofterComponent<Contract> {}
