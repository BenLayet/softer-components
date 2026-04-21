import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { App } from './components/app/app.component.view';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
