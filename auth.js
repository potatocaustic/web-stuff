// --- Firebase Configuration ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC36oIVrjnLvAdDY66MODI_dI-vVn7HWAw", // Make sure this is your actual API key
  authDomain: "webcaustic-5ccd4.firebaseapp.com",
  projectId: "webcaustic-5ccd4",
  storageBucket: "webcaustic-5ccd4.appspot.com", // Corrected: .appspot.com for storageBucket
  messagingSenderId: "1021802602852",
  appId: "1:1021802602852:web:7cf7dac0ff5b2a2fffda71",
  measurementId: "G-S1QW5SSXDP"
};

// --- Initialize Firebase ---
// Use the global 'firebase' object from the compat SDKs
firebase.initializeApp(firebaseConfig);
if (firebase.analytics && typeof firebase.analytics === 'function') { // Check if analytics is available
    firebase.analytics(); // Initialize Analytics if available
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- DOM Elements ---
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const mainContent = document.querySelector('main');
const navUl = document.querySelector('header nav ul'); // For adding logout button

// Auth UI elements
const authTitle = document.getElementById('auth-title');
const authError = document.getElementById('auth-error');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const showSignupLink = document.getElementById('show-signup');

const signupUsernameInput = document.getElementById('signup-username');
const signupPasswordInput = document.getElementById('signup-password');
const signupConfirmPasswordInput = document.getElementById('signup-confirm-password');
const signupButton = document.getElementById('signup-button');
const showLoginLink = document.getElementById('show-login');

// --- App Constants ---
const DUMMY_DOMAIN = "yourleague.local"; // You can change this if you want

// --- Logout Button (Dynamic Injection) ---
let logoutLiElement; // To store the dynamically created <li> containing the logout button

function createLogoutButton() {
    if (!navUl) return; // Safety check
    if (!logoutLiElement) {
        logoutLiElement = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = "#";
        logoutLink.textContent = "Logout";
        // Apply similar styling as other nav links if needed, via CSS or JS
        logoutLink.style.color = "#fff";
        logoutLink.style.textDecoration = "none";
        logoutLink.style.fontSize = "1.1rem"; // Matches existing nav link style
        logoutLink.addEventListener('click', handleLogout);
        logoutLiElement.appendChild(logoutLink);
        navUl.appendChild(logoutLiElement);
    }
    logoutLiElement.style.display = 'list-item'; // Or 'inline-block' or 'block' depending on your nav styling
}

function removeLogoutButton() {
    if (logoutLiElement) {
        logoutLiElement.style.display = 'none';
    }
}

// --- Auth State Observer ---
auth.onAuthStateChanged(async (user) => {
  authError.textContent = ''; // Clear any previous errors
  if (user) {
    // User is signed in. Check if their account is active in Firestore.
    try {
      const userDocRef = db.collection('users').doc(user.uid);
      const userDoc = await userDocRef.get();

      if (userDoc.exists && userDoc.data().isActive === true) {
        mainContent.classList.add('visible');
        authContainer.style.display = 'none';
        createLogoutButton();

        // Optional: Display welcome message
        // const welcomeMessageElement = document.getElementById('welcome-message');
        // if (welcomeMessageElement) {
        //   welcomeMessageElement.textContent = `Welcome, ${userDoc.data().username}!`;
        //   welcomeMessageElement.style.display = 'block';
        // }

      } else {
        if (!userDoc.exists) {
          authError.textContent = "User data not found. Please contact admin.";
        } else {
          authError.textContent = "Account is disabled or not fully set up. Please contact admin.";
        }
        await auth.signOut();
        // UI update will be handled by the 'else' block of onAuthStateChanged
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      authError.textContent = "Error checking user status. Please try again.";
      await auth.signOut();
    }
  } else {
    // User is signed out
    mainContent.classList.remove('visible');
    authContainer.style.display = 'block';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    authTitle.textContent = 'Login';
    removeLogoutButton();

    // Optional: Hide welcome message
    // const welcomeMessageElement = document.getElementById('welcome-message');
    // if (welcomeMessageElement) welcomeMessageElement.style.display = 'none';
  }
});

// --- Event Listeners for Auth Forms ---
showSignupLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
  authTitle.textContent = 'Sign Up';
  authError.textContent = '';
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.style.display = 'none';
  loginForm.style.display = 'block';
  authTitle.textContent = 'Login';
  authError.textContent = '';
});

loginButton.addEventListener('click', async () => {
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value;
  authError.textContent = '';

  if (!username || !password) {
    authError.textContent = "Please enter username and password.";
    return;
  }
  const emailForFirebase = `${username}@${DUMMY_DOMAIN}`;
  loginButton.disabled = true;
  loginButton.textContent = 'Logging in...';
  try {
    await auth.signInWithEmailAndPassword(emailForFirebase, password);
  } catch (error) {
    console.error("Login error:", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        authError.textContent = "Invalid username or password.";
    } else {
        authError.textContent = "Login failed. Please check console for details.";
    }
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Login';
  }
});

signupButton.addEventListener('click', async () => {
  const username = signupUsernameInput.value.trim();
  const password = signupPasswordInput.value;
  const confirmPassword = signupConfirmPasswordInput.value;
  authError.textContent = '';

  if (!username || !password || !confirmPassword) {
    authError.textContent = "Please fill in all fields.";
    return;
  }
  if (password !== confirmPassword) {
    authError.textContent = "Passwords do not match.";
    return;
  }
  if (password.length < 6) {
    authError.textContent = "Password should be at least 6 characters.";
    return;
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) { // Allow dots and hyphens in username too
    authError.textContent = "Username can only contain letters, numbers, underscores, dots, and hyphens.";
    return;
  }

  const emailForFirebase = `${username}@${DUMMY_DOMAIN}`;
  signupButton.disabled = true;
  signupButton.textContent = 'Signing up...';
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(emailForFirebase, password);
    const user = userCredential.user;
    await db.collection('users').doc(user.uid).set({
      username: username,
      isActive: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 'auth/email-already-in-use') {
      authError.textContent = "This username is already taken. Please choose another.";
    } else if (error.code === 'auth/weak-password') {
      authError.textContent = "Password is too weak. Please choose a stronger one.";
    } else {
      authError.textContent = "Signup failed. Please check console for details.";
    }
  } finally {
    signupButton.disabled = false;
    signupButton.textContent = 'Sign Up';
  }
});

async function handleLogout(e) {
  if (e) e.preventDefault();
  authError.textContent = '';
  try {
    await auth.signOut();
    loginUsernameInput.value = '';
    loginPasswordInput.value = '';
  } catch (error) {
    console.error("Logout error:", error);
    authError.textContent = "Logout failed. Please check console for details.";
  }
}

// Initial UI setup if no user is logged in (onAuthStateChanged will also run)
if (!auth.currentUser) {
    mainContent.classList.remove('visible');
    authContainer.style.display = 'block';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    authTitle.textContent = 'Login';
    removeLogoutButton();
}
