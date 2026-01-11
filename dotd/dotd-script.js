const API_BASE_URL = 'https://admin-seven-weld.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dotd-form');
    const dateInput = document.getElementById('poll-date');
    const sportSelect = document.getElementById('sport-select');
    const bookmakerSelect = document.getElementById('bookmaker-select');
    const loader = document.getElementById('loader');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');
    const resultsTitle = document.getElementById('results-title');
    const tableHead = document.querySelector('#results-table thead');
    const tableBody = document.querySelector('#results-table tbody');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    // Firebase and token management
    let currentUserId = null;
    let db = null;

    // Wait for Firebase to be initialized by auth.js
    const initFirebaseAndTokens = () => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            db = firebase.firestore();
            const auth = firebase.auth();

            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    currentUserId = user.uid;
                    try {
                        const tokens = await TokenManager.initializeTokens(db, currentUserId);
                        TokenManager.updateDisplay(tokens);
                    } catch (error) {
                        console.error('Error initializing tokens:', error);
                    }
                } else {
                    currentUserId = null;
                    TokenManager.updateDisplay('--');
                }
            });
        } else {
            // Firebase not ready yet, retry
            setTimeout(initFirebaseAndTokens, 100);
        }
    };

    initFirebaseAndTokens();

    // Mobile menu toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Fetch and populate bookmakers on page load
    async function loadBookmakers() {
        try {
            const response = await fetch(`${API_BASE_URL}/get_bookmakers`);
            const data = await response.json();

            if (data.bookmakers && data.bookmakers.length > 0) {
                bookmakerSelect.innerHTML = '';
                data.bookmakers.forEach(bm => {
                    const option = document.createElement('option');
                    option.value = bm.key;
                    option.textContent = bm.name;
                    bookmakerSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load bookmakers:', error);
        }
    }

    // Load bookmakers immediately
    loadBookmakers();

    // Handle date selection
    dateInput.addEventListener('change', async () => {
        const selectedDate = dateInput.value;

        if (!selectedDate) {
            sportSelect.disabled = true;
            sportSelect.innerHTML = '<option value="">Select a date first</option>';
            submitBtn.disabled = true;
            return;
        }

        // Fetch available sports for the selected date
        try {
            sportSelect.disabled = true;
            sportSelect.innerHTML = '<option value="">Loading sports...</option>';
            submitBtn.disabled = true;

            const response = await fetch(`${API_BASE_URL}/get_dotd_sports?date=${selectedDate}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch sports.');
            }

            if (data.sports && data.sports.length > 0) {
                sportSelect.innerHTML = '<option value="">Select a sport</option>';
                data.sports.forEach(sport => {
                    const option = document.createElement('option');
                    option.value = sport;
                    option.textContent = sport.toUpperCase();
                    sportSelect.appendChild(option);
                });
                sportSelect.disabled = false;
            } else {
                sportSelect.innerHTML = '<option value="">No sports available for this date</option>';
            }

        } catch (error) {
            sportSelect.innerHTML = '<option value="">Error loading sports</option>';
            displayError(error.message);
        }
    });

    // Set default date to today in US Central time
    const today = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
    const centralDate = new Date(today);
    const year = centralDate.getFullYear();
    const month = String(centralDate.getMonth() + 1).padStart(2, '0');
    const day = String(centralDate.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    dateInput.value = todayFormatted;

    // Trigger change event to load sports for today
    dateInput.dispatchEvent(new Event('change'));

    // Enable submit button when sport is selected
    sportSelect.addEventListener('change', () => {
        submitBtn.disabled = !sportSelect.value;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check if user is authenticated
        if (!currentUserId || !db) {
            displayError('Please log in to use this tool.');
            return;
        }

        // Check token availability before making API call
        try {
            const currentTokens = await TokenManager.getTokens(db, currentUserId);
            if (currentTokens <= 0) {
                displayError('No tokens remaining today. Tokens reset at midnight CT.');
                return;
            }
        } catch (error) {
            displayError('Error checking token balance. Please try again.');
            return;
        }

        loader.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Calculating...';

        const formData = new FormData(form);

        try {
            const response = await fetch(`${API_BASE_URL}/run_dotd_model`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An unknown error occurred.');
            }

            // API call was successful - use a token
            const tokenResult = await TokenManager.useToken(db, currentUserId);
            if (tokenResult.success) {
                TokenManager.updateDisplay(tokenResult.tokensRemaining);
            } else {
                // This shouldn't happen since we checked before, but handle it
                console.error('Token use failed:', tokenResult.error);
            }

            displayResults(data);

        } catch (error) {
            displayError(error.message);
        } finally {
            loader.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Calculate';
        }
    });

    function displayResults(data) {
        resultsTitle.textContent = data.title;
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        if (data.results && data.results.length > 0) {
            // Define explicit column order (excluding metadata fields start_time and is_locked)
            // Order: Team, Odds/Spread, Votes, Prob, Payout, EV
            const allKeys = Object.keys(data.results[0]);
            const hasOdds = allKeys.includes('odds');
            const headers = hasOdds
                ? ['team', 'odds', 'votes', 'prob', 'payout', 'EV']
                : ['team', 'spread', 'votes', 'prob', 'payout', 'EV'];
            const headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                headerRow.appendChild(th);
            });
            tableHead.appendChild(headerRow);

            // Create table rows
            data.results.forEach(rowData => {
                const row = document.createElement('tr');
                // Gray out locked rows
                if (rowData['is_locked']) {
                    row.style.opacity = '0.5';
                    row.style.backgroundColor = '#f0f0f0';
                }
                headers.forEach(header => {
                    const cell = document.createElement('td');
                    if (header === 'team') {
                        // Combine team name with start time underneath
                        const teamName = document.createElement('div');
                        teamName.textContent = rowData[header];
                        cell.appendChild(teamName);
                        if (rowData['start_time']) {
                            const startTime = document.createElement('div');
                            startTime.textContent = rowData['start_time'];
                            startTime.style.fontSize = '0.8em';
                            startTime.style.opacity = '0.7';
                            cell.appendChild(startTime);
                        }
                    } else {
                        cell.textContent = rowData[header];
                    }
                    row.appendChild(cell);
                });
                tableBody.appendChild(row);
            });
        }

        resultsDiv.classList.remove('hidden');
    }

    function displayError(message) {
        errorDiv.textContent = `Error: ${message}`;
        errorDiv.classList.remove('hidden');
    }
});
