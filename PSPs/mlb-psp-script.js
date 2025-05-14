// Global variables
let currentCategory = 'TB'; // Default category
let allData = {
  TB: [],
  RBI: [],
  PK: []
};
let currentPlayer = null;
let dataLastUpdated = null;
let currentPlayerData = null; // Store current player data globally for "Show All" functionality

// Configuration - update these with your actual data sources
const CONFIG = {
  // Set DATA_SOURCE to 'google_sheets' or 'server' based on your preferred method
  DATA_SOURCE: 'google_sheets',
  
  // Google Sheet direct URLs (if using 'google_sheets' source)
  GOOGLE_SHEET_URLS: {
    TB: 'https://docs.google.com/spreadsheets/d/1fOlILjsP0Nk_w92dn7WxA10-gM0zc8NjBw7Pu_YN-Hk/export?format=csv&gid=0',
    RBI: 'https://docs.google.com/spreadsheets/d/1fOlILjsP0Nk_w92dn7WxA10-gM0zc8NjBw7Pu_YN-Hk/export?format=csv&gid=622677442',
    PK: 'https://docs.google.com/spreadsheets/d/1fOlILjsP0Nk_w92dn7WxA10-gM0zc8NjBw7Pu_YN-Hk/export?format=csv&gid=226676683'
  },

// DOM elements
const elements = {
  tbButton: document.getElementById('tbButton'),
  rbiButton: document.getElementById('rbiButton'),
  pkButton: document.getElementById('pkButton'),
  playerSearchInput: document.getElementById('playerSearchInput'),
  searchResults: document.getElementById('searchResults'),
  resultsTitle: document.getElementById('resultsTitle'),
  playerStatsBody: document.getElementById('playerStatsBody'),
  noResultsMessage: document.getElementById('noResultsMessage'),
  lastUpdated: document.getElementById('last-updated'),
  statsSection: document.getElementById('statsSection'),
  successRateByTarget: document.getElementById('successRateByTarget'),
  avgRankSection: document.getElementById('avgRankSection'),
  showAllButton: document.getElementById('showAllButton')
};

// Event listeners
document.addEventListener('DOMContentLoaded', init);

// Initialize the application
async function init() {
  // Set up event listeners
  elements.tbButton.addEventListener('click', () => switchCategory('TB'));
  elements.rbiButton.addEventListener('click', () => switchCategory('RBI'));
  elements.pkButton.addEventListener('click', () => switchCategory('PK'));
  elements.playerSearchInput.addEventListener('input', handlePlayerSearch);
  elements.showAllButton.addEventListener('click', handleShowAll);
  
  // Initial data load
  try {
    // For server source, also get metadata first
    if (CONFIG.DATA_SOURCE === 'server') {
      await loadMetadata();
    }
    
    await loadData(currentCategory);
    updateLastUpdatedText();
  } catch (error) {
    console.error('Failed to load initial data:', error);
    elements.lastUpdated.textContent = 'Error loading data. Please try refreshing the page.';
  }
}

// Load metadata from server (only for server data source)
async function loadMetadata() {
  if (CONFIG.DATA_SOURCE !== 'server') return;
  
  try {
    const response = await fetch(CONFIG.SERVER_JSON_URLS.METADATA);
    const metadata = await response.json();
    
    if (metadata && metadata.last_updated) {
      dataLastUpdated = new Date(metadata.last_updated);
    }
  } catch (error) {
    console.error('Error loading metadata:', error);
  }
}

// Function to load data for a specific category
async function loadData(category) {
  if (allData[category].length > 0) {
    // Data already loaded for this category
    return;
  }
  
  try {
    let data;
    
    if (CONFIG.DATA_SOURCE === 'google_sheets') {
      // Load directly from Google Sheets
      const response = await fetch(CONFIG.GOOGLE_SHEET_URLS[category]);
      const csvText = await response.text();
      
      // Parse CSV to JSON
      data = parseCSV(csvText);
    } else {
      // Load from server JSON files
      const response = await fetch(CONFIG.SERVER_JSON_URLS[category]);
      const jsonData = await response.json();
      
      data = jsonData.data;
      
      // If metadata wasn't loaded separately, use the timestamp from this response
      if (!dataLastUpdated && jsonData.updated) {
        dataLastUpdated = new Date(jsonData.updated);
      }
    }
    
    // Filter out entries with Projection = 0
    const filtered = data.filter(entry => entry.Projection !== 0);
    
    // Store the data
    allData[category] = filtered;
    
    return filtered;
  } catch (error) {
    console.error(`Error loading data for ${category}:`, error);
    throw error;
  }
}

// Parse CSV text to JSON (only needed for Google Sheets source)
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(value => value.trim());
    const entry = {};
    
    headers.forEach((header, index) => {
      // Convert numeric values
      if (['Target Value', 'Rank', 'Votes', 'Hit', 'Projection', 'Delta'].includes(header)) {
        entry[header] = parseFloat(values[index]);
      } else {
        entry[header] = values[index];
      }
    });
    
    result.push(entry);
  }
  
  return result;
}

// Switch between categories
async function switchCategory(category) {
  // Update active button
  elements.tbButton.classList.toggle('active', category === 'TB');
  elements.rbiButton.classList.toggle('active', category === 'RBI');
  elements.pkButton.classList.toggle('active', category === 'PK');
  
  // Set current category
  currentCategory = category;
  
  // Load data if not already loaded
  if (allData[category].length === 0) {
    try {
      await loadData(category);
      updateLastUpdatedText();
    } catch (error) {
      console.error(`Failed to load data for ${category}:`, error);
      return;
    }
  }
  
  // Clear current search and results
  elements.playerSearchInput.value = '';
  elements.searchResults.innerHTML = '';
  
  // Reset player results
  resetPlayerResults();
  
  // Focus on search input
  elements.playerSearchInput.focus();
}

// Handle player search
function handlePlayerSearch() {
  const searchTerm = elements.playerSearchInput.value.trim().toLowerCase();
  elements.searchResults.innerHTML = '';
  
  if (searchTerm.length < 2) return;
  
  // Get unique players from the current category
  const players = getUniquePlayers(currentCategory, searchTerm);
  
  // Display matching players
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

// Handle Show All button click
function handleShowAll() {
  if (!currentPlayerData) return;
  
  // Display all player data
  displayPlayerData(currentPlayerData, false);
  
  // Hide the "Show All" button
  elements.showAllButton.classList.add('hidden');
}

// Get unique players matching search term
function getUniquePlayers(category, searchTerm) {
  const playerSet = new Set();
  
  allData[category].forEach(entry => {
    if (entry.Name.toLowerCase().includes(searchTerm)) {
      playerSet.add(entry.Name);
    }
  });
  
  return Array.from(playerSet).sort();
}

// Select a player and display their stats
function selectPlayer(playerName) {
  currentPlayer = playerName;
  
  // Update results title
  elements.resultsTitle.textContent = `Results for ${playerName} - ${getCategoryFullName(currentCategory)}`;
  
  // Filter data for the selected player
  const playerData = allData[currentCategory].filter(entry => entry.Name === playerName);
  
  // Sort data by date (newest first)
  playerData.sort((a, b) => {
    const dateA = new Date(a.Date);
    const dateB = new Date(b.Date);
    return dateB - dateA;
  });
  
  // Store current player data globally
  currentPlayerData = playerData;
  
  // Display only the first 5 results initially
  displayPlayerData(playerData, true);
  
  // Show/hide the Show All button based on data length
  if (playerData.length > 5) {
    elements.showAllButton.classList.remove('hidden');
  } else {
    elements.showAllButton.classList.add('hidden');
  }
  
  // Clear search results
  elements.searchResults.innerHTML = '';
}

// Display player data
function displayPlayerData(playerData, limitToFive) {
  // Clear previous results
  elements.playerStatsBody.innerHTML = '';
  
  // Check if there are results
  if (playerData.length > 0) {
    // Show the table, hide no results message
    elements.noResultsMessage.classList.add('hidden');
    elements.playerStatsBody.parentElement.classList.remove('hidden');
    
    // Determine how many entries to display
    const entriesToDisplay = limitToFive ? Math.min(5, playerData.length) : playerData.length;
    
    // Populate table with player data
    for (let i = 0; i < entriesToDisplay; i++) {
      const entry = playerData[i];
      const row = document.createElement('tr');
      
      // Format the date
      const formattedDate = formatDate(entry.Date);
      
      // Create table cells with whole number rank
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${entry['Target Value']}</td>
        <td>${Math.round(entry.Rank)}</td>
        <td><span class="${entry.Hit === 1 ? 'hit' : 'miss'}">${entry.Hit === 1 ? 'Hit' : 'Miss'}</span></td>
      `;
      
      elements.playerStatsBody.appendChild(row);
    }
    
    // Calculate and display stats
    updatePlayerStats(playerData);
    elements.statsSection.classList.remove('hidden');
  } else {
    // Show no results message
    elements.noResultsMessage.classList.remove('hidden');
    elements.playerStatsBody.parentElement.classList.add('hidden');
    elements.statsSection.classList.add('hidden');
  }
}

// Reset player results
function resetPlayerResults() {
  elements.resultsTitle.textContent = 'Select a player to view results';
  elements.playerStatsBody.innerHTML = '';
  elements.noResultsMessage.classList.add('hidden');
  elements.statsSection.classList.add('hidden');
  elements.showAllButton.classList.add('hidden');
  currentPlayer = null;
  currentPlayerData = null;
}

// Update player stats summary
function updatePlayerStats(playerData) {
  // Clear previous stats
  elements.successRateByTarget.innerHTML = '';
  elements.avgRankSection.innerHTML = '';
  
  // Calculate success rate by target value
  const targetValueMap = new Map();
  
  // Group data by target value
  playerData.forEach(entry => {
    const targetValue = entry['Target Value'];
    if (!targetValueMap.has(targetValue)) {
      targetValueMap.set(targetValue, { total: 0, hits: 0 });
    }
    
    const stats = targetValueMap.get(targetValue);
    stats.total += 1;
    stats.hits += entry.Hit;
  });
  
  // Create success rate by target value display
  if (targetValueMap.size > 0) {
    const targetHeader = document.createElement('h3');
    targetHeader.textContent = 'Success Rate by Target Value';
    elements.successRateByTarget.appendChild(targetHeader);
    
    const targetTable = document.createElement('table');
    targetTable.classList.add('stats-table');
    
    // Create table header
    const tableHeader = document.createElement('tr');
    tableHeader.innerHTML = '<th>Target</th><th>Success Rate</th><th>Record</th>';
    targetTable.appendChild(tableHeader);
    
    // Sort target values numerically
    const sortedTargets = Array.from(targetValueMap.keys()).sort((a, b) => a - b);
    
    // Add rows for each target value
    sortedTargets.forEach(target => {
      const stats = targetValueMap.get(target);
      const successRate = (stats.hits / stats.total) * 100;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${target}</td>
        <td>${successRate.toFixed(1)}%</td>
        <td>${stats.hits}/${stats.total}</td>
      `;
      
      targetTable.appendChild(row);
    });
    
    elements.successRateByTarget.appendChild(targetTable);
  }
  
  // Calculate average ranks for different periods
  const calculateAvgRank = (data) => {
    if (data.length === 0) return 0;
    const totalRank = data.reduce((sum, entry) => sum + entry.Rank, 0);
    return totalRank / data.length;
  };
  
  const overallAvgRank = calculateAvgRank(playerData);
  const last5AvgRank = calculateAvgRank(playerData.slice(0, Math.min(5, playerData.length)));
  const last10AvgRank = calculateAvgRank(playerData.slice(0, Math.min(10, playerData.length)));
  
  // Create average rank display
  const rankHeader = document.createElement('h3');
  rankHeader.textContent = 'Average Rank';
  elements.avgRankSection.appendChild(rankHeader);
  
  const rankTable = document.createElement('table');
  rankTable.classList.add('stats-table');
  
  // Create table header
  const rankTableHeader = document.createElement('tr');
  rankTableHeader.innerHTML = '<th>Period</th><th>Avg. Rank</th>';
  rankTable.appendChild(rankTableHeader);
  
  // Add rows for each period
  const periods = [
    { name: 'Last 5', value: Math.round(last5AvgRank) },
    { name: 'Last 10', value: Math.round(last10AvgRank) },
    { name: 'Overall', value: Math.round(overallAvgRank) }
  ];
  
  periods.forEach(period => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${period.name}</td>
      <td>${period.value}</td>
    `;
    
    rankTable.appendChild(row);
  });
  
  elements.avgRankSection.appendChild(rankTable);
}

// Get full category name
function getCategoryFullName(category) {
  switch(category) {
    case 'TB': return 'Total Bases';
    case 'RBI': return 'RBIs';
    case 'PK': return 'Strikeouts';
    default: return category;
  }
}

// Format date from MM/DD/YYYY to a more readable format
function formatDate(dateString) {
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString;
  
  const month = parseInt(parts[0]);
  const day = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  const date = new Date(year, month - 1, day);
  
  // Format as "Mon DD, YYYY"
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Update last updated text
function updateLastUpdatedText() {
  if (dataLastUpdated) {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    const formattedDate = dataLastUpdated.toLocaleDateString('en-US', options);
    elements.lastUpdated.textContent = `Last updated: ${formattedDate}`;
  } else {
    elements.lastUpdated.textContent = 'Data successfully loaded';
  }
}
