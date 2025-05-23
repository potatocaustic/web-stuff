// auth-middleware.js
// This script protects pages by redirecting to auth.html if the user is not logged in.

(function() {
    'use strict';

    // Your web app's Firebase configuration (PASTE YOURS HERE - must match auth.html)
    // It's generally better to initialize Firebase once in a central place,
    // but for simplicity in a multi-file static setup without modules,
    // initializing it here too ensures it's available for this script.
    // Firebase initializeApp is idempotent (safe to call multiple times with the same config).
    const firebaseConfig = {
        apiKey: "AIzaSyC36oIVrjnLvAdDY66MODI_dI-vVn7HWAw", // REPLACE WITH YOURS
        authDomain: "webcaustic-5ccd4.firebaseapp.com",   // REPLACE WITH YOURS
        projectId: "webcaustic-5ccd4",                   // REPLACE WITH YOURS
        storageBucket: "webcaustic-5ccd4.firebasestorage.app", // REPLACE WITH YOURS
        messagingSenderId: "1021802602852",              // REPLACE WITH YOURS
        appId: "1:1021802602852:web:7cf7dac0ff5b2a2fffda71", // REPLACE WITH YOURS
        measurementId: "G-S1QW5SSXDP"                    // REPLACE WITH YOURS (optional)
    };

    // Initialize Firebase (if not already initialized)
    // Using compat libraries for syntax consistency with the auth.html example
    if (typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function') {
        if (!firebase.apps.length) { // Check if Firebase hasn't been initialized yet
            firebase.initializeApp(firebaseConfig);
        }
    } else {
        console.error("Firebase SDK not loaded. Make sure firebase-app-compat.js is included before this script.");
        return; // Stop execution if Firebase app SDK is not available
    }
    
    if (typeof firebase.auth !== 'function') {
        console.error("Firebase Auth SDK not loaded. Make sure firebase-auth-compat.js is included before this script.");
        return; // Stop execution if Firebase auth SDK is not available
    }

    const auth = firebase.auth();

    function handlePageProtection() {
        const currentPathname = window.location.pathname;
        const currentSearch = window.location.search;

        // Determine if the current page is one of the main public/authentication pages.
        // Assumes auth.html and index.html are at the root.
        const isAuthPage = currentPathname.endsWith('/auth.html') || 
                           currentPathname.endsWith('/') || // Site root
                           currentPathname.endsWith('/index.html');

        auth.onAuthStateChanged(user => {
            if (!user && !isAuthPage) {
                // User is NOT logged in AND is trying to access a protected page.
                const attemptedPathAndQuery = currentPathname + currentSearch;
                console.log(`Auth Middleware: Access to [${attemptedPathAndQuery}] denied. User not authenticated. Redirecting to login.`);
                
                // Redirect to auth.html at the root, passing the attempted path as a query parameter.
                // The leading '/' ensures it's relative to the site root.
                window.location.href = `/auth.html?redirect=${encodeURIComponent(attemptedPathAndQuery)}`;
            } else if (user && isAuthPage) {
                // User IS logged in AND is on auth.html (or index.html which might be a landing page).
                // Check if there's a redirect parameter from a previous attempt to access a protected page.
                const urlParams = new URLSearchParams(currentSearch);
                const redirectUrl = urlParams.get('redirect');
                const isAdminAccessMode = urlParams.has('admin'); // Don't redirect if it's an admin view of auth.html

                if (!isAdminAccessMode && redirectUrl) {
                    // If they were redirected TO auth.html and are now logged in, send them back.
                    // This logic is also in auth.html's onAuthStateChanged; this is a fallback
                    // or can be primary if auth.html doesn't handle it.
                    // To avoid conflict, ensure only one place definitively handles this redirect.
                    // The auth.html provided earlier *does* handle this, so this part might be redundant
                    // if this middleware is also included on auth.html.
                    // For now, let's assume auth.html handles its own post-login redirect.
                    console.log("Auth Middleware: User is logged in and on auth page. Redirect logic primarily in auth.html.");
                } else if (!isAdminAccessMode && !redirectUrl) {
                    // User is logged in and on auth.html (or index.html) without a specific place to go back to.
                    // Optionally, redirect them to a default dashboard page.
                    // console.log("Auth Middleware: User logged in. Consider redirecting from auth/index to a dashboard.");
                    // window.location.href = '/dashboard.html'; // Example default page
                }
            }
            // If user is logged in and on a protected page: do nothing, allow access.
            // If user is not logged in and on auth.html (or public page): do nothing, allow access.
        });
    }

    // Run the protection logic when the script loads.
    // Using DOMContentLoaded can be safer to ensure the page structure is somewhat available,
    // but for a redirect, earlier might be fine.
    // However, onAuthStateChanged is asynchronous and will fire when ready.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handlePageProtection);
    } else {
        handlePageProtection();
    }

})();
