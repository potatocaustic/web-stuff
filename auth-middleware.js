// auth-middleware.js
// Simple account/password authentication middleware

(function() {
    'use strict';
    
    // Configuration
    const AUTH_PAGE_URL = '../auth.html'; // Path to your auth page
    
    // Check if user is currently logged in
    function isLoggedIn() {
        const session = localStorage.getItem('teamSession');
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            
            // Check if session is expired (24 hours)
            if (now - sessionData.loginTime > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('teamSession');
                return false;
            }
            
            return sessionData;
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('teamSession');
            return false;
        }
    }
    
    // Show access denied overlay
    function showAccessDenied() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        `;
        
        // Create message box
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            margin: 1rem;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        `;
        
        messageBox.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
            <h2 style="margin-bottom: 1rem; color: #333;">Access Restricted</h2>
            <p style="margin-bottom: 1.5rem; color: #666;">
                This page is restricted to authenticated team members only. 
                Please sign in to continue.
            </p>
            <button onclick="window.location.href='${AUTH_PAGE_URL}'" 
                    style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        margin-right: 0.5rem;
                    ">
                Sign In
            </button>
            <button onclick="window.location.href='index.html'" 
                    style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        font-size: 1rem;
                        cursor: pointer;
                    ">
                Go to Home
            </button>
        `;
        
        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);
        
        // Hide main content
        document.body.style.overflow = 'hidden';
        const mainContent = document.querySelector('main') || document.body;
        if (mainContent !== document.body) {
            mainContent.style.display = 'none';
        }
    }
    
    // Add team header automatically
    function addTeamHeader(username) {
        // Create team header
        const teamHeader = document.createElement('div');
        teamHeader.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.5rem;
            text-align: center;
            font-size: 0.9rem;
            position: relative;
            z-index: 100;
        `;
        
        teamHeader.innerHTML = `
            🔒 Team Access Mode - Welcome, ${username}
            <button onclick="teamAuthLogout()" style="
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
                margin-left: 0.5rem;
            ">Sign Out</button>
        `;
        
        // Insert at the very beginning of body
        document.body.insertBefore(teamHeader, document.body.firstChild);
    }
    
    // Logout function
    window.teamAuthLogout = function() {
        if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('teamSession');
            window.location.href = AUTH_PAGE_URL;
        }
    };
    
    // Run authentication check when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const session = isLoggedIn();
            if (!session) {
                showAccessDenied();
            } else {
                addTeamHeader(session.username);
            }
        });
    } else {
        // DOM already loaded
        const session = isLoggedIn();
        if (!session) {
            showAccessDenied();
        } else {
            addTeamHeader(session.username);
        }
    }
    
})();
