

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/performance";
import "firebase/analytics";

export function initFirebase(){

    const firebaseConfig = 

    return firebase.initializeApp(firebaseConfig);

}