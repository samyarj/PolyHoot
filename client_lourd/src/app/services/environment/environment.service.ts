import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EnvironmentService {
    private isElectronEnv: boolean = false;

    constructor() {
        this.isElectronEnv = this.detectElectron();
    }

    /**
     * Detects if the app is running in Electron
     */
    private detectElectron(): boolean {
        // Check if window is defined (SSR check)
        if (typeof window !== 'undefined') {
            // Check for Electron using various approaches
            return !!(
                window &&
                // Check process type
                ((window.process &&
                    // Use type assertion to avoid TypeScript error
                    (window.process as any).type === 'renderer') ||
                    // Check for electron versions in process
                    window.process?.versions?.electron ||
                    // Check for additional Electron indicators
                    (window as any).electron ||
                    navigator.userAgent.toLowerCase().includes('electron'))
            );
        }
        return false;
    }

    /**
     * Returns whether the application is running in Electron
     */
    get isElectron(): boolean {
        return this.isElectronEnv;
    }

    /**
     * Returns whether the application is running in a web browser
     */
    get isBrowser(): boolean {
        return !this.isElectronEnv;
    }
}
