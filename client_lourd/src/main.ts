import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (window.process && process.versions) {
    console.log('Electron environment detected, forcing browser mode for Firebase');
    // Save original values in case we need them later
    const originalVersions = { ...process.versions };

    // Use type assertion to bypass TypeScript's type checking
    (process.versions as any).node = undefined;
    (process.versions as any).electron = undefined;

    // Restore after Firebase initialization if needed
    setTimeout(() => {
        Object.assign(process.versions, originalVersions);
    }, 1000);
}

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
