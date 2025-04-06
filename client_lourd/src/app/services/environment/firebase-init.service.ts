// Create this file in src/app/services/firebase-init.service.ts

import { Injectable } from '@angular/core';
import { Auth, connectAuthEmulator, getAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, Firestore, getFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { EnvironmentService } from './environment.service';

const DEFAULT_PORT = 8080;

@Injectable({
    providedIn: 'root',
})
export class FirebaseInitService {
    constructor(private environmentService: EnvironmentService) {}

    /**
     * Initialize Firebase with proper configuration for the current environment
     */
    initializeFirebase(): void {
        // Get auth instance
        const auth = getAuth();
        const firestore = getFirestore();

        // Apply special Electron configurations if needed
        if (this.environmentService.isElectron) {
            console.log('Initializing Firebase for Electron environment');

            if (!environment.production) {
                // Use emulators for local development
                this.setupEmulators(auth, firestore);
            }

            // Fix OAuth redirect domain issues in Electron
            this.setupOAuthForElectron(auth);
        }
    }

    /**
     * Set up Firebase emulators for local development
     */
    private setupEmulators(auth: Auth, firestore: Firestore): void {
        try {
            // Connect to emulators if available
            connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            connectFirestoreEmulator(firestore, 'localhost', DEFAULT_PORT);
            console.log('Connected to Firebase emulators');
        } catch (error) {
            console.error('Failed to connect to emulators:', error);
        }
    }

    /**
     * Set up OAuth configurations specifically for Electron
     */
    private setupOAuthForElectron(auth: Auth): void {
        // Apply any Electron-specific settings
        auth.useDeviceLanguage();

        // Listen for auth state changes to debug
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('User is signed in in Electron environment:', user.uid);
            } else {
                console.log('User is signed out in Electron environment');
            }
        });
    }
}
