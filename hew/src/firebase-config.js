/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  apiKey: "AIzaSyCjdQor-p4Q_yHHNiO4hA81m3dY0xkUl2Q",
  authDomain: "friendlychat-2d0c1.firebaseapp.com",
  projectId: "friendlychat-2d0c1",
  storageBucket: "friendlychat-2d0c1.appspot.com",
  messagingSenderId: "543882519980",
  appId: "1:543882519980:web:7a1022a3832e37f4fc0609"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}