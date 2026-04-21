import { Component } from '@angular/core';
import { Contract } from './list-manager.component.contract';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { CreateList } from './create-list/create-list.component.view';
import { Lists } from './lists/lists.component.view';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-list-manager',
  templateUrl: './list-manager.component.html',
  imports: [CreateList, Lists, AsyncPipe],
})
export class ListManager extends AbstractSofterComponent<Contract> {}
