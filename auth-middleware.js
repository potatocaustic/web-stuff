// auth-middleware.js
(function() {
    'use strict';

    const USERS_STORAGE_KEY = 'appUsersDemo';
    const SESSION_TOKEN_KEY = 'appSessionToken';
    const LOGGED_IN_USER_KEY = 'appLoggedInUser';

    /**
     * Hashes a password using SHA-256.
     * IMPORTANT: For client-side hashing, this is better than plaintext, but still not
     * as secure as server-side hashing with proper salting (e.g., Argon2, bcrypt).
     * A salt should ideally be unique per user and stored with the hash.
     * This example does not include salting for simplicity of demonstration.
     * @param {string} password
     * @returns {Promise<string>} Hex string of the hashed password
     */
    async function hashPassword(password) {
        if (!password) {
            // console.warn("Password is empty, cannot hash."); // Or throw error
            return "empty_password_hash_placeholder"; // Or handle as error upstream
        }
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error("Error hashing password:", error);
            throw new Error("Could not process password.");
        }
    }

    /**
     * Retrieves all users from localStorage.
     * @returns {object} The users object or an empty object.
     */
    function getUsers() {
        try {
            const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
            return usersJson ? JSON.parse(usersJson) : {};
        } catch (e) {
            console.error("Error parsing users from localStorage:", e);
            return {}; // Return empty if corrupt
        }
    }

    /**
     * Saves all users to localStorage.
     * @param {object} users
     */
    function saveUsers(users) {
        try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {
            console.error("Error saving users to localStorage:", e);
            // Consider implications if storage is full
        }
    }

    /**
     * Generates a simple pseudo-random session token.
     * For a real app, use a cryptographically secure random string generator.
     * @returns {string}
     */
    function generateSessionToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    const AuthManager = {
        /**
         * Registers a new user.
         * @param {string} username
         * @param {string} password
         * @returns {Promise<boolean>} True if registration is successful.
         * @throws {Error} If username exists or other registration error.
         */
        async registerUser(username, password) {
            if (!username || !password) {
                throw new Error("Username and password are required.");
            }
            const users = getUsers();
            if (users[username]) {
                throw new Error("Username already exists. Please choose another.");
            }

            const hashedPassword = await hashPassword(password);
            users[username] = { hashedPassword: hashedPassword };
            saveUsers(users);
            console.log(`User [${username}] registered.`);
            return true;
        },

        /**
         * Logs in an existing user.
         * @param {string} username
         * @param {string} password
         * @returns {Promise<boolean>} True if login is successful.
         * @throws {Error} If login fails (user not found, wrong password).
         */
        async loginUser(username, password) {
            if (!username || !password) {
                throw new Error("Username and password are required.");
            }
            const users = getUsers();
            const user = users[username];

            if (!user) {
                throw new Error("Username not found.");
            }

            const hashedPasswordAttempt = await hashPassword(password);
            if (hashedPasswordAttempt !== user.hashedPassword) {
                throw new Error("Incorrect password.");
            }

            // Login successful, create session
            const sessionToken = generateSessionToken();
            localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
            localStorage.setItem(LOGGED_IN_USER_KEY, username);
            console.log(`User [${username}] logged in. Session token created.`);
            return true;
        },

        /**
         * Logs out the current user.
         */
        logoutUser() {
            localStorage.removeItem(SESSION_TOKEN_KEY);
            localStorage.removeItem(LOGGED_IN_USER_KEY);
            console.log("User logged out.");
            // Optionally, redirect or update UI after logout
            // window.location.href = 'auth.html'; // Handled by UI script in auth.html or page protection
        },

        /**
         * Checks if a user is currently logged in (valid session).
         * @returns {boolean} True if user is logged in.
         */
        isAuthenticated() {
            const token = localStorage.getItem(SESSION_TOKEN_KEY);
            // Basic check: In a real app, this token would be validated (e.g., against a server or expiry).
            // For this client-side demo, presence of token means "authenticated".
            return !!token; 
        },

        /**
         * Gets the username of the currently logged-in user.
         * @returns {string|null} Username or null if not logged in.
         */
        getLoggedInUser() {
            return localStorage.getItem(LOGGED_IN_USER_KEY);
        },
        
        /**
         * For Admin: Gets all registered users (usernames and their stored data).
         * CAUTION: Exposing all user data, even just for admin view, needs care.
         * Here, we're just getting it from localStorage for the demo.
         */
        getAllUsersForAdmin() {
            return getUsers();
        }
    };

    // Expose AuthManager to the global window scope to be accessible by auth.html
    window.AuthManager = AuthManager;

    /**
     * Page Protection Logic: Redirects to auth.html if not authenticated
     * and not on a public page.
     */
    function handlePageProtection() {
        const currentPage = window.location.pathname.split('/').pop().toLowerCase();
        // auth.html can also have query params like ?admin=... or ?redirect=...
        const isAuthPage = currentPage.startsWith('auth.html') || currentPage === 'index.html' || currentPage === '';

        if (!isAuthPage && !AuthManager.isAuthenticated()) {
            console.log(`Access to [${currentPage}] denied. User not authenticated. Redirecting to login.`);
            // Preserve the intended destination to redirect after login
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = `auth.html?redirect=${encodeURIComponent(currentPath)}`;
        }
    }

    // Run page protection on DOMContentLoaded or immediately if already loaded.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handlePageProtection);
    } else {
        handlePageProtection();
    }

})();
