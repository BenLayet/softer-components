import { Component } from '@angular/core';
import { Contract } from './sign-in-form.component.contract';
import { AbstractSofterComponent } from '@softer-components/ngrx-adapter';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  imports: [AsyncPipe],
})
export class SignInForm extends AbstractSofterComponent<Contract> {}

