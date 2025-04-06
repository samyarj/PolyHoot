// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    serverUrl: 'http://localhost:3000/api',
    serverUrlSocket: 'http://localhost:3000',
    // production: true,
    // serverUrl: 'http://ec2-15-223-113-26.ca-central-1.compute.amazonaws.com:3000/api',
    // serverUrlSocket: 'ws://ec2-15-223-113-26.ca-central-1.compute.amazonaws.com:3000',
    firebase: {
        apiKey: 'AIzaSyC_qjB-wOAY_C_hFhK51S-_wJHvh9uilDE',
        authDomain: 'polyhoot.firebaseapp.com',
        projectId: 'polyhoot',
        storageBucket: 'polyhoot.firebasestorage.app',
        messagingSenderId: '296806775038',
        appId: '1:296806775038:web:8d66f11ec1c1066d084daf',
        measurementId: 'G-RCX2F6KFKG',
    },
    firebaseClientId: '296806775038-6mh47pmb8go0ujgbqa2tjj4jqhb49qqo.apps.googleusercontent.com',
    // Electron specific configuration
    electron: {
        // List of authorized domains for Firebase authentication in Electron
        authorizedDomains: ['localhost', '127.0.0.1', 'polyhoot.firebaseapp.com'],

        // Server configuration for Electron
        server: {
            port: 4200, // Default port for local server
            useLocalServer: true, // Whether to use a local server in Electron
        },

        // Auth configuration for Electron
        auth: {
            forceRedirect: false, // Force redirection for auth flows
            usePopupForAuth: true, // Use popup for authentication
            enableLogging: true, // Enable detailed auth logging
        },
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
