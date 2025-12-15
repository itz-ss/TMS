importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDbO0XHiW0nZ9XjEYQZTaA4JuKNwl8xScU",
  authDomain: "taskmanagementsystem-a4bec.firebaseapp.com",
  projectId: "taskmanagementsystem-a4bec",
  storageBucket: "taskmanagementsystem-a4bec.firebasestorage.app",
  messagingSenderId: "784519525202",
  appId: "1:784519525202:web:3d27b457bbd5393a0a808b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // console.log("🟡 Background FCM:", payload);

  self.registration.showNotification(
    payload.notification?.title || "New Notification",
    {
      body: payload.notification?.body || "",
      icon: "/logo.png",
    }
  );
});
