// Global variables
let rklData = [];
let currentView = 'player';
let currentPlayer = null;
let teams = new Set();
let dateColumns = [];

// DOM elements
const elements = {
  playerViewBtn: document.getElementById('playerViewBtn'),
  teamViewBtn: document.getElementById('teamViewBtn'),
  leaderboardViewBtn: document.getElementById('leaderboardViewBtn'),
  trendsViewBtn: document.getElementById('trendsViewBtn'),
  playerView: document.getElementById('playerView'),
  teamView: document.getElementById('teamView'),
  leaderboardView: document.getElementById('leaderboardView'),
  trendsView: document.getElementById('trendsView'),
  playerSearchInput: document.getElementById('playerSearchInput'),
  searchResults: document.getElementById('searchResults'),
  teamSelect: document.getElementById('teamSelect'),
  playerResultsTitle: document.getElementById('playerResultsTitle'),
  playerOverview: document.getElementById('playerOverview'),
  playerChart: document.getElementById('playerChart'),
  playerStatsTable: document.getElementById('playerStatsTable'),
  teamGrid: document.getElementById('teamGrid'),
  leaderboardTable: document.getElementById('leaderboardTable'),
  trendsChart: document.getElementById('trendsChart'),
  trendsInsights: document.getElementById('trendsInsights')
};

// Event listeners
document.addEventListener('DOMContentLoaded', init);

// Initialize the application
async function init() {
  try {
    await loadData();
    setupEventListeners();
    populateTeamSelect();
    switchView('player');
  } catch (error) {
    console.error('Failed to load data:', error);
    showError('Failed to load RKL data. Please try refreshing the page.');
  }
}

// Load and parse CSV data
async function loadData() {
  try {
    const response = await fetch('s6-data.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch CSV file');
    }
    const csvText = await response.text();
    rklData = parseCSV(csvText);
    
    // Extract date columns and teams
    if (rklData.length > 0) {
      const firstRow = rklData[0];
      dateColumns = Object.keys(firstRow).filter(key => 
        key.includes('/') && !['AAG% (Median)', 'AAG% (Mean)'].includes(key)
      ).sort((a, b) => {
        // Sort by date
        const dateA = parseDate(a);
        const dateB = parseDate(b);
        return dateA - dateB;
      });
      
      // Get unique teams
      rklData.forEach(row => {
        if (row.Team && row.Team !== 'RKL') {
          teams.add(row.Team.trim());
        }
      });
    }
    
    console.log(`Loaded ${rklData.length} player records with ${dateColumns.length} match days`);
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Parse CSV to JSON
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Split by comma but handle quoted values
    const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const entry = {};
    
    headers.forEach((header, index) => {
      if (index < values.length) {
        let value = values[index].trim().replace(/"/g, '');
        
        // Convert numeric values
        if (['GP', 'AAG (Median)', 'AAG (Mean)', 'REL (Median)', 'REL (Mean)'].includes(header)) {
          entry[header] = value === '' ? null : parseFloat(value);
        } else if (header.includes('/') && !header.includes('%')) {
          // Date columns with numeric values
          entry[header] = value === '' ? null : parseFloat(value);
        } else {
          entry[header] = value === '' ? null : value;
        }
      } else {
        entry[header] = null;
      }
    });
    
    // Only add entries with player data (exclude summary rows)
    if (entry.Player && entry.Team && entry.Team !== 'RKL') {
      result.push(entry);
    }
  }
  
  return result;
}

// Parse date from column header (e.g., "1.1 3/6" -> Date object)
function parseDate(dateStr) {
  const match = dateStr.match(/(\d+)\/(\d+)$/);
  if (match) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    const year = 2025; // Assuming 2025 based on the data
    return new Date(year, month - 1, day);
  }
  return new Date();
}

// Format date for display
function formatDate(dateStr) {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Setup event listeners
function setupEventListeners() {
  elements.playerViewBtn.addEventListener('click', () => switchView('player'));
  elements.teamViewBtn.addEventListener('click', () => switchView('team'));
  elements.leaderboardViewBtn.addEventListener('click', () => switchView('leaderboard'));
  elements.trendsViewBtn.addEventListener('click', () => switchView('trends'));
  
  elements.playerSearchInput.addEventListener('input', handlePlayerSearch);
  elements.teamSelect.addEventListener('change', handleTeamFilter);
  
  // Leaderboard metric buttons
  document.querySelectorAll('.metric-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.metric-button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      updateLeaderboard(e.target.dataset.metric);
    });
  });
  
  // Trends checkboxes
  document.getElementById('showAverage').addEventListener('change', updateTrends);
  document.getElementById('showMedian').addEventListener('change', updateTrends);
  document.getElementById('showTop10').addEventListener('change', updateTrends);
}

// Switch between views
function switchView(view) {
  currentView = view;
  
  // Update button states
  document.querySelectorAll('.view-button').forEach(btn => btn.classList.remove('active'));
  elements[`${view}ViewBtn`].classList.add('active');
  
  // Hide all views
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show selected view
  elements[`${view}View`].classList.remove('hidden');
  
  // Initialize view-specific content
  switch (view) {
    case 'team':
      populateTeamGrid();
      break;
    case 'leaderboard':
      updateLeaderboard('avg');
      break;
    case 'trends':
      updateTrends();
      break;
  }
}

// Populate team select dropdown
function populateTeamSelect() {
  const sortedTeams = Array.from(teams).sort();
  sortedTeams.forEach(team => {
    const option = document.createElement('option');
    option.value = team;
    option.textContent = team;
    elements.teamSelect.appendChild(option);
  });
}

// Handle player search
function handlePlayerSearch() {
  const searchTerm = elements.playerSearchInput.value.trim().toLowerCase();
  elements.searchResults.innerHTML = '';
  
  if (searchTerm.length < 2) return;
  
  const teamFilter = elements.teamSelect.value;
  const filteredPlayers = getUniquePlayers(searchTerm, teamFilter);
  
  if (filteredPlayers.length > 0) {
    filteredPlayers.forEach(player => {
      const resultItem = document.createElement('div');
      resultItem.classList.add('search-result-item');
      resultItem.textContent = `${player.name} (${player.team})`;
      resultItem.addEventListener('click', () => selectPlayer(player.name));
      elements.searchResults.appendChild(resultItem);
    });
  } else {
    const noResults = document.createElement('div');
    noResults.classList.add('search-result-item');
    noResults.textContent = 'No players found';
    elements.searchResults.appendChild(noResults);
  }
}

// Handle team filter
function handleTeamFilter() {
  handlePlayerSearch(); // Refresh search results with filter
}

// Get unique players matching search and filter
function getUniquePlayers(searchTerm, teamFilter) {
  const playerMap = new Map();
  
  rklData.forEach(entry => {
    if (!entry.Player) return;
    
    const playerName = entry.Player.toLowerCase();
    const playerTeam = entry.Team;
    
    if (playerName.includes(searchTerm) && 
        (!teamFilter || playerTeam === teamFilter)) {
      
      if (!playerMap.has(entry.Player)) {
        playerMap.set(entry.Player, {
          name: entry.Player,
          team: playerTeam
        });
      }
    }
  });
  
  return Array.from(playerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Select a player and display their stats
function selectPlayer(playerName) {
  currentPlayer = playerName;
  
  // Update results title
  elements.playerResultsTitle.textContent = `Stats for ${playerName}`;
  
  // Get player data
  const playerData = rklData.find(entry => entry.Player === playerName);
  if (!playerData) {
    showError('Player data not found');
    return;
  }
  
  // Display player overview
  displayPlayerOverview(playerData);
  
  // Display player chart
  displayPlayerChart(playerData);
  
  // Display player stats table
  displayPlayerStatsTable(playerData);
  
  // Clear search results
  elements.searchResults.innerHTML = '';
}

// Display player overview stats
function displayPlayerOverview(playerData) {
  elements.playerOverview.innerHTML = '';
  
  // Calculate stats
  const scores = dateColumns.map(col => playerData[col]).filter(val => val !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const recentScores = scores.slice(-5);
  const recentAvg = recentScores.length > 0 ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const worstScore = scores.length > 0 ? Math.min(...scores) : 0;
  
  // Performance trend
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
  const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
  const trend = secondHalfAvg - firstHalfAvg;
  
  const stats = [
    { label: 'Team', value: playerData.Team },
    { label: 'Games Played', value: playerData.GP || 'N/A' },
    { label: 'Season Average', value: avgScore.toLocaleString() },
    { label: 'Recent Form (Last 5)', value: recentAvg.toLocaleString() },
    { label: 'Best Performance', value: bestScore.toLocaleString() },
    { label: 'Worst Performance', value: worstScore.toLocaleString() },
    { 
      label: 'Season Trend', 
      value: Math.abs(trend).toFixed(0), 
      change: trend > 50 ? 'positive' : trend < -50 ? 'negative' : 'neutral',
      changeText: trend > 50 ? '↗ Improving' : trend < -50 ? '↘ Declining' : '→ Stable'
    }
  ];
  
  stats.forEach(stat => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    
    const label = document.createElement('h4');
    label.textContent = stat.label;
    
    const value = document.createElement('div');
    value.className = 'stat-value';
    value.textContent = stat.value;
    
    card.appendChild(label);
    card.appendChild(value);
    
    if (stat.change) {
      const change = document.createElement('div');
      change.className = `stat-change ${stat.change}`;
      change.textContent = stat.changeText;
      card.appendChild(change);
    }
    
    elements.playerOverview.appendChild(card);
  });
}

// Display player performance chart (simple text-based for now)
function displayPlayerChart(playerData) {
  elements.playerChart.innerHTML = '';
  
  const chartTitle = document.createElement('h3');
  chartTitle.textContent = 'Performance Over Time';
  chartTitle.style.marginBottom = '1rem';
  chartTitle.style.textAlign = 'center';
  
  const chartContainer = document.createElement('div');
  chartContainer.style.overflowX = 'auto';
  
  const chart = document.createElement('div');
  chart.style.display = 'flex';
  chart.style.alignItems = 'end';
  chart.style.height = '300px';
  chart.style.gap = '2px';
  chart.style.padding = '1rem';
  chart.style.minWidth = `${dateColumns.length * 30}px`;
  
  // Find min and max for scaling
  const values = dateColumns.map(col => playerData[col]).filter(val => val !== null);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  
  dateColumns.forEach(col => {
    const value = playerData[col];
    if (value !== null) {
      const bar = document.createElement('div');
      bar.style.width = '25px';
      bar.style.backgroundColor = '#333';
      bar.style.marginRight = '2px';
      bar.style.position = 'relative';
      
      // Calculate height (20px to 250px)
      const height = range > 0 ? 20 + ((value - minVal) / range) * 230 : 100;
      bar.style.height = `${height}px`;
      
      // Add value label
      const label = document.createElement('div');
      label.style.position = 'absolute';
      label.style.top = '-20px';
      label.style.left = '50%';
      label.style.transform = 'translateX(-50%)';
      label.style.fontSize = '10px';
      label.style.fontWeight = 'bold';
      label.textContent = Math.round(value).toLocaleString();
      
      // Add date label
      const dateLabel = document.createElement('div');
      dateLabel.style.position = 'absolute';
      dateLabel.style.bottom = '-30px';
      dateLabel.style.left = '50%';
      dateLabel.style.transform = 'translateX(-50%) rotate(-45deg)';
      dateLabel.style.fontSize = '8px';
      dateLabel.style.width = '40px';
      dateLabel.style.textAlign = 'center';
      dateLabel.textContent = formatDate(col);
      
      bar.appendChild(label);
      bar.appendChild(dateLabel);
      chart.appendChild(bar);
    }
  });
  
  elements.playerChart.appendChild(chartTitle);
  chartContainer.appendChild(chart);
  elements.playerChart.appendChild(chartContainer);
}

// Display player stats table
function displayPlayerStatsTable(playerData) {
  elements.playerStatsTable.innerHTML = '';
  
  const table = document.createElement('table');
  table.className = 'stats-table';
  
  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const dateHeader = document.createElement('th');
  dateHeader.textContent = 'Date';
  dateHeader.className = 'date-col';
  
  const scoreHeader = document.createElement('th');
  scoreHeader.textContent = 'Score';
  scoreHeader.className = 'score-col';
  
  const changeHeader = document.createElement('th');
  changeHeader.textContent = 'Change';
  
  headerRow.appendChild(dateHeader);
  headerRow.appendChild(scoreHeader);
  headerRow.appendChild(changeHeader);
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create body
  const tbody = document.createElement('tbody');
  let previousScore = null;
  
  dateColumns.forEach(col => {
    const score = playerData[col];
    if (score !== null) {
      const row = document.createElement('tr');
      
      const dateCell = document.createElement('td');
      dateCell.textContent = formatDate(col);
      dateCell.className = 'date-col';
      
      const scoreCell = document.createElement('td');
      scoreCell.textContent = Math.round(score).toLocaleString();
      scoreCell.className = 'score-col';
      
      const changeCell = document.createElement('td');
      if (previousScore !== null) {
        const change = score - previousScore;
        changeCell.textContent = change > 0 ? `+${Math.round(change)}` : Math.round(change).toString();
        changeCell.style.color = change > 0 ? '#28a745' : change < 0 ? '#dc3545' : '#6c757d';
      } else {
        changeCell.textContent = '—';
      }
      
      row.appendChild(dateCell);
      row.appendChild(scoreCell);
      row.appendChild(changeCell);
      tbody.appendChild(row);
      
      previousScore = score;
    }
  });
  
  table.appendChild(tbody);
  elements.playerStatsTable.appendChild(table);
}

// Populate team grid
function populateTeamGrid() {
  elements.teamGrid.innerHTML = '';
  
  const teamStats = new Map();
  
  // Calculate team statistics
  rklData.forEach(entry => {
    const team = entry.Team;
    if (!team || team === 'RKL') return;
    
    if (!teamStats.has(team)) {
      teamStats.set(team, {
        name: team,
        players: [],
        totalGames: 0,
        avgScore: 0,
        scores: []
      });
    }
    
    const teamData = teamStats.get(team);
    teamData.players.push(entry.Player);
    
    // Calculate average score for this player
    const playerScores = dateColumns.map(col => entry[col]).filter(val => val !== null);
    if (playerScores.length > 0) {
      const playerAvg = playerScores.reduce((a, b) => a + b, 0) / playerScores.length;
      teamData.scores.push(playerAvg);
      teamData.totalGames += entry.GP || 0;
    }
  });
  
  // Create team cards
  Array.from(teamStats.values()).sort((a, b) => {
    const avgA = a.scores.length > 0 ? a.scores.reduce((a, b) => a + b, 0) / a.scores.length : 0;
    const avgB = b.scores.length > 0 ? b.scores.reduce((a, b) => a + b, 0) / b.scores.length : 0;
    return avgB - avgA;
  }).forEach(team => {
    const card = document.createElement('div');
    card.className = 'team-card';
    
    const header = document.createElement('div');
    header.className = 'team-header';
    
    const name = document.createElement('div');
    name.className = 'team-name';
    name.textContent = team.name;
    
    header.appendChild(name);
    card.appendChild(header);
    
    const stats = document.createElement('div');
    stats.className = 'team-stats';
    
    const playerCount = document.createElement('div');
    playerCount.className = 'team-stat';
    playerCount.innerHTML = `
      <div class="team-stat-label">Players</div>
      <div class="team-stat-value">${team.players.length}</div>
    `;
    
    const avgScore = team.scores.length > 0 ? team.scores.reduce((a, b) => a + b, 0) / team.scores.length : 0;
    const teamAvg = document.createElement('div');
    teamAvg.className = 'team-stat';
    teamAvg.innerHTML = `
      <div class="team-stat-label">Avg Score</div>
      <div class="team-stat-value">${Math.round(avgScore).toLocaleString()}</div>
    `;
    
    const totalGames = document.createElement('div');
    totalGames.className = 'team-stat';
    totalGames.innerHTML = `
      <div class="team-stat-label">Total GP</div>
      <div class="team-stat-value">${team.totalGames}</div>
    `;
    
    const bestPlayer = team.scores.length > 0 ? 
      team.players[team.scores.indexOf(Math.max(...team.scores))] : 
      team.players[0];
    
    const topPlayer = document.createElement('div');
    topPlayer.className = 'team-stat';
    topPlayer.innerHTML = `
      <div class="team-stat-label">Top Player</div>
      <div class="team-stat-value" style="font-size: 0.9rem;">${bestPlayer || 'N/A'}</div>
    `;
    
    stats.appendChild(playerCount);
    stats.appendChild(teamAvg);
    stats.appendChild(totalGames);
    stats.appendChild(topPlayer);
    card.appendChild(stats);
    
    const playersSection = document.createElement('div');
    playersSection.className = 'team-players';
    
    const playersTitle = document.createElement('h4');
    playersTitle.textContent = 'Players';
    
    const playersList = document.createElement('ul');
    playersList.className = 'top-players';
    
    team.players.slice(0, 5).forEach(player => {
      const li = document.createElement('li');
      li.textContent = player;
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        elements.playerSearchInput.value = player;
        selectPlayer(player);
        switchView('player');
      });
      playersList.appendChild(li);
    });
    
    if (team.players.length > 5) {
      const li = document.createElement('li');
      li.textContent = `... and ${team.players.length - 5} more`;
      li.style.fontStyle = 'italic';
      playersList.appendChild(li);
    }
    
    playersSection.appendChild(playersTitle);
    playersSection.appendChild(playersList);
    card.appendChild(playersSection);
    
    elements.teamGrid.appendChild(card);
  });
}

// Update leaderboard
function updateLeaderboard(metric) {
  elements.leaderboardTable.innerHTML = '';
  
  let leaderboardData = [];
  
  switch (metric) {
    case 'avg':
      leaderboardData = calculateAverageLeaderboard();
      break;
    case 'recent':
      leaderboardData = calculateRecentFormLeaderboard();
      break;
    case 'consistency':
      leaderboardData = calculateConsistencyLeaderboard();
      break;
    case 'improvement':
      leaderboardData = calculateImprovementLeaderboard();
      break;
  }
  
  const table = document.createElement('table');
  table.className = 'leaderboard';
  
  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  ['Rank', 'Player', 'Team', 'Value'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.className = header.toLowerCase().replace(' ', '-') + '-col';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create body
  const tbody = document.createElement('tbody');
  
  leaderboardData.slice(0, 20).forEach((entry, index) => {
    const row = document.createElement('tr');
    
    const rankCell = document.createElement('td');
    rankCell.textContent = index + 1;
    rankCell.className = 'rank-col';
    if (index < 3) {
      rankCell.classList.add(`rank-${index + 1}`);
    }
    
    const playerCell = document.createElement('td');
    playerCell.textContent = entry.player;
    playerCell.className = 'player-col';
    playerCell.style.cursor = 'pointer';
    playerCell.addEventListener('click', () => {
      elements.playerSearchInput.value = entry.player;
      selectPlayer(entry.player);
      switchView('player');
    });
    
    const teamCell = document.createElement('td');
    teamCell.textContent = entry.team;
    teamCell.className = 'team-col';
    
    const valueCell = document.createElement('td');
    valueCell.textContent = entry.displayValue;
    valueCell.className = 'value-col';
    
    row.appendChild(rankCell);
    row.appendChild(playerCell);
    row.appendChild(teamCell);
    row.appendChild(valueCell);
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  elements.leaderboardTable.appendChild(table);
}

// Calculate average performance leaderboard
function calculateAverageLeaderboard() {
  return rklData.map(entry => {
    const scores = dateColumns.map(col => entry[col]).filter(val => val !== null);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    return {
      player: entry.Player,
      team: entry.Team,
      value: avg,
      displayValue: Math.round(avg).toLocaleString()
    };
  }).sort((a, b) => b.value - a.value);
}

// Calculate recent form leaderboard
function calculateRecentFormLeaderboard() {
  return rklData.map(entry => {
    const allScores = dateColumns.map(col => entry[col]).filter(val => val !== null);
    const recentScores = allScores.slice(-5);
    const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
    
    return {
      player: entry.Player,
      team: entry.Team,
      value: recentAvg,
      displayValue: Math.round(recentAvg).toLocaleString()
    };
  }).sort((a, b) => b.value - a.value);
}

// Calculate consistency leaderboard (lowest standard deviation)
function calculateConsistencyLeaderboard() {
  return rklData.map(entry => {
    const scores = dateColumns.map(col => entry[col]).filter(val => val !== null);
    
    if (scores.length < 3) {
      return {
        player: entry.Player,
        team: entry.Team,
        value: Infinity,
        displayValue: 'N/A'
      };
    }
    
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      player: entry.Player,
      team: entry.Team,
      value: stdDev,
      displayValue: Math.round(stdDev).toLocaleString()
    };
  }).sort((a, b) => a.value - b.value);
}

// Calculate improvement leaderboard
function calculateImprovementLeaderboard() {
  return rklData.map(entry => {
    const scores = dateColumns.map(col => entry[col]).filter(val => val !== null);
    
    if (scores.length < 6) {
      return {
        player: entry.Player,
        team: entry.Team,
        value: 0,
        displayValue: 'N/A'
      };
    }
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const improvement = secondAvg - firstAvg;
    
    return {
      player: entry.Player,
      team: entry.Team,
      value: improvement,
      displayValue: improvement > 0 ? `+${Math.round(improvement)}` : Math.round(improvement).toString()
    };
  }).sort((a, b) => b.value - a.value);
}

// Update trends view
function updateTrends() {
  elements.trendsChart.innerHTML = '';
  elements.trendsInsights.innerHTML = '';
  
  const showAverage = document.getElementById('showAverage').checked;
  const showMedian = document.getElementById('showMedian').checked;
  const showTop10 = document.getElementById('showTop10').checked;
  
  // Calculate league trends
  const trendData = dateColumns.map(col => {
    const dayScores = rklData.map(entry => entry[col]).filter(val => val !== null);
    
    if (dayScores.length === 0) {
      return {
        date: col,
        average: null,
        median: null,
        top10: null
      };
    }
    
    const sorted = [...dayScores].sort((a, b) => b - a);
    const average = dayScores.reduce((a, b) => a + b, 0) / dayScores.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const top10 = sorted.slice(0, Math.min(10, sorted.length)).reduce((a, b) => a + b, 0) / Math.min(10, sorted.length);
    
    return {
      date: col,
      average,
      median,
      top10
    };
  });
  
  // Create trends chart (simple version)
  const chartTitle = document.createElement('h3');
  chartTitle.textContent = 'League Performance Trends';
  chartTitle.style.textAlign = 'center';
  chartTitle.style.marginBottom = '1rem';
  
  const chartContainer = document.createElement('div');
  chartContainer.style.overflowX = 'auto';
  chartContainer.style.height = '400px';
  chartContainer.style.position = 'relative';
  
  const chart = document.createElement('div');
  chart.style.position = 'relative';
  chart.style.height = '350px';
  chart.style.minWidth = `${dateColumns.length * 40}px`;
  chart.style.margin = '20px';
  
  // Find overall min/max for scaling
  const allValues = [];
  if (showAverage) allValues.push(...trendData.map(d => d.average).filter(v => v !== null));
  if (showMedian) allValues.push(...trendData.map(d => d.median).filter(v => v !== null));
  if (showTop10) allValues.push(...trendData.map(d => d.top10).filter(v => v !== null));
  
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal;
  
  // Create lines
  const lines = [];
  if (showAverage) lines.push({ data: trendData.map(d => d.average), color: '#007bff', label: 'Average' });
  if (showMedian) lines.push({ data: trendData.map(d => d.median), color: '#28a745', label: 'Median' });
  if (showTop10) lines.push({ data: trendData.map(d => d.top10), color: '#ffc107', label: 'Top 10' });
  
  // Create a simple text representation
  const textChart = document.createElement('div');
  textChart.style.fontFamily = 'monospace';
  textChart.style.fontSize = '12px';
  textChart.style.lineHeight = '1.2';
  textChart.style.backgroundColor = '#f8f9fa';
  textChart.style.padding = '1rem';
  textChart.style.borderRadius = '4px';
  textChart.style.overflowX = 'auto';
  
  let chartText = 'Performance Trends Over Time\n\n';
  chartText += 'Date'.padEnd(12);
  if (showAverage) chartText += 'Average'.padEnd(12);
  if (showMedian) chartText += 'Median'.padEnd(12);
  if (showTop10) chartText += 'Top 10'.padEnd(12);
  chartText += '\n' + '='.repeat(60) + '\n';
  
  trendData.forEach(data => {
    chartText += formatDate(data.date).padEnd(12);
    if (showAverage && data.average !== null) {
      chartText += Math.round(data.average).toLocaleString().padEnd(12);
    } else if (showAverage) {
      chartText += 'N/A'.padEnd(12);
    }
    if (showMedian && data.median !== null) {
      chartText += Math.round(data.median).toLocaleString().padEnd(12);
    } else if (showMedian) {
      chartText += 'N/A'.padEnd(12);
    }
    if (showTop10 && data.top10 !== null) {
      chartText += Math.round(data.top10).toLocaleString().padEnd(12);
    } else if (showTop10) {
      chartText += 'N/A'.padEnd(12);
    }
    chartText += '\n';
  });
  
  textChart.textContent = chartText;
  
  elements.trendsChart.appendChild(chartTitle);
  chartContainer.appendChild(textChart);
  elements.trendsChart.appendChild(chartContainer);
  
  // Generate insights
  generateTrendsInsights(trendData);
}

// Generate insights from trends data
function generateTrendsInsights(trendData) {
  const insights = [];
  
  const validData = trendData.filter(d => d.average !== null);
  if (validData.length < 2) {
    insights.push('Insufficient data for trend analysis');
  } else {
    const firstWeek = validData.slice(0, Math.min(7, validData.length));
    const lastWeek = validData.slice(-Math.min(7, validData.length));
    
    const firstWeekAvg = firstWeek.reduce((sum, d) => sum + d.average, 0) / firstWeek.length;
    const lastWeekAvg = lastWeek.reduce((sum, d) => sum + d.average, 0) / lastWeek.length;
    
    const overallTrend = lastWeekAvg - firstWeekAvg;
    
    if (overallTrend > 200) {
      insights.push('📈 League performance has improved significantly over the season');
    } else if (overallTrend < -200) {
      insights.push('📉 League performance has declined over the season');
    } else {
      insights.push('📊 League performance has remained relatively stable');
    }
    
    const highestDay = validData.reduce((max, d) => d.average > max.average ? d : max);
    const lowestDay = validData.reduce((min, d) => d.average < min.average ? d : min);
    
    insights.push(`🏆 Highest scoring day: ${formatDate(highestDay.date)} (avg: ${Math.round(highestDay.average).toLocaleString()})`);
    insights.push(`📉 Lowest scoring day: ${formatDate(lowestDay.date)} (avg: ${Math.round(lowestDay.average).toLocaleString()})`);
    
    const variance = validData.reduce((sum, d) => {
      const diff = d.average - (validData.reduce((s, x) => s + x.average, 0) / validData.length);
      return sum + (diff * diff);
    }, 0) / validData.length;
    
    if (Math.sqrt(variance) > 1000) {
      insights.push('📊 High variability in daily performance across the season');
    } else {
      insights.push('📊 Consistent performance levels maintained throughout the season');
    }
  }
  
  const insightsTitle = document.createElement('h3');
  insightsTitle.textContent = 'Key Insights';
  elements.trendsInsights.appendChild(insightsTitle);
  
  insights.forEach(insight => {
    const item = document.createElement('div');
    item.className = 'insight-item';
    item.textContent = insight;
    elements.trendsInsights.appendChild(item);
  });
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.backgroundColor = '#f8d7da';
  errorDiv.style.color = '#721c24';
  errorDiv.style.padding = '1rem';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.margin = '1rem 0';
  errorDiv.style.textAlign = 'center';
  errorDiv.textContent = message;
  
  // Insert at the top of main content
  const main = document.querySelector('main');
  main.insertBefore(errorDiv, main.firstChild.nextSibling);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}
