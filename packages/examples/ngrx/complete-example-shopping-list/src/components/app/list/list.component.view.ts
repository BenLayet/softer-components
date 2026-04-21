import { Component } from '@angular/core';
import { Contract } from './list.component.contract';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { AsyncPipe } from '@angular/common';
import { ItemRow } from './item-row/item-row.component.view';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  imports: [AsyncPipe, ItemRow],
})
export class List extends AbstractSofterComponent<Contract> {}

