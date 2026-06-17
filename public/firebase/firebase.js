import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTTALaxakoIoSB0JZQ2h7Q-nxq837Zy34",
    authDomain: "daedalo-bd.firebaseapp.com",
    databaseURL: "https://daedalo-bd-default-rtdb.firebaseio.com",
    projectId: "daedalo-bd",
    storageBucket: "daedalo-bd.firebasestorage.app",
    messagingSenderId: "577862443103",
    appId: "1:577862443103:web:2313536f5bd82d2e9bbbea"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export {
    auth,
    db
};