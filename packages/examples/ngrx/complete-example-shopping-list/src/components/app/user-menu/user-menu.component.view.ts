import { Component } from '@angular/core';
import { Contract } from './user-menu.component.contract';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  imports: [AsyncPipe],
})
export class UserMenu extends AbstractSofterComponent<Contract> {}
