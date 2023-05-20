

import firebase, { firestore } from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/performance";
import "firebase/analytics";

export function initFirebase(){

    const firebaseConfig = {
        apiKey: "AIzaSyARdLR-KLX2WmuFiGnMeuoAEFjPa7X2Z9M",
        authDomain: "geofableforge.firebaseapp.com",
        projectId: "geofableforge",
        storageBucket: "geofableforge.appspot.com",
        messagingSenderId: "14145989637",
        appId: "1:14145989637:web:a53029e0fb012a1826c06c",
        measurementId: "G-8F3V2V2W36"
    };

    firebase.initializeApp(firebaseConfig);

}