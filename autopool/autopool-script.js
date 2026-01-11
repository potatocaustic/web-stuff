// static/js/autopool.js

const API_BASE_URL = 'https://admin-seven-weld.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('autopool-form');
    const loader = document.getElementById('loader');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');
    const dateInput = document.getElementById('pool-date');
    const sportSelect = document.getElementById('sport-select');
    const bookmakerSelect = document.getElementById('bookmaker-select');
    const bookmakerTrigger = bookmakerSelect.querySelector('.multi-select-trigger');
    const bookmakerDropdown = bookmakerSelect.querySelector('.multi-select-dropdown');
    const bookmakerText = bookmakerSelect.querySelector('.multi-select-text');
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

    // Fetch and populate bookmakers dropdown on page load
    async function loadBookmakers() {
        try {
            const response = await fetch(`${API_BASE_URL}/get_bookmakers`);
            const data = await response.json();

            if (data.bookmakers && data.bookmakers.length > 0) {
                bookmakerDropdown.innerHTML = '';
                data.bookmakers.forEach((bm, index) => {
                    const label = document.createElement('label');
                    label.className = 'multi-select-option';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = bm.key;
                    checkbox.dataset.name = bm.name;
                    // Select first bookmaker (combined) by default
                    if (index === 0) {
                        checkbox.checked = true;
                    }
                    checkbox.addEventListener('change', updateBookmakerText);

                    const span = document.createElement('span');
                    span.textContent = bm.name;

                    label.appendChild(checkbox);
                    label.appendChild(span);
                    bookmakerDropdown.appendChild(label);
                });
                updateBookmakerText();
            }
        } catch (error) {
            console.error('Failed to load bookmakers:', error);
        }
    }

    function updateBookmakerText() {
        const checked = bookmakerDropdown.querySelectorAll('input[type="checkbox"]:checked');
        if (checked.length === 0) {
            bookmakerText.textContent = 'Select sportsbooks...';
        } else if (checked.length === 1) {
            bookmakerText.textContent = checked[0].dataset.name;
        } else {
            bookmakerText.textContent = `${checked.length} sportsbooks selected`;
        }
    }

    // Toggle dropdown
    bookmakerTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        bookmakerSelect.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!bookmakerSelect.contains(e.target)) {
            bookmakerSelect.classList.remove('open');
        }
    });

    // Load bookmakers immediately
    loadBookmakers();

    // Get today's date in US Central time
    function getTodaysCentralDate() {
        const today = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
        const centralDate = new Date(today);
        const year = centralDate.getFullYear();
        const month = String(centralDate.getMonth() + 1).padStart(2, '0');
        const day = String(centralDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Set today's date in hidden input
    const todayFormatted = getTodaysCentralDate();
    dateInput.value = todayFormatted;

    // Load sports for today automatically
    async function loadSportsForToday() {
        try {
            sportSelect.disabled = true;
            sportSelect.innerHTML = '<option value="">Loading sports...</option>';
            submitBtn.disabled = true;

            const response = await fetch(`${API_BASE_URL}/get_sports_for_date?date=${todayFormatted}`);
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
                sportSelect.innerHTML = '<option value="">No pools available today</option>';
            }

        } catch (error) {
            sportSelect.innerHTML = '<option value="">Error loading sports</option>';
            displayError(error.message);
        }
    }

    // Load sports on page load
    loadSportsForToday();

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

        // Get selected bookmakers
        const selectedBookmakers = Array.from(bookmakerDropdown.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        if (selectedBookmakers.length === 0) {
            displayError('Please select at least one sportsbook.');
            loader.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Calculate';
            return;
        }

        const formData = new FormData(form);
        // Replace individual bookmaker entries with comma-separated list
        formData.delete('bookmakers');
        formData.set('bookmakers', selectedBookmakers.join(','));

        try {
            const response = await fetch(`${API_BASE_URL}/run_autopool_model`, {
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
        // Highest EV Strategy
        const hev = data.highest_ev;
        if (hev) {
            document.getElementById('hev-picks').textContent = hev.picks;
            document.getElementById('hev-total-ev').textContent = hev.total_ev.toFixed(2);
            document.getElementById('hev-payout-prob').textContent = (hev.payout_prob * 100).toFixed(2) + '%';
            document.getElementById('hev-pool-ev').textContent = hev.pool_ev.toFixed(2);
            document.getElementById('hev-bet-ev').textContent = hev.bet_ev.toFixed(2);
            document.getElementById('hev-bets').textContent = hev.bet_decisions;
        }

        // Lowest Risk Strategy
        const lrisk = data.lowest_risk;
        const lowestRiskBox = document.getElementById('lowest-risk-box');
        if (lrisk && JSON.stringify(lrisk) !== JSON.stringify(hev)) {
            document.getElementById('lrisk-picks').textContent = lrisk.picks;
            document.getElementById('lrisk-total-ev').textContent = lrisk.total_ev.toFixed(2);
            document.getElementById('lrisk-payout-prob').textContent = (lrisk.payout_prob * 100).toFixed(2) + '%';
            document.getElementById('lrisk-pool-ev').textContent = lrisk.pool_ev.toFixed(2);
            document.getElementById('lrisk-bet-ev').textContent = lrisk.bet_ev.toFixed(2);
            document.getElementById('lrisk-bets').textContent = lrisk.bet_decisions;
            lowestRiskBox.classList.remove('hidden');
        } else {
            lowestRiskBox.classList.add('hidden');
        }

        // All Combinations Table with collapsible details
        const tableBody = document.querySelector('#all-combinations-table tbody');
        tableBody.innerHTML = '';
        data.all_combinations.forEach((combo, index) => {
            // Main row (clickable)
            const row = document.createElement('tr');
            row.className = 'combo-row';
            row.dataset.index = index;
            row.innerHTML = `
                <td>${combo.picks}</td>
                <td>${combo.total_ev.toFixed(2)}</td>
                <td>${combo.pool_ev.toFixed(2)}</td>
                <td>${combo.bet_ev.toFixed(2)}</td>
                <td>${(combo.payout_prob * 100).toFixed(2)}%</td>
                <td>${combo.bet_decisions}</td>
            `;
            tableBody.appendChild(row);

            // Details row (hidden by default)
            const detailsRow = document.createElement('tr');
            detailsRow.className = 'details-row';
            detailsRow.innerHTML = `<td colspan="6">${renderComboDetails(combo)}</td>`;
            tableBody.appendChild(detailsRow);

            // Toggle details on click
            row.addEventListener('click', () => {
                row.classList.toggle('expanded');
                detailsRow.classList.toggle('visible');
            });
        });

        resultsDiv.classList.remove('hidden');
    }

    function renderComboDetails(combo) {
        const formatOdds = (odds) => {
            if (odds === null || odds === undefined) return 'N/A';
            return odds > 0 ? `+${odds}` : `${odds}`;
        };
        const formatProb = (prob) => {
            if (prob === null || prob === undefined) return 'N/A';
            return (prob * 100).toFixed(1) + '%';
        };
        const formatEv = (ev) => {
            if (ev === null || ev === undefined) return 'N/A';
            return ev >= 0 ? `+${ev.toFixed(2)}` : ev.toFixed(2);
        };
        const formatCurrency = (val) => {
            if (val === null || val === undefined) return 'N/A';
            return `$${val.toFixed(0)}`;
        };

        // Combo-level summary (payouts and probabilities)
        let summaryHtml = `
            <div class="game-detail-card" style="background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%); border-left: 3px solid #667eea;">
                <div class="game-detail-header">Projected Payouts & Probabilities</div>
                <div class="game-detail-grid">
                    <div class="game-detail-item">
                        <span class="label">1st Place Payout:</span>
                        <span class="value">${formatCurrency(combo.payout_1st)}</span>
                    </div>
                    <div class="game-detail-item">
                        <span class="label">1st Place Prob:</span>
                        <span class="value">${formatProb(combo.prob_1st)}</span>
                    </div>`;

        if (combo.payout_2nd !== null && combo.payout_2nd !== undefined) {
            summaryHtml += `
                    <div class="game-detail-item">
                        <span class="label">2nd Place Payout:</span>
                        <span class="value">${formatCurrency(combo.payout_2nd)}</span>
                    </div>
                    <div class="game-detail-item">
                        <span class="label">2nd Place Prob:</span>
                        <span class="value">${formatProb(combo.prob_2nd)}</span>
                    </div>`;
        }
        summaryHtml += `
                </div>
            </div>`;

        // Game-level details
        const gameDetails = combo.game_details;
        if (!gameDetails || gameDetails.length === 0) {
            return `<div class="game-details-container">${summaryHtml}<em>No game details available</em></div>`;
        }

        const gameCards = gameDetails.map((g, i) => {
            const betClass = g.bet_type === 'Max' ? 'bet-decision-max' : 'bet-decision-min';

            return `
                <div class="game-detail-card">
                    <div class="game-detail-header">
                        Game ${i + 1}: ${g.matchup} — Pick: <strong>${g.pick}</strong>
                        <span class="${betClass}" style="float:right;">${g.bet_type} Bet (EV: ${formatEv(g.bet_ev)})</span>
                    </div>
                    <div class="game-detail-grid">
                        <div class="game-detail-item">
                            <span class="label">${g.home_team} Odds:</span>
                            <span class="value">${formatOdds(g.home_odds)}</span>
                        </div>
                        <div class="game-detail-item">
                            <span class="label">${g.away_team} Odds:</span>
                            <span class="value">${formatOdds(g.away_odds)}</span>
                        </div>
                        <div class="game-detail-item">
                            <span class="label">${g.home_team} Win Prob:</span>
                            <span class="value">${formatProb(g.home_prob)}</span>
                        </div>
                        <div class="game-detail-item">
                            <span class="label">${g.away_team} Win Prob:</span>
                            <span class="value">${formatProb(g.away_prob)}</span>
                        </div>
                        <div class="game-detail-item">
                            <span class="label">${g.home_team} EV (Max/Min):</span>
                            <span class="value">${formatEv(g.home_ev_max)} / ${formatEv(g.home_ev_min)}</span>
                        </div>
                        <div class="game-detail-item">
                            <span class="label">${g.away_team} EV (Max/Min):</span>
                            <span class="value">${formatEv(g.away_ev_max)} / ${formatEv(g.away_ev_min)}</span>
                        </div>
                        <div class="game-detail-item">
                            <span class="label">Wager Range:</span>
                            <span class="value">$${g.min_wager} - $${g.max_wager}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `<div class="game-details-container">${summaryHtml}${gameCards}</div>`;
    }

    function displayError(message) {
        errorDiv.textContent = `Error: ${message}`;
        errorDiv.classList.remove('hidden');
    }
});
