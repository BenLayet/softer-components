import { Component } from '@angular/core';
import { Contract } from './create-list.component.contract';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-create-list',
  templateUrl: './create-list.component.html',
  imports: [AsyncPipe],
})
export class CreateList extends AbstractSofterComponent<Contract> {}
