/**
 * Copyright 2015 Google Inc. All Rights Reserved.
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
'use strict';

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getPerformance } from 'firebase/performance';

import { getFirebaseConfig } from './firebase-config.js';
let fileList;

let url = new URL(window.location.href);
let getParam = url.searchParams;
// console.log("getPram------"+getParam.get("id"));
// document.getElementById("rakutenItem").innerHTML = getParam.get("id");
// Signs-in Friendly Chat.
async function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
  // TODO 1: Sign in Firebase with credential from the Google user.
}

var i = 0;
var k = 0;
var m = 0;
var textlist = [];
var textlist1 = [];
var textlist2 = [];

// Signs-out of Friendly Chat.
function signOutUser() {
  // TODO 2: Sign out of Firebase.
  // Sign out of Firebase.
  signOut(getAuth());
}

// Initiate firebase auth
function initFirebaseAuth() {
  // TODO 3: Subscribe to the user's signed-in status
  onAuthStateChanged(getAuth(), authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  // TODO 4: Return the user's profile pic URL.
  return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  // TODO 5: Return the user's display name.
  return getAuth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  // TODO 6: Return true if a user is signed-in.
  // console.log("fljasldkfjsdaklfj---"+!!getAuth().currentUser);
  return !!getAuth().currentUser;
}

// Saves a new message on the Cloud Firestore.
async function saveMessage(messageText,address,imgUrl,fileList,comment,checkboxs,fishname,rodname) {
  // TODO 7: Push a new message to Cloud Firestore.
  // Add a new message entry to the Firebase database.
  try {
    let str = [];
    // console.log("111111111111111"+checkboxs.length);

      for (let i = 0; i < checkboxs.length; i++) {
          if ( checkboxs[i].checked === true ) {
              str.push(checkboxs[i].value);
              // console.log("----"+i);
          }
      }
      // console.log("----"+fishname);
      let fishlist;
      if(fishname.indexOf('、') !== -1){
        fishlist = fishname.split('、');
      }else if(fishname.indexOf(',') !== -1){
        fishlist = fishname.split(',');
      }else if(fishname.indexOf('.') !== -1){
        fishlist = fishname.split('.');
      }else{
        fishlist = fishname.split();
      }
      // console.log("-------"+fishlist);

    const messageRef = await addDoc(collection(getFirestore(), 'messages'), {
      name: getUserName(),
      text: messageText,
      address: address,
      imageUrl: imgUrl,
      comment: comment,
      checkboxs: str,
      fishlist: fishlist,
      rodname: rodname,
      profilePicUrl: getProfilePicUrl(),
      timestamp: serverTimestamp()
    });
    // // console.log("file----------------"+fileList);
     // 2 - Upload the image to Cloud Storage.
     const filePath = `${getAuth().currentUser.uid}/${messageRef.id}/${fileList.name}`;
     const newImageRef = ref(getStorage(), filePath);
     const fileSnapshot = await uploadBytesResumable(newImageRef, fileList);
     
     // 3 - Generate a public URL for the file.
     const publicImageUrl = await getDownloadURL(newImageRef);
 
     // 4 - Update the chat message placeholder with the image's URL.
     await updateDoc(messageRef,{
       imageUrl: publicImageUrl,
       storageUri: fileSnapshot.metadata.fullPath
     });
  }
  catch(error) {
    // console.error('Error writing new message to Firebase Database', error);
  }
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  console.log(textlist1.length);
  let num = 6 + textlist1.length;
  console.log("nummmmmmm----"+num);
  // TODO 8: Load and listen for new messages.
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'desc'), limit(num));
  // query(query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'desc'), limit(6)),orderBy("timestamp", "desc"))
  // Start listening to the query.
  onSnapshot(recentMessagesQuery, function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        displayMessage(change.doc.id, message.timestamp, message.name,
                      message.text,message.address, message.profilePicUrl,
                       message.imageUrl,message.comment,message.checkboxs,
                       message.fishlist,message.rodname);
        // // console.log("aaaaaaaaa"+ message.text);
      }
    });
  });
}


function selectItem(id) {
    // console.log("id---"+id);
    // TODO 8: Load and listen for new messages.
    // Create the query to load the last 12 messages and listen for new ones.
    const db = getFirestore();
    const usersRef = collection(db, "messages");
    // .where("fishlist","array-contains",[sqlfishname]).where("rodname","in",[sqlrodname]).where("checkboxs","array-contains-any",[sqlmethodlist])
    const recentSelectQuery = query(usersRef);
    // query(query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'desc'), limit(6)),orderBy("timestamp", "desc"))
    // Start listening to the query.
    onSnapshot(recentSelectQuery, function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
        if (change.type === 'removed') {
            deleteMessage(change.doc.id);
        } else {
            var message = change.doc.data();
            if(change.doc.id == id){
              displaySelectMessage(change.doc.id, message.timestamp, message.name,
                message.text,message.address, message.profilePicUrl,
                message.imageUrl,message.comment,message.checkboxs,
                message.fishlist,message.rodname);
    // // console.log("aaaaaaaaa"+ message.text);
            }           
        }
        });
    });
}
let list = [];

function loadSearchs(spot,fishing,address,method) {
  //ページ再読み込みを防ぐ
  // e.preventDefault();
  // TODO 8: Load and listen for new messages.
  // Create the query to load the last 12 messages and listen for new ones.
  // var fishSearchElement  = document.getElementById('fishingIndex_search_text');
  // var rodSearchElement   = document.getElementById('rodIndex_search_text');
  // var checkSearchElement = document.getElementById('checsearch');
  //スポット名、魚名、ルアー釣り竿釣り具名、釣り方
  console.log("99999^--");
  console.log(spot);
  console.log(fishing);
  console.log(address);
  console.log(method);
  let sqlmethodlist = [];


  // const sqlspotname = "";
  // const sqlfishname = "";
  // const sqlrodname = "";
  // if(spot != ""){
  //   sqlspotname = spot;
  // }
  // if(fishing != ""){
  //   sqlfishname = fishing;
  // }
  // if(rod != ""){
  //   sqlrodname = rod;
  // }
  if(method.length !== 0){
    // sqlmethodlist.push(method);
    for(let i = 0; i < method.length; i++){
      sqlmethodlist[i] = method[i];
    }
  }else{
    let methodlist = ["サビキ釣り","ルアー釣り","ウキ釣り","投げ釣り","カカゴ釣り","ぶっこみ釣り","胴付き仕掛け","泳がせ釣り"];
    console.log(methodlist);
    for(let i = 0; i < methodlist.length; i++){
        sqlmethodlist[i] = methodlist[i];
    }
  }
  console.log(sqlmethodlist);
  const db = getFirestore();
  const usersRef = collection(db, "messages");
  // .where("fishlist","array-contains",[sqlfishname]).where("rodname","in",[sqlrodname]).where("checkboxs","array-contains-any",[sqlmethodlist])
  const recentSearchQuery = query(usersRef, where("checkboxs","array-contains-any",sqlmethodlist));
  // query(query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'desc'), limit(6)),orderBy("timestamp", "desc"))
  // Start listening to the query.
  onSnapshot(recentSearchQuery, function(snapshot) {
    //e.preventDefault()のせいで追加　すでにあるidのdivを削除
    // list.forEach(function(element){
    //   var div = document.getElementById(element);
    //   // If an element for that message exists we delete it.
    //   if (div) {
    //     div.parentNode.removeChild(div);
    //   }
    // });  
    
    snapshot.docChanges().forEach(function(change) {
      // document.querySelector('#'+change.doc.id).off();
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var search = change.doc.data();
        if(spot != "" && search.text.indexOf(spot) != -1){
          if(fishing != ""){
             for(let i = 0; i < search.fishlist.length; i++){
               if(search.fishlist[i].indexOf(fishing) != -1){
                displaySearchMessage(change.doc.id, search.timestamp, search.name,
                  search.text,search.address, search.profilePicUrl,
                  search.imageUrl,search.comment,search.checkboxs,
                  search.fishlist,search.rodname);
               }
             }
          }else{
            console.log("uuuuuuiiii");
            displaySearchMessage(change.doc.id, search.timestamp, search.name,
              search.text,search.address, search.profilePicUrl,
              search.imageUrl,search.comment,search.checkboxs,
              search.fishlist,search.rodname);
          }         
        }else{
          if(fishing != ""){
            for(let i = 0; i < search.fishlist.length; i++){
              if(search.fishlist[i].indexOf(fishing) != -1){
               displaySearchMessage(change.doc.id, search.timestamp, search.name,
                 search.text,search.address, search.profilePicUrl,
                 search.imageUrl,search.comment,search.checkboxs,
                 search.fishlist,search.rodname);
              }
            }
          } 
          // displaySearchMessage(change.doc.id, search.timestamp, search.name,
          //   search.text,search.address, search.profilePicUrl,
          //   search.imageUrl,search.comment,search.checkboxs,
          //   search.fishlist,search.rodname);

        }
        // else if(fishing != ""){
        //   for(let i = 0; i < search.fishlist.length;i++){
        //     if()
        //   }
        // }
      }
    });
  });
}

// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
// async function saveImageMessage(file) {
//   // TODO 9: Posts a new image as a message.
//   try {
//     // 1 - We add a message with a loading icon that will get updated with the shared image.
//     const messageRef = await addDoc(collection(getFirestore(), 'messages'), {
//       name: getUserName(),
//       imageUrl: LOADING_IMAGE_URL,
//       profilePicUrl: getProfilePicUrl(),
//       timestamp: serverTimestamp()
//     });

//     // 2 - Upload the image to Cloud Storage.
//     const filePath = `${getAuth().currentUser.uid}/${messageRef.id}/${file.name}`;
//     const newImageRef = ref(getStorage(), filePath);
//     const fileSnapshot = await uploadBytesResumable(newImageRef, file);
    
//     // 3 - Generate a public URL for the file.
//     const publicImageUrl = await getDownloadURL(newImageRef);

//     // 4 - Update the chat message placeholder with the image's URL.
//     await updateDoc(messageRef,{
//       imageUrl: publicImageUrl,
//       storageUri: fileSnapshot.metadata.fullPath
//     });
//   } catch (error) {
//     // console.error('There was an error uploading a file to Cloud Storage:', error);
//   }
// }

// Saves the messaging device token to Cloud Firestore.
async function saveMessagingDeviceToken() {
  // TODO 10: Save the device token in Cloud Firestore
  try {
    const currentToken = await getToken(getMessaging());
    if (currentToken) {
      // console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to Cloud Firestore.
      const tokenRef = doc(getFirestore(), 'fcmTokens', currentToken);
      await setDoc(tokenRef, { uid: getAuth().currentUser.uid });

      // This will fire when a message is received while the app is in the foreground.
      // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
      onMessage(getMessaging(), (message) => {
        console.log(
          'New foreground notification from Firebase Messaging!',
          message.notification
        );
      });
    } else {
      // Need to request permissions to show notifications.
      requestNotificationsPermissions();
    }
  } catch(error) {
    // console.error('Unable to get messaging token.', error);
  };
}

// Requests permissions to show notifications.
async function requestNotificationsPermissions() {
  // TODO 11: Request permissions to send notifications.
  // console.log('Requesting notifications permission...');
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    // console.log('Notification permission granted.');
    // Notification permission granted.
    await saveMessagingDeviceToken();
  } else {
    // console.log('Unable to get permission to notify.');
  }
}
// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  fileList = event.target.files[0];
  // Clear the selection in the file picker input.
  // imageFormElement.reset();

  // Check if the file is an image.
  if (!fileList.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000,
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  // if (checkSignedInWithMessage()) {
  //   saveImageMessage(file);
  // }
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  // // console.log("checkSignedInWithMessage"+checkSignedInWithMessage());
  if(messageInputElement.value && checkSignedInWithMessage() && addressInputElement.value && mediaCaptureElement.value && commentInputElement.value){
    modal.style.display = 'none';
    saveMessage(messageInputElement.value,addressInputElement.value,mediaCaptureElement.value,fileList,commentInputElement.value,checkInputElement,fishnameInputElement.value,rodnameInputElement.value).then(function () {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield(messageInputElement);
      resetMaterialTextfield(commentInputElement);
      resetMaterialTextfield(addressInputElement);
      resetMaterialTextfield(mediaCaptureElement);
      resetMaterialTextfield(fishnameInputElement);
      resetMaterialTextfield(rodnameInputElement);
      toggleButton();


    });
  }
}

// 

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) {
    // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage =
      'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    signInButtonElement.setAttribute('hidden', 'true');

    // We save the Firebase Messaging Device token and enable notifications.
    saveMessagingDeviceToken();
  } else {
    // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInButtonElement.removeAttribute('hidden');
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  // var data = {
  //   message: 'You must sign-in first',
  //   timeout: 2000,
  // };
  signInSnackbarElement.innerHTML = "サインインしてください";
  return false;
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  // element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Template for messages.
const MESSAGE_TEMPLATE =
  '<div class="message-container spot_card">' + 
  '<a id="link" href="public.html">' +
  '<div class="image"></div>' +
  '<div class="spot_card_content">' +
  '<div class="spacing"><div class="pic"></div></div>' +
  '<div class="message"></div>' +
  '<div class="name spot_card_name"></div>' +
  '<div class="address"></div>' +
  '<div class="fishlist"></div>' +
  '<div class="rodname"></div>' +
  '<div class="str"></div>' +
  '<div class="comment"></div>' +
  '<div class="timestamp"></div>' +
  '</div>' + 
  '</a>' +
  '</div>';

  const MESSAGE_TEMPLATE1 =
  '<div class="message-container spot_card">' + 
  '<a id="link1" href="public.html">' +
  '<div class="image1"></div>' +
  '<div class="spot_card_content">' +
  '<div class="spacing"><div class="pic1"></div></div>' +
  '<div class="message1"></div>' +
  '<div class="address1"></div>' +
  '<div class="name1 spot_card_name"></div>' +
  '<div class="fishlist1"></div>' +
  '<div class="rodname1"></div>' +
  '<div class="str1"></div>' +
  '<div class="comment1"></div>' +
  '<div class="timestamp1"></div>' +
  '</div>' + 
  '</a>' +
  '</div>';

  const MESSAGE_TEMPLATE2 =
  '<div class="message-container spot_card">' +
  '<div class="image2"></div>' +
  '<div class="spot_card_content">' +
  '<div class="spacing"><div class="pic2" style=""></div></div>' +
  '<div class="message2"></div>' +
  '<div class="address2"></div>' +
  '<div class="name2 spot_card_name"></div>' +
  '<div class="fishlist2"></div>' +
  '<div class="rodname2"></div>' +
  '<div class="str2"></div>' +
  '<div class="comment2"></div>' +
  '<div class="timestamp2"></div>' +
  '</div>' + 
  '</a>' +
  '</div>';

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// A loading image URL.
// var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Delete a Message from the UI.
function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

function createAndInsertMessage(id, timestamp) {
  const container = document.createElement('div');
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute('id', id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);
  // console.log("11111111111111111--");
  // console.log(messageListElement);

  // figure out where to insert new message
  const existingMessages = messageListElement.children;
  if (existingMessages.length === 0) {
    messageListElement.appendChild(div);
    // // console.log("existingMessages----------22--");
    // // console.log(div);
  } else {
    let messageListNode = existingMessages[0];
    // console.log(messageListNode);
    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    messageListElement.insertBefore(div, messageListNode);
  }

  return div;
}

function createAndSelectMessage(id, timestamp) {
  const container = document.createElement('div');
  container.innerHTML = MESSAGE_TEMPLATE2;
  console.log(container);
  const div = container.firstChild;
  div.setAttribute('id', id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);

  // figure out where to insert new message
  const existingMessages = selectListElement.children;
  if (existingMessages.length === 0) {
    selectListElement.appendChild(div);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    selectListElement.insertBefore(div, messageListNode);
  }

  return div;
}

function createAndSearchMessage(id, timestamp) {
  var container1 = document.createElement('div');
  container1.innerHTML = MESSAGE_TEMPLATE1;
  const div = container1.firstChild;
  div.setAttribute('id', id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);

  // figure out where to insert new message
  const existingMessages = resultListElement.children;
  // console.log("existingMessages----------");
  // // console.log(div);
  // console.log(resultListElement);

  if (existingMessages.length === 0) {  
    // console.log(div);
    resultListElement.appendChild(div);
    // console.log(resultListElement);
  } else {
    let messageListNode = existingMessages[0];
    // console.log("existingMessages----------11--");
    // console.log(messageListNode);
    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    resultListElement.insertBefore(div, messageListNode);
    // console.log("existingMessages---");
    // console.log(div);

  }

  return div;
}

// Displays a Message in the UI.
function displayMessage(id, timestamp, name, text, address, picUrl, imageUrl,comment,str,fishlist,rodname) {
  var ket = false;
  var met = false;
  var div = 
    document.getElementById(id) || createAndInsertMessage(id, timestamp);
    textlist.push(text);
    // // console.log("text!!"+i+"----------"+text);
    // // console.log("div--------"+div.querySelector('.pic').style);
    for(let se = 0;se < k;se++){
      if(text == textlist1[se]){
        ket = true;
        // console.log("tureuuuuuuu");
      }
    }

    for(let se = 0;se < m;se++){
      if(text == textlist2[se]){
        met = true;
        // console.log("tureeeeeeeeeeeeeeeee");
      }
    }
 
  // console.log("i----"+i);
  // console.log("k----"+k);
  // // console.log("textlist----"+textlist[2]);
  // // console.log("textlist1----"+textlist1[0]);

// // console.log("ket----"+ket);
  if(ket == false && met == false){
    // profile picture
    // console.log(div);
    if (picUrl) {
      div.querySelector('.pic').style.backgroundImage =
        'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
    }
    div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.message');
    var addressElement = div.querySelector('.address');
    var imageElement = div.querySelector('.image');
    var commentElement = div.querySelector('.comment');
    var checkElement = div.querySelector('.str');
    var fishlistElement = div.querySelector('.fishlist');
    var rodnameElement = div.querySelector('.rodname');
    var timestampElement = div.querySelector('.timestamp');

    var link = div.querySelector('#link');
    let url = 'public.html?id='+id;
    // // console.log("url----"+url);
    link.setAttribute('href',url);

    if (text) {
      // If the message is text.
      messageElement.textContent = text;
      // Replace all line breaks by <br>.
      messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
    }
    if (imageUrl) {
      // If the message is an image.
      var image = document.createElement('img');
      image.addEventListener('load', function () {
        messageListElement.scrollTop = messageListElement.scrollHeight;
      });
      image.src = imageUrl + '&' + new Date().getTime();
      imageElement.innerHTML = '';
      imageElement.appendChild(image);
    }
    if (address){
      addressElement.textContent = address;
      addressElement.innerHTML = addressElement.innerHTML.replace(/\n/g, '<br>');
    }
    if (comment){
      commentElement.textContent = comment;
      commentElement.innerHTML = commentElement.innerHTML.replace(/\n/g, '<br>');
    }
    if (str){
      str = str.join(' ');
      checkElement.innerHTML = '';
      checkElement.textContent = str;
      checkElement.innerHTML = checkElement.innerHTML.replace(/\n/g, '<br>');
    }
    if(fishlist){
      fishlist = fishlist.join(' ');
      fishlistElement.innerHTML = '';
      fishlistElement.textContent = fishlist;
      fishlistElement.innerHTML = fishlistElement.innerHTML.replace(/\n/g, '<br>');
    }
    if(rodname){
      rodnameElement.textContent = rodname;
      rodnameElement.innerHTML = rodnameElement.innerHTML.replace(/\n/g, '<br>');
    }
    timestamp = timestamp ? timestamp.toMillis() : Date.now();
    timestampElement.textContent = timestamp;
    timestampElement.innerHTML = timestampElement.innerHTML.replace(/\n/g, '<br>');
    // // console.log("-------timestamp"+ i + "----"+timestamp);
    i++;
    // Show the card fading-in and scroll to view the new message.
    setTimeout(function () {
      div.classList.add('visible');
    }, 1);
    // // console.log(div)
    messageListElement.scrollTop = messageListElement.scrollHeight;
    // messageInputElement.focus();
    // addressInputElement.focus();
    // commentInputElement.focus();
    // fishnameInputElement.focus();
    // rodnameInputElement.focus();
      }
      
    }

    // Displays a Message in the UI.
    function displaySearchMessage(id1, timestamp1, name1, text1, address1, picUrl1, imageUrl1,comment1,str1,fishlist1,rodname1) {
      // console.log(id1);
      k++;
      var div1 = createAndSearchMessage(id1, timestamp1);
        // // console.log("text!!"+k+"----------"+text1);
        textlist1.push(text1);
        // console.log("iiiiiiiiiiiiiiiiii---");
        // console.log(div1);
      // profile picture
      if (picUrl1) {
        div1.querySelector('.pic1').style.backgroundImage =
          'url(' + addSizeToGoogleProfilePic(picUrl1) + ')';
      }
      div1.querySelector('.name1').textContent = name1;
      var messageElement1 = div1.querySelector('.message1');
      var addressElement1 = div1.querySelector('.address1');
      var imageElement1 = div1.querySelector('.image1');
      var commentElement1 = div1.querySelector('.comment1');
      var checkElement1 = div1.querySelector('.str1');
      var fishlistElement1 = div1.querySelector('.fishlist1');
      var rodnameElement1 = div1.querySelector('.rodname1');
      var timestampElement1 = div1.querySelector('.timestamp1');

      var link = div1.querySelector('#link1');
      let url = 'public.html?id='+id1;
      // // console.log("url----"+url);
      link.setAttribute('href',url);

      if (text1) {
        // If the message is text.
        messageElement1.textContent = text1;
        // Replace all line breaks by <br>.
        messageElement1.innerHTML = messageElement1.innerHTML.replace(/\n/g, '<br>');
      }
      if (imageUrl1) {
        // If the message is an image.
        var image = document.createElement('img');
        image.addEventListener('load', function () {
          resultListElement.scrollTop = resultListElement.scrollHeight;
        });
        image.src = imageUrl1 + '&' + new Date().getTime();
        imageElement1.innerHTML = '';
        imageElement1.appendChild(image);
      }
      if (address1){
        addressElement1.textContent = address1;
        addressElement1.innerHTML = addressElement1.innerHTML.replace(/\n/g, '<br>');
      }
      if (comment1){
        commentElement1.textContent = comment1;
        commentElement1.innerHTML = commentElement1.innerHTML.replace(/\n/g, '<br>');
      }
      if (str1){
        str1 = str1.join(' ');
        checkElement1.innerHTML = '';
        checkElement1.textContent = str1;
        checkElement1.innerHTML = checkElement1.innerHTML.replace(/\n/g, '<br>');
      }
      if(fishlist1){
        fishlist1 = fishlist1.join(' ');
        fishlistElement1.innerHTML = '';
        fishlistElement1.textContent = fishlist1;
        fishlistElement1.innerHTML = fishlistElement1.innerHTML.replace(/\n/g, '<br>');
      }
      if(rodname1){
        rodnameElement1.textContent = rodname1;
        rodnameElement1.innerHTML = rodnameElement1.innerHTML.replace(/\n/g, '<br>');
      }
      timestamp1 = timestamp1 ? timestamp1.toMillis() : Date.now();
      timestampElement1.textContent = timestamp1;
      timestampElement1.innerHTML = timestampElement1.innerHTML.replace(/\n/g, '<br>');
      // // console.log("-------timestamp"+ i + "----"+timestamp);
      // Show the card fading-in and scroll to view the new message.
      setTimeout(function () {
        div1.classList.add('visible');
      }, 1);
      // console.log(div1);

      resultListElement.scrollTop = resultListElement.scrollHeight;
      // messageInputElement.focus();
      // addressInputElement.focus();
      // commentInputElement.focus();
      // fishnameInputElement.focus();
      // rodnameInputElement.focus();
}

// Enables or disables the submit button depending on the values of the input

// Displays a Message in the UI.
function displaySelectMessage(id2, timestamp2, name2, text2, address2, picUrl2, imageUrl2,comment2,str2,fishlist2,rodname2) {
  var div2 =
    document.getElementById(id2) || createAndSelectMessage(id2, timestamp2);
    // // console.log("text!!"+k+"----------"+text1);
  // // console.log("picUrl2----"+picUrl2);
  textlist2.push(text2);

  // profile picture
  if (picUrl2) {
    div2.querySelector('.pic2').style.backgroundImage =
      'url(' + addSizeToGoogleProfilePic(picUrl2) + ')';
  }
  div2.querySelector('.name2').textContent = name2;
  var messageElement2 = div2.querySelector('.message2');
  var addressElement2 = div2.querySelector('.address2');
  var imageElement2 = div2.querySelector('.image2');
  var commentElement2 = div2.querySelector('.comment2');
  var checkElement2 = div2.querySelector('.str2');
  var fishlistElement2 = div2.querySelector('.fishlist2');
  var rodnameElement2 = div2.querySelector('.rodname2');
  var timestampElement2 = div2.querySelector('.timestamp2');

  if (text2) {
    // If the message is text.
    messageElement2.textContent = text2;
    // Replace all line breaks by <br>.
    messageElement2.innerHTML = messageElement2.innerHTML.replace(/\n/g, '<br>');
  }
  if (imageUrl2) {
    // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function () {
      selectListElement.scrollTop = selectListElement.scrollHeight;
    });
    image.src = imageUrl2 + '&' + new Date().getTime();
    imageElement2.innerHTML = '';
    imageElement2.appendChild(image);
  }
  if (address2){
    addressElement2.textContent = address2;
    addressElement2.innerHTML = addressElement2.innerHTML.replace(/\n/g, '<br>');
  }
  if (comment2){
    commentElement2.textContent = comment2;
    commentElement2.innerHTML = commentElement2.innerHTML.replace(/\n/g, '<br>');
  }
  if (str2){
    str2 = str2.join(' ');
    checkElement2.innerHTML = '';
    checkElement2.textContent = str2;
    checkElement2.innerHTML = checkElement2.innerHTML.replace(/\n/g, '<br>');
  }
  if(fishlist2){
    fishlist2 = fishlist2.join(' ');
    fishlistElement2.innerHTML = '';
    fishlistElement2.textContent = fishlist2;
    fishlistElement2.innerHTML = fishlistElement2.innerHTML.replace(/\n/g, '<br>');
  }
  if(rodname2){
    var atagu = document.createElement('a');
    var lavel = document.createElement('lavel');
    let url2 = 'goods.html?goods='+rodname2;
    atagu.href = url2;
    atagu.textContent = "比較";
    lavel.textContent = rodname2;
    // console.log("ataguuuu----");
    // console.log(atagu);
    // rodnameElement2.textContent = rodname2;
    // rodnameElement2.innerHTML = rodnameElement2.innerHTML.replace(/\n/g, '<br>');
    
    // rodnameElement2.innerHTML = '';
    rodnameElement2.appendChild(lavel);    
    rodnameElement2.appendChild(atagu);   
 
  }
  timestamp2 = timestamp2 ? timestamp2.toMillis() : Date.now();
  timestampElement2.textContent = timestamp2;
  timestampElement2.innerHTML = timestampElement2.innerHTML.replace(/\n/g, '<br>');
  m++;
  // // console.log("-------timestamp"+ i + "----"+timestamp);
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function () {
    div2.classList.add('visible');
  }, 1);
  selectListElement.scrollTop = selectListElement.scrollHeight;
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value && addressInputElement.value && mediaCaptureElement.value && commentInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Shortcuts to DOM Elements.
var messageListElement   = document.getElementById('messages');
var resultListElement   = document.getElementById('result');
var selectListElement   = document.getElementById('selects');
var messageFormElement   = document.getElementById('message-form');
var spotSearchtopElement = document.getElementById('spot_search_top');
var messageInputElement  = document.getElementById('message');
var addressInputElement  = document.getElementById('address');
var commentInputElement  = document.getElementById('comment');
var fishnameInputElement = document.getElementById('fishname');
var rodnameInputElement  = document.getElementById('rodname');
var checkInputElement    = document.getElementsByClassName('checkboxs');
var spotSearchElement = getParam.get("spotIndex_search_text");
var fishingSearchElement = getParam.get("fishingIndex_search_text");
var addressSearchElement = getParam.get("addressIndex_search_text");
var methodSearchElement = getParam.getAll("method");

var submitButtonElement   = document.getElementById('submit');
var searchButtonElement   = document.getElementById('searchbtn');
// var imageButtonElement = document.getElementById('submitImage');
// var imageFormElement   = document.getElementById('image-form');
var mediaCaptureElement   = document.getElementById('mediaCapture');
var userPicElement        = document.getElementById('user-pic');
var userNameElement       = document.getElementById('user-name');
var signInButtonElement   = document.getElementById('sign-in');
var signOutButtonElement  = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');
//モーダル表示
const buttonOpen = document.getElementById('modalOpen');
const modal = document.getElementById('easyModal');
const buttonClose = document.getElementsByClassName('modalClose')[0];

// Saves message on form submit.

  



// spotSearchtopElement.addEventListener('submit', loadSearchs);


// checkInputElement.addEventListener('keyup', toggleButton);
// checkInputElement.addEventListener('change', toggleButton);
// Events for image upload.
// imageButtonElement.addEventListener('click', function (e) {
//   e.preventDefault();
//   mediaCaptureElement.click();
// });


const firebaseAppConfig = getFirebaseConfig();
// TODO 0: Initialize Firebase
initializeApp(firebaseAppConfig);

// TODO 12: Initialize Firebase Performance Monitoring
initFirebaseAuth();

if(getParam.get("goods") != null){
  //goodsページ処理
}else{
  //最新の投稿表示
  if(getParam.get("id") != null){
    //publicページ処理
    selectItem(getParam.get("id"));
    loadMessages();
  }else if(url.href === "http://localhost:5000/"){
    //トップページ処理
    loadMessages();

    //検索
    // ボタンがクリックされた時
    buttonOpen.addEventListener('click', modalOpen);
      function modalOpen() {
      modal.style.display = 'block';
    }

    // バツ印がクリックされた時
    buttonClose.addEventListener('click', modalClose);
    function modalClose() {
      modal.style.display = 'none';
    }

    // モーダルコンテンツ以外がクリックされた時
    addEventListener('click', outsideClose);
    function outsideClose(e) {
      if (e.target == modal) {
        modal.style.display = 'none';
      }
    }
  }else{
    console.log(url.href)
    searchButtonElement.addEventListener('click',loadSearchs(spotSearchElement,fishingSearchElement,addressSearchElement,methodSearchElement));
     //トップページ処理
     loadMessages();

     //検索
     // ボタンがクリックされた時
     buttonOpen.addEventListener('click', modalOpen);
       function modalOpen() {
       modal.style.display = 'block';
     }
 
     // バツ印がクリックされた時
     buttonClose.addEventListener('click', modalClose);
     function modalClose() {
       modal.style.display = 'none';
     }
 
     // モーダルコンテンツ以外がクリックされた時
     addEventListener('click', outsideClose);
     function outsideClose(e) {
       if (e.target == modal) {
         modal.style.display = 'none';
       }
     }
  }
  //top&publicページ処理
  //画像がいれられたとき
  mediaCaptureElement.addEventListener('change', onMediaFileSelected);
  // submitButtonElement.addEventListener('click',onMessageFormSubmit);
  messageFormElement.addEventListener('submit', onMessageFormSubmit);
  signOutButtonElement.addEventListener('click', signOutUser);
  signInButtonElement.addEventListener('click', signIn);
  // Toggle for the button.非活性
  messageInputElement.addEventListener('keyup', toggleButton);
  messageInputElement.addEventListener('change', toggleButton);
  addressInputElement.addEventListener('keyup', toggleButton);
  addressInputElement.addEventListener('change', toggleButton);
  commentInputElement.addEventListener('keyup', toggleButton);
  commentInputElement.addEventListener('change', toggleButton);
  fishnameInputElement.addEventListener('keyup', toggleButton);
  fishnameInputElement.addEventListener('change', toggleButton);
  rodnameInputElement.addEventListener('keyup', toggleButton);
  rodnameInputElement.addEventListener('change', toggleButton);
}
// TODO: Enable Firebase Performance Monitoring.
getPerformance();
