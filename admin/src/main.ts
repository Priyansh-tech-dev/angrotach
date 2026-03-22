import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AdminAppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AdminAppModule)
  .catch(err => console.error(err));
