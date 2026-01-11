/**
 * Token Management System for Premium API Tools
 *
 * This module manages daily tokens for autopool and dotd tools.
 * Users get 10 tokens per day with no rollover.
 * Tokens reset at midnight Central Time.
 */

const TokenManager = {
    DAILY_TOKEN_LIMIT: 25,

    /**
     * Get current date string in Central Time (YYYY-MM-DD format)
     */
    getCurrentDateCT: function() {
        const now = new Date();
        const ctString = now.toLocaleString('en-US', { timeZone: 'America/Chicago' });
        const ctDate = new Date(ctString);
        const year = ctDate.getFullYear();
        const month = String(ctDate.getMonth() + 1).padStart(2, '0');
        const day = String(ctDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Get the Firestore reference for the current user's token document
     */
    getTokenDocRef: function(db, userId) {
        return db.collection('user_tokens').doc(userId);
    },

    /**
     * Initialize or reset tokens for a user if needed
     * Returns the current token count
     */
    initializeTokens: async function(db, userId) {
        const tokenDocRef = this.getTokenDocRef(db, userId);
        const currentDate = this.getCurrentDateCT();

        try {
            const tokenDoc = await tokenDocRef.get();

            if (!tokenDoc.exists) {
                // New user - create token document with full tokens
                await tokenDocRef.set({
                    tokensRemaining: this.DAILY_TOKEN_LIMIT,
                    lastResetDate: currentDate,
                    totalUsed: 0
                });
                return this.DAILY_TOKEN_LIMIT;
            }

            const data = tokenDoc.data();

            // Check if we need to reset tokens (new day)
            if (data.lastResetDate !== currentDate) {
                // New day - reset tokens
                await tokenDocRef.update({
                    tokensRemaining: this.DAILY_TOKEN_LIMIT,
                    lastResetDate: currentDate
                });
                return this.DAILY_TOKEN_LIMIT;
            }

            // Same day - return current tokens
            return data.tokensRemaining;
        } catch (error) {
            console.error('Error initializing tokens:', error);
            throw error;
        }
    },

    /**
     * Get remaining tokens for a user
     */
    getTokens: async function(db, userId) {
        const tokenDocRef = this.getTokenDocRef(db, userId);
        const currentDate = this.getCurrentDateCT();

        try {
            const tokenDoc = await tokenDocRef.get();

            if (!tokenDoc.exists) {
                // Initialize if doesn't exist
                return await this.initializeTokens(db, userId);
            }

            const data = tokenDoc.data();

            // Check if we need to reset (new day)
            if (data.lastResetDate !== currentDate) {
                return await this.initializeTokens(db, userId);
            }

            return data.tokensRemaining;
        } catch (error) {
            console.error('Error getting tokens:', error);
            throw error;
        }
    },

    /**
     * Use a token (decrement by 1)
     * Returns { success: boolean, tokensRemaining: number, error?: string }
     */
    useToken: async function(db, userId) {
        const tokenDocRef = this.getTokenDocRef(db, userId);
        const currentDate = this.getCurrentDateCT();

        try {
            // Use a transaction to ensure atomic update
            const result = await db.runTransaction(async (transaction) => {
                const tokenDoc = await transaction.get(tokenDocRef);

                if (!tokenDoc.exists) {
                    // Initialize new user
                    transaction.set(tokenDocRef, {
                        tokensRemaining: this.DAILY_TOKEN_LIMIT - 1,
                        lastResetDate: currentDate,
                        totalUsed: 1
                    });
                    return { success: true, tokensRemaining: this.DAILY_TOKEN_LIMIT - 1 };
                }

                const data = tokenDoc.data();

                // Check if we need to reset (new day)
                if (data.lastResetDate !== currentDate) {
                    transaction.update(tokenDocRef, {
                        tokensRemaining: this.DAILY_TOKEN_LIMIT - 1,
                        lastResetDate: currentDate,
                        totalUsed: (data.totalUsed || 0) + 1
                    });
                    return { success: true, tokensRemaining: this.DAILY_TOKEN_LIMIT - 1 };
                }

                // Same day - check if tokens available
                if (data.tokensRemaining <= 0) {
                    return {
                        success: false,
                        tokensRemaining: 0,
                        error: 'No tokens remaining today. Tokens reset at midnight CT.'
                    };
                }

                // Decrement token
                const newTokenCount = data.tokensRemaining - 1;
                transaction.update(tokenDocRef, {
                    tokensRemaining: newTokenCount,
                    totalUsed: (data.totalUsed || 0) + 1
                });

                return { success: true, tokensRemaining: newTokenCount };
            });

            return result;
        } catch (error) {
            console.error('Error using token:', error);
            return { success: false, tokensRemaining: -1, error: 'Failed to process token. Please try again.' };
        }
    },

    /**
     * Update the token display in the UI
     */
    updateDisplay: function(tokenCount) {
        const tokenCountElement = document.getElementById('token-count');
        if (tokenCountElement) {
            tokenCountElement.textContent = tokenCount;

            // Add visual feedback based on token count
            const tokenDisplay = document.getElementById('token-display');
            if (tokenDisplay) {
                if (tokenCount === 0) {
                    tokenDisplay.style.borderColor = '#dc3545';
                    tokenDisplay.style.background = 'linear-gradient(135deg, #dc354522 0%, #ff6b6b22 100%)';
                } else if (tokenCount <= 3) {
                    tokenDisplay.style.borderColor = '#ffc107';
                    tokenDisplay.style.background = 'linear-gradient(135deg, #ffc10722 0%, #ffeb3b22 100%)';
                } else {
                    tokenDisplay.style.borderColor = '#667eea44';
                    tokenDisplay.style.background = 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)';
                }
            }
        }
    }
};

// Make TokenManager available globally
window.TokenManager = TokenManager;
