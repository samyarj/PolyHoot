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
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
