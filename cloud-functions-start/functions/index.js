/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO(DEVELOPER): Import the Cloud Functions for Firebase and the Firebase Admin modules here.
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// const admin = require('firebase-admin');
admin.initializeApp();
// TODO(DEVELOPER): Write the addWelcomeMessages Function here.
exports.addWelcomeMessages = functions.auth.user().onCreate(async (user) => {
    functions.logger.log('初めてサインインした新しいユーザー');
    const fullName = user.displayName || 'Anonymous';

    await admin.firestore().collection('messages').add({
        name: 'a',
        profilePicUrl: '/images/firebase-logo.png',
        text: `$(fullName) watch ようこそ`,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    functions.logger.log('データベースに書き込まれるウエルカムメッセージ');
});
// TODO(DEVELOPER): Write the blurOffensiveImages Function here.
const { blurOffensiveImages } = require("./img");
exports.blurOffensiveImages = blurOffensiveImages;
// TODO(DEVELOPER): Write the sendNotifications Function here.

import fetch from 'node-fetch';

// function url(url){
//     const res = await fetch('https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=dj00aiZpPTBZYm1vTU1hTGswViZzPWNvbnN1bWVyc2VjcmV0Jng9MDg-&query=nike');
//     const data = await res.json();
// }


console.log(data);
