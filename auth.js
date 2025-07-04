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
firebase.initializeApp(firebaseConfig);
if (firebase.analytics && typeof firebase.analytics === 'function') {
    firebase.analytics();
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- DOM Elements ---
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const mainContent = document.querySelector('main');
const navUl = document.querySelector('header nav ul');

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
const DUMMY_DOMAIN = "yourleague.local";

// --- NEW: Add a variable to hold messages across logout ---
let logoutMessage = null;

// --- Logout Button (Dynamic Injection) ---
let logoutLiElement;

function createLogoutButton() {
    if (!navUl) return;
    if (!logoutLiElement) {
        logoutLiElement = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = "#";
        logoutLink.textContent = "Logout";
        logoutLink.style.color = "#fff";
        logoutLink.style.textDecoration = "none";
        logoutLink.style.fontSize = "1.1rem";
        logoutLink.addEventListener('click', handleLogout);
        logoutLiElement.appendChild(logoutLink);
        navUl.appendChild(logoutLiElement);
    }
    logoutLiElement.style.display = 'list-item';
}

function removeLogoutButton() {
    if (logoutLiElement) {
        logoutLiElement.style.display = 'none';
    }
}

// --- Auth State Observer ---
auth.onAuthStateChanged(async (user) => {
  // Clear any previous errors unless a logout message is set
  if (!logoutMessage) {
    authError.textContent = '';
  }

  if (user) {
    // User is signed in. Check if their account is active.
    try {
      const userDocRef = db.collection('users').doc(user.uid);
      const userDoc = await userDocRef.get();

      if (userDoc.exists && userDoc.data().isActive === true) {
        mainContent.classList.add('visible');
        authContainer.style.display = 'none';
        createLogoutButton();
      } else {
        // --- MODIFIED: Set the message before logging out ---
        if (!userDoc.exists) {
            logoutMessage = "User data not found. Please contact admin.";
        } else {
            logoutMessage = "Your account is awaiting approval. Please contact site admin.";
        }
        await auth.signOut();
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      logoutMessage = "Error checking user status. Please try again.";
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

    // --- MODIFIED: Display the logout message if it exists ---
    if (logoutMessage) {
        authError.textContent = logoutMessage;
        logoutMessage = null; // Clear the message after displaying it
    }
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

// --- NEW: Add event listeners for "Enter" key on login form ---
loginUsernameInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        loginButton.click();
    }
});

loginPasswordInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        loginButton.click();
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
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
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
      isActive: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // --- MODIFIED: Set the message before logging out ---
    logoutMessage = "Account created successfully! It is now awaiting admin approval.";
    await auth.signOut();

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

// Initial UI setup
if (!auth.currentUser) {
    mainContent.classList.remove('visible');
    authContainer.style.display = 'block';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    authTitle.textContent = 'Login';
    removeLogoutButton();
}
