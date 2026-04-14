import { Component } from '@angular/core';
import { Contract } from './app.component.contract';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { UserMenu } from './user-menu/user-menu.component.view';
import { ListManager } from './list-manager/list-manager.component.view';
import { List } from './list/list.component.view';
import { SignInForm } from './sign-in-form/sign-in-form.component.view';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [UserMenu, ListManager, List, SignInForm, AsyncPipe],
})
export class App extends AbstractSofterComponent<Contract> {}
