document.addEventListener('DOMContentLoaded', () => {
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
    const mainContent = document.querySelector('main');
    const messageDiv = document.getElementById('auth-error');
    
    // Login Form
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');
    
    // NEW DOM ELEMENTS: Signup Form & UI Toggles
    const signupForm = document.getElementById('signup-form');
    const signupUsernameInput = document.getElementById('signup-username');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupConfirmPasswordInput = document.getElementById('signup-confirm-password');
    const signupButton = document.getElementById('signup-button');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const authTitle = document.getElementById('auth-title');

    let logoutMessage = "";

    // --- Auth State Change Logic ---
    auth.onAuthStateChanged(async (user) => {
      // ... (This section remains unchanged)
      if (!mainContent || !authContainer) {
          console.error("Critical DOM elements not found! Please check auth.js and your HTML file IDs.");
          return;
      }
      if (user) {
        try {
          const userDocRef = db.collection('users').doc(user.uid);
          const userDoc = await userDocRef.get();
          if (userDoc.exists && userDoc.data().isActive === true) {
            mainContent.style.display = 'block';
            authContainer.style.display = 'none';
            if (!document.getElementById('logout-button')) {
                createLogoutButton();
            }
          } else {
            if (!userDoc.exists) { logoutMessage = "User data not found. Please contact admin."; } 
            else { logoutMessage = "Your account is awaiting admin approval."; }
            await auth.signOut();
          }
        } catch (error) {
          console.error("Error checking user status in Firestore: ", error);
          logoutMessage = "Error checking user status. Please try again.";
          await auth.signOut();
        }
      } else {
        mainContent.style.display = 'none';
        authContainer.style.display = 'block';
        if (logoutMessage) {
          messageDiv.textContent = logoutMessage;
          logoutMessage = "";
        }
      }
    });
    
    // --- Login Logic ---
    loginButton.addEventListener('click', async (e) => {
        // ... (This section remains unchanged)
        e.preventDefault();
        if (!emailInput || !passwordInput) {
            messageDiv.textContent = "Login input fields not found.";
            return;
        }
        const username = emailInput.value;
        const password = passwordInput.value;
        let email;
        if (username.includes('@')) { email = username; } 
        else { email = username + '@yourleague.local'; }

        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            messageDiv.textContent = error.message;
        } finally {
            loginButton.textContent = 'Login';
            loginButton.disabled = false;
        }
    });

    // --- Logout Button ---
    function createLogoutButton() {
        // ... (This section remains unchanged)
        const existingButton = document.getElementById('logout-button');
        if (existingButton) return;
        const logoutButton = document.createElement('button');
        logoutButton.id = 'logout-button';
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', async () => {
            logoutMessage = "You have been logged out.";
            await auth.signOut();
        });
        mainContent.insertBefore(logoutButton, mainContent.firstChild);
    }
    
    // --- NEW: UI Switching Logic ---
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authTitle.textContent = 'Sign Up';
        messageDiv.textContent = ''; // Clear any previous error messages
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        authTitle.textContent = 'Login';
        messageDiv.textContent = ''; // Clear any previous error messages
    });

    // --- NEW: Signup Logic ---
    signupButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const username = signupUsernameInput.value;
        const password = signupPasswordInput.value;
        const confirmPassword = signupConfirmPasswordInput.value;
        messageDiv.textContent = '';

        if (password !== confirmPassword) {
            messageDiv.textContent = "Passwords do not match.";
            return;
        }
        if (!username || password.length < 6) {
            messageDiv.textContent = "Please enter a username and a password of at least 6 characters.";
            return;
        }

        const email = username + '@yourleague.local';
        signupButton.textContent = 'Signing Up...';
        signupButton.disabled = true;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create a corresponding document in the 'users' collection
            await db.collection('users').doc(user.uid).set({
                username: username,
                email: user.email,
                isActive: false, // Set to false by default for admin approval
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Log the user out immediately and show message
            logoutMessage = "Account created successfully. Please wait for admin approval.";
            await auth.signOut();

        } catch (error) {
            messageDiv.textContent = error.message;
        } finally {
            signupButton.textContent = 'Sign Up';
            signupButton.disabled = false;
        }
    });
});
