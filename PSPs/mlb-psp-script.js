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
  }
};

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
  console.log("Initializing MLB PSP Database...");
  
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
    
    // Process and add sortable date
    filtered.forEach(entry => {
      // Convert MM/DD/YYYY to YYYY-MM-DD for consistent sorting
      if (entry.Date && typeof entry.Date === 'string') {
        const parts = entry.Date.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          entry.sortableDate = `${year}-${month}-${day}`;
        } else {
          entry.sortableDate = '0000-00-00'; // Fallback
        }
      } else {
        entry.sortableDate = '0000-00-00'; // Fallback
      }
    });
    
    // Store the data
    allData[category] = filtered;
    console.log(`Loaded ${filtered.length} entries for category ${category}`);
    
    return filtered;
  } catch (error) {
    console.error(`Error loading data for ${category}:`, error);
    throw error;
  }
}

// Parse CSV text to JSON (only needed for Google Sheets source)
function parseCSV(csvText) {
  console.log("Parsing CSV data...");
  
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(value => value.trim());
    const entry = {};
    
    headers.forEach((header, index) => {
      // Convert numeric values if in range
      if (index < values.length) {
        if (['Target Value', 'Rank', 'Votes', 'Hit', 'Projection', 'Delta'].includes(header)) {
          entry[header] = parseFloat(values[index]) || 0;
        } else {
          entry[header] = values[index];
        }
      }
    });
    
    // Only add entry if it has all required fields
    if (entry.Date && entry.Name && entry['Target Value'] !== undefined) {
      result.push(entry);
    }
  }
  
  console.log(`Parsed ${result.length} rows from CSV`);
  return result;
}

// Switch between categories
async function switchCategory(category) {
  console.log(`Switching to category: ${category}`);
  
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
  
  console.log("Show All button clicked");
  
  // Display all player data
  displayPlayerData(currentPlayerData, false);
  
  // Hide the "Show All" button
  elements.showAllButton.classList.add('hidden');
}

// Get unique players matching search term
function getUniquePlayers(category, searchTerm) {
  const playerSet = new Set();
  
  allData[category].forEach(entry => {
    if (entry.Name && entry.Name.toLowerCase().includes(searchTerm)) {
      playerSet.add(entry.Name);
    }
  });
  
  return Array.from(playerSet).sort();
}

// Select a player and display their stats
function selectPlayer(playerName) {
  console.log(`Selecting player: ${playerName}`);
  currentPlayer = playerName;
  
  // Update results title
  elements.resultsTitle.textContent = `Results for ${playerName} - ${getCategoryFullName(currentCategory)}`;
  
  // Filter data for the selected player
  let playerData = allData[currentCategory].filter(entry => entry.Name === playerName);
  
  // Sort by sortableDate (newest first)
  playerData.sort((a, b) => {
    // Reverse order for descending (newest first)
    return b.sortableDate.localeCompare(a.sortableDate);
  });
  
  console.log(`Found ${playerData.length} records for ${playerName}, sorted newest first`);
  if (playerData.length > 0) {
    console.log(`First entry date: ${playerData[0].Date}, sortable: ${playerData[0].sortableDate}`);
    console.log(`Last entry date: ${playerData[playerData.length-1].Date}, sortable: ${playerData[playerData.length-1].sortableDate}`);
  }
  
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
  console.log(`Displaying player data. Limit to five: ${limitToFive}`);
  
  // Clear previous results
  elements.playerStatsBody.innerHTML = '';
  
  // Check if there are results
  if (playerData.length > 0) {
    // Show the table, hide no results message
    elements.noResultsMessage.classList.add('hidden');
    elements.playerStatsBody.parentElement.classList.remove('hidden');
    
    // Make a copy of the data for display
    const dataToDisplay = [...playerData];
    
    // Sort again by sortableDate (newest first) to ensure proper order
    dataToDisplay.sort((a, b) => b.sortableDate.localeCompare(a.sortableDate));
    
    // Take only the first N entries if limiting
    const displayEntries = limitToFive 
      ? dataToDisplay.slice(0, Math.min(5, dataToDisplay.length)) 
      : dataToDisplay;
    
    console.log(`Displaying ${displayEntries.length} entries. First entry date: ${displayEntries[0].Date}`);
    
    // Populate table with player data
    displayEntries.forEach(entry => {
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
    });
    
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
  
  // Make a copy and sort by sortableDate (newest first)
  const sortedData = [...playerData].sort((a, b) => b.sortableDate.localeCompare(a.sortableDate));
  
  // Calculate success rate by target value
  const targetValueMap = new Map();
  
  // Group data by target value
  sortedData.forEach(entry => {
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
  
  // Use sorted data for these calculations
  const overallAvgRank = calculateAvgRank(sortedData);
  const last5AvgRank = calculateAvgRank(sortedData.slice(0, Math.min(5, sortedData.length)));
  const last10AvgRank = calculateAvgRank(sortedData.slice(0, Math.min(10, sortedData.length)));
  
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
  // Validate input
  if (!dateString || typeof dateString !== 'string') {
    return 'Invalid Date';
  }

  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString;
  
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  // Validate parsed values
  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    return dateString;
  }
  
  // Format as "Mon DD, YYYY" manually to avoid browser inconsistencies
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[month-1]} ${day}, ${year}`;
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
    
    let formattedDate;
    try {
      formattedDate = dataLastUpdated.toLocaleDateString('en-US', options);
    } catch (e) {
      // Fallback if toLocaleDateString fails
      formattedDate = dataLastUpdated.toString();
    }
    
    elements.lastUpdated.textContent = `Last updated: ${formattedDate}`;
  } else {
    elements.lastUpdated.textContent = 'Data successfully loaded';
  }
}
