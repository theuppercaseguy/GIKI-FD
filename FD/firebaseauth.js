// Import the functions you need from the SDKs you need
import * as fb from "firebase/app";
import * as fbauth from "firebase/auth";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6lRmga9r7NzY0mFt-rpoRWZwgSvGoSMU",
  authDomain: "fdfirebaseauth.firebaseapp.com",
  projectId: "fdfirebaseauth",
  storageBucket: "fdfirebaseauth.appspot.com",
  messagingSenderId: "51289235740",
  appId: "1:51289235740:web:f57cd4e1775afa04de9ad9"
};

// Initialize Firebase
let app;
if (fb.getApps.length === 0) {
  app = fb.initializeApp(firebaseConfig);
} else {
  app = fb.getApp();
}

const auth = fbauth.getAuth(app);
const db = getFirestore(app)
const storage = getStorage(app);


export { auth, fbauth, db, storage };