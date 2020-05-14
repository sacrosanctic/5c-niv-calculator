import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_APIKEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTHDOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASEURL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.VUE_APP_FIREBASE_APPID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENTID,
  }

// export const db = firebase
//   .initializeApp({
//     apiKey: process.env.VUE_APP_FIREBASE_APIKEY,
//     authDomain: process.env.VUE_APP_FIREBASE_AUTHDOMAIN,
//     databaseURL: process.env.VUE_APP_FIREBASE_DATABASEURL,
//     projectId: process.env.VUE_APP_FIREBASE_PROJECTID,
//     storageBucket: process.env.VUE_APP_FIREBASE_STORAGEBUCKET,
//     messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGINGSENDERID,
//     appId: process.env.VUE_APP_FIREBASE_APPID,
//   })
//   .database()

firebase.initializeApp(firebaseConfig)

export const db = firebase.database()
export const da = firebase.analytics()