/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : ionic 5 groceryee app
  Created : 10-Sep-2020
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2020-present initappz.
*/
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: 'http://grocery-api.7days.one/index.php/',
  mediaURL: 'http://grocery-api.7days.one/uploads/',
  onesignal: {
    appId: '8c233767-495a-4a6e-830c-35e3e3630134',
    googleProjectNumber: '867995666894',
    restKey: 'NzE1YmEyZjItNThjOS00ZDk2LThiNDktNmJmYzk1ZjQ2ZGQ3',
  },
  general: {
    symbol: '$',
    code: 'USD',
  },
  authToken: '123456',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
