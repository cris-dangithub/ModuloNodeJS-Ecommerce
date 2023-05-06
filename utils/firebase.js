const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  ////authDomain: 'ecommerce-academlo-d94c3.firebaseapp.com', -> No usaremos esto debido a que no tendremos un dominio
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE, // Usar el storageBucked para almacenar las imágenes
  ////messagingSenderId: '303980766820', -> Para trabajar en mensajes en tiempo real
  appId: process.env.FIREBASE_API_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const storage = getStorage(firebaseApp);

module.exports = { storage };
