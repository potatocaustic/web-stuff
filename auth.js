// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyC36oIVrjnLvAdDY66MODI_dI-vVn7HWAw",
  authDomain: "webcaustic-5ccd4.firebaseapp.com",
  projectId: "webcaustic-5ccd4",
  storageBucket: "webcaustic-5ccd4.appspot.com",
  messagingSenderId: "1021802602852",
  appId: "1:1021802602852:web:7cf7dac0ff5b2a2fffda71",
  measurementId: "G-S1QW5SSXDP"
};

// --- Initialize Firebase ---
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const auth = firebase.auth();
const db = firebase.firestore();

// --- DOM Elements ---
const authContainer = document.getElementById('auth-container');
const mainContent = document.getElementById('main-content');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const messageDiv = document.getElementById('message');

let logoutMessage = "";

// --- Auth State Change Logic ---
auth.onAuthStateChanged(async (user) => {
  console.log("Auth state changed. User:", user); // DEBUG

  if (user) {
    console.log("User is signed in. Checking Firestore..."); // DEBUG
    try {
      const userDocRef = db.collection('users').doc(user.uid);
      const userDoc = await userDocRef.get();
      console.log("Firestore user document:", userDoc); // DEBUG
      console.log("User document exists:", userDoc.exists); // DEBUG
      if(userDoc.exists) {
        console.log("User document data:", userDoc.data()); // DEBUG
      }


      if (userDoc.exists && userDoc.data().isActive === true) {
        console.log("User is active. Showing main content."); // DEBUG
        mainContent.classList.add('visible');
        authContainer.style.display = 'none';
        createLogoutButton();
      } else {
        console.log("User is not active or document doesn't exist. Signing out."); // DEBUG
        if (!userDoc.exists) {
          logoutMessage = "User data not found. Please contact admin.";
        } else {
          logoutMessage = "Your account is awaiting admin approval.";
        }
        await auth.signOut();
      }
    } catch (error) {
      console.error("Error checking user status in Firestore: ", error); // DEBUG
      logoutMessage = "Error checking user status. Please try again.";
      await auth.signOut();
    }
  } else {
    console.log("User is signed out."); // DEBUG
    mainContent.classList.remove('visible');
    authContainer.style.display = 'block';
    if (logoutMessage) {
      messageDiv.textContent = logoutMessage;
      logoutMessage = "";
    }
  }
});

// --- Login Form Submission ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  loginButton.textContent = 'Logging in...';
  loginButton.disabled = true;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log("Login successful:", userCredential); // DEBUG
    // The onAuthStateChanged listener will handle the rest
  } catch (error) {
    console.error("Login failed:", error); // DEBUG
    messageDiv.textContent = error.message;
  } finally {
    loginButton.textContent = 'Login';
    loginButton.disabled = false;
  }
});

// --- Logout Button ---
function createLogoutButton() {
  const logoutButton = document.createElement('button');
  logoutButton.id = 'logout-button';
  logoutButton.textContent = 'Logout';
  logoutButton.addEventListener('click', async () => {
    logoutMessage = "You have been logged out.";
    await auth.signOut();
  });
  mainContent.insertBefore(logoutButton, mainContent.firstChild);
}
