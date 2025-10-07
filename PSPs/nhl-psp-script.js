// Global variables
let currentCategory = 'SHOTS'; // Default NBA category
let allData = {
  SHOTS: [],
  PTS: [],
  HITS: [],
  "SAVES": []
};
let currentPlayer = null;
let currentPlayerData = null;

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://sjqvaelyxdpchnswpapi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcXZhZWx5eGRwY2huc3dwYXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODU0OTEsImV4cCI6MjA3MzE2MTQ5MX0.mqql48513Ru5s7KEgXP787bNNi5f2ROANfMHzTN6wUM';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const elements = {
  ptsButton: document.getElementById('ptsButton'),
  rebButton: document.getElementById('rebButton'),
  astButton: document.getElementById('astButton'),
  threePMButton: document.getElementById('threePMButton'),
  playerSearchInput: document.getElementById('playerSearchInput'),
  searchResults: document.getElementById('searchResults'),
  resultsTitle: document.getElementById('resultsTitle'),
  playerStatsBody: document.getElementById('playerStatsBody'),
  noResultsMessage: document.getElementById('noResultsMessage'),
  lastUpdated: document.getElementById('last-updated'),
  statsSection: document.getElementById('statsSection'),
  successRateByTarget: document.getElementById('successRateByTarget'),
  avgRankSection: document.getElementById('avgRankSection'),
  showAllButton: document.getElementById('showAllButton'),
  menuToggle: document.getElementById('menu-toggle'),
  navMenu: document.getElementById('nav-menu')
};

// Event listeners
document.addEventListener('DOMContentLoaded', init);

async function init() {
  elements.shotsButton.addEventListener('click', () => switchCategory('SHOTS'));
  elements.ptsButton.addEventListener('click', () => switchCategory('PTS'));
  elements.hitsButton.addEventListener('click', () => switchCategory('HITS'));
  elements.savesButton.addEventListener('click', () => switchCategory("SAVES"));
  elements.playerSearchInput.addEventListener('input', handlePlayerSearch);
  elements.showAllButton.addEventListener('click', handleShowAll);
  elements.menuToggle.addEventListener('click', () => elements.navMenu.classList.toggle('show-menu'));

  try {
    await loadData(currentCategory);
    elements.lastUpdated.textContent = 'Data loaded successfully.';
  } catch (error) {
    console.error('Failed to load initial data:', error);
    elements.lastUpdated.textContent = 'Error loading data.';
  }
}

async function loadData(category) {
  if (allData[category].length > 0) return;
  try {
    const { data, error } = await supabaseClient
      .from('nhl_psp_data') // Fetch from NBA table
      .select('*')
      .eq('category', category);
    if (error) throw error;
    allData[category] = data;
    console.log(`Loaded ${data.length} entries for category ${category}`);
  } catch (error) {
    console.error(`Error loading data for ${category}:`, error);
    throw error;
  }
}

async function switchCategory(category) {
  elements.shotsButton.classList.toggle('active', category === 'SHOTS');
  elements.ptsButton.classList.toggle('active', category === 'PTS');
  elements.hitsButton.classList.toggle('active', category === 'HITS');
  elements.savesButton.classList.toggle('active', category === "SAVES");
  currentCategory = category;
  if (allData[category].length === 0) {
    try {
      await loadData(category);
    } catch (error) {
      console.error(`Failed to load data for ${category}:`, error);
      return;
    }
  }
  elements.playerSearchInput.value = '';
  elements.searchResults.innerHTML = '';
  resetPlayerResults();
  elements.playerSearchInput.focus();
}

function handlePlayerSearch() {
  const searchTerm = elements.playerSearchInput.value.trim().toLowerCase();
  elements.searchResults.innerHTML = '';
  if (searchTerm.length < 2) return;
  const players = getUniquePlayers(currentCategory, searchTerm);
  if (players.length > 0) {
    players.forEach(player => {
      const resultItem = document.createElement('div');
      resultItem.classList.add('search-result-item');
      resultItem.textContent = player;
      resultItem.addEventListener('click', () => selectPlayer(player));
      elements.searchResults.appendChild(resultItem);
    });
  } else {
    const noResults = document.createElement('div');
    noResults.classList.add('search-result-item');
    noResults.textContent = 'No players found';
    elements.searchResults.appendChild(noResults);
  }
}

function handleShowAll() {
  if (!currentPlayerData) return;
  displayPlayerData(currentPlayerData, false);
  elements.showAllButton.classList.add('hidden');
}

function getUniquePlayers(category, searchTerm) {
  const playerSet = new Set();
  allData[category].forEach(entry => {
    if (entry.player_name && entry.player_name.toLowerCase().includes(searchTerm)) {
      playerSet.add(entry.player_name);
    }
  });
  return Array.from(playerSet).sort();
}

function sortByDateDescending(a, b) {
  return new Date(b.poll_date) - new Date(a.poll_date);
}

function selectPlayer(playerName) {
  currentPlayer = playerName;
  elements.resultsTitle.textContent = `Results for ${playerName} - ${getCategoryFullName(currentCategory)}`;
  let playerData = allData[currentCategory].filter(entry => entry.player_name === playerName);
  playerData.sort(sortByDateDescending);
  currentPlayerData = playerData;
  displayPlayerData(playerData, true);
  if (playerData.length > 5) {
    elements.showAllButton.classList.remove('hidden');
  } else {
    elements.showAllButton.classList.add('hidden');
  }
  elements.searchResults.innerHTML = '';
}

function displayPlayerData(playerData, limitToFive) {
  elements.playerStatsBody.innerHTML = '';
  if (playerData.length > 0) {
    elements.noResultsMessage.classList.add('hidden');
    elements.playerStatsBody.parentElement.classList.remove('hidden');
    let dataToDisplay = [...playerData];
    if (limitToFive && dataToDisplay.length > 5) {
      dataToDisplay = dataToDisplay.slice(0, 5);
    }
    dataToDisplay.forEach(entry => {
      const row = document.createElement('tr');
      const formattedDate = formatDate(entry.poll_date);
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${entry.target_value}</td>
        <td>${Math.round(entry.player_rank)}</td>
        <td><span class="${entry.hit ? 'hit' : 'miss'}">${entry.hit ? 'Hit' : 'Miss'}</span></td>
      `;
      elements.playerStatsBody.appendChild(row);
    });
    updatePlayerStats(playerData);
    elements.statsSection.classList.remove('hidden');
  } else {
    elements.noResultsMessage.classList.remove('hidden');
    elements.playerStatsBody.parentElement.classList.add('hidden');
    elements.statsSection.classList.add('hidden');
  }
}

function resetPlayerResults() {
  elements.resultsTitle.textContent = 'Select a player to view results';
  elements.playerStatsBody.innerHTML = '';
  elements.noResultsMessage.classList.add('hidden');
  elements.statsSection.classList.add('hidden');
  elements.showAllButton.classList.add('hidden');
  currentPlayer = null;
  currentPlayerData = null;
}

function updatePlayerStats(playerData) {
  elements.successRateByTarget.innerHTML = '';
  elements.avgRankSection.innerHTML = '';
  const targetValueMap = new Map();
  playerData.forEach(entry => {
    const targetValue = entry.target_value;
    if (!targetValueMap.has(targetValue)) {
      targetValueMap.set(targetValue, { total: 0, hits: 0 });
    }
    const stats = targetValueMap.get(targetValue);
    stats.total += 1;
    stats.hits += entry.hit ? 1 : 0;
  });
  if (targetValueMap.size > 0) {
    const targetHeader = document.createElement('h3');
    targetHeader.textContent = 'Success Rate by Target Value';
    elements.successRateByTarget.appendChild(targetHeader);
    const targetTable = document.createElement('table');
    targetTable.classList.add('stats-table');
    targetTable.innerHTML = '<tr><th>Target</th><th>Success Rate</th><th>Record</th></tr>';
    const sortedTargets = Array.from(targetValueMap.keys()).sort((a, b) => a - b);
    sortedTargets.forEach(target => {
      const stats = targetValueMap.get(target);
      const successRate = (stats.hits / stats.total) * 100;
      const row = document.createElement('tr');
      row.innerHTML = `<td>${target}</td><td>${successRate.toFixed(1)}%</td><td>${stats.hits}/${stats.total}</td>`;
      targetTable.appendChild(row);
    });
    elements.successRateByTarget.appendChild(targetTable);
  }
  const calculateAvgRank = (data) => {
    if (data.length === 0) return 0;
    const totalRank = data.reduce((sum, entry) => sum + entry.player_rank, 0);
    return totalRank / data.length;
  };
  const sortedData = [...playerData].sort(sortByDateDescending);
  const overallAvgRank = calculateAvgRank(sortedData);
  const last5AvgRank = calculateAvgRank(sortedData.slice(0, 5));
  const last10AvgRank = calculateAvgRank(sortedData.slice(0, 10));
  const rankHeader = document.createElement('h3');
  rankHeader.textContent = 'Average Rank';
  elements.avgRankSection.appendChild(rankHeader);
  const rankTable = document.createElement('table');
  rankTable.classList.add('stats-table');
  rankTable.innerHTML = '<tr><th>Period</th><th>Avg. Rank</th></tr>';
  const periods = [
    { name: 'Last 5', value: Math.round(last5AvgRank) },
    { name: 'Last 10', value: Math.round(last10AvgRank) },
    { name: 'Overall', value: Math.round(overallAvgRank) }
  ];
  periods.forEach(period => {
    if (period.value > 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${period.name}</td><td>${period.value}</td>`;
      rankTable.appendChild(row);
    }
  });
  elements.avgRankSection.appendChild(rankTable);
}

function getCategoryFullName(category) {
    switch (category) {
        case 'SHOTS': return 'Shots';
        case 'PTS': return 'Points';
        case 'HITS': return 'Hits';
        case "Saves": return 'Saves';
        default: return category;
    }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
