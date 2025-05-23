// auth-middleware-with-header.js
// Add this script to all pages you want to protect

(function() {
    'use strict';
    
    // Configuration - must match your auth page settings
    const CURRENT_TEAM_CODE = '7jammers2025'; // Update this when you change team codes
    const AUTH_PAGE_URL = 'auth.html'; // Path to your auth page
    
    // Generate device fingerprint (same method as auth page)
    function generateDeviceFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.deviceMemory || 'unknown'
        ].join('|');
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36).toUpperCase().slice(0, 12);
    }
    
    // Check if device is authenticated
    function isDeviceAuthenticated() {
        try {
            const devices = JSON.parse(localStorage.getItem('teamDevices') || '[]');
            const deviceId = generateDeviceFingerprint();
            const device = devices.find(d => d.id === deviceId);
            
            if (!device || device.code !== CURRENT_TEAM_CODE) {
                return false;
            }
            
            // Update last access time
            const deviceIndex = devices.findIndex(d => d.id === deviceId);
            if (deviceIndex !== -1) {
                devices[deviceIndex].lastAccess = new Date().toISOString();
                localStorage.setItem('teamDevices', JSON.stringify(devices));
            }
            
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
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
                Please authenticate your device to continue.
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
                Authenticate Device
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
    function addTeamHeader() {
        const devices = JSON.parse(localStorage.getItem('teamDevices') || '[]');
        const deviceId = generateDeviceFingerprint();
        const device = devices.find(d => d.id === deviceId);
        const userName = device ? device.name : 'Team Member';
        
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
            🔒 Team Access Mode - Welcome, ${userName}
            <button onclick="teamAuthLogout()" style="
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
                margin-left: 0.5rem;
            ">Logout</button>
        `;
        
        // Insert at the very beginning of body
        document.body.insertBefore(teamHeader, document.body.firstChild);
    }
    
    // Logout function
    window.teamAuthLogout = function() {
        if (confirm('Are you sure you want to logout? You will need to re-authenticate this device.')) {
            localStorage.removeItem('teamDevices');
            window.location.href = AUTH_PAGE_URL;
        }
    };
    
    // Run authentication check when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (!isDeviceAuthenticated()) {
                showAccessDenied();
            } else {
                addTeamHeader();
            }
        });
    } else {
        // DOM already loaded
        if (!isDeviceAuthenticated()) {
            showAccessDenied();
        } else {
            addTeamHeader();
        }
    }
    
})();
