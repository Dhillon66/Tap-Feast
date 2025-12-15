// firebase.js (ES Module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ✅ Replace with YOUR Firebase config
const firebaseConfig = {
apiKey: "AIzaSyDQMujm7yZU3FXGnZ54vsE_JCUrRqBBoXI",
  authDomain: "tap-feast.firebaseapp.com",
  projectId: "tap-feast",
  storageBucket: "tap-feast.firebasestorage.app",
  messagingSenderId: "822742807494",
  appId: "1:822742807494:web:17bbf4749e5572b8b938c7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
};
