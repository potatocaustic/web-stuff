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
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');
    const messageDiv = document.getElementById('auth-error');

    let logoutMessage = "";

    // --- Auth State Change Logic ---
    auth.onAuthStateChanged(async (user) => {
      if (!mainContent || !authContainer || !loginForm || !messageDiv) {
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
            if (!userDoc.exists) {
              logoutMessage = "User data not found. Please contact admin.";
            } else {
              logoutMessage = "Your account is awaiting admin approval.";
            }
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

    // --- Login Form Submission ---
    loginButton.addEventListener('click', async (e) => {
      e.preventDefault();

      if (!emailInput || !passwordInput) {
        messageDiv.textContent = "Login input fields not found.";
        return;
      }
      
      // NEW LOGIC: Append domain to username to create a valid email
      const username = emailInput.value;
      const password = passwordInput.value;
      let email;

      // If user types a plain username, add the domain.
      // If they already typed a full email, use it as is.
      if (username.includes('@')) {
        email = username;
      } else {
        email = username + '@yourleague.local';
      }

      loginButton.textContent = 'Logging in...';
      loginButton.disabled = true;

      try {
        // This now sends the correctly formatted email to Firebase
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
});
