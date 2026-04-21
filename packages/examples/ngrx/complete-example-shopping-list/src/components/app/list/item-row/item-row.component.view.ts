import { Component } from '@angular/core';
import { Contract } from './item-row.component.contract';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-item-row',
  templateUrl: './item-row.component.html',
  imports: [AsyncPipe],
  styleUrls: ['./item-row.component.scss'],
})
export class ItemRow extends AbstractSofterComponent<Contract> {}
