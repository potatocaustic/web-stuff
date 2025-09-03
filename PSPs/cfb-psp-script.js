// Global variables
let currentCategory = 'TB'; // Default category
let allData = {
  RushRecYds: [],
  REC: [],
  TDs: []
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
    RushRecYds: 'https://docs.google.com/spreadsheets/d/1pbumkiC4qhcaLmgZYirQFpljQCTNj7eutiqKx1TBxHE/export?format=csv&gid=0',
    REC: 'https://docs.google.com/spreadsheets/d/1pbumkiC4qhcaLmgZYirQFpljQCTNj7eutiqKx1TBxHE/export?format=csv&gid=471468350',
    TDs: 'https://docs.google.com/spreadsheets/d/1pbumkiC4qhcaLmgZYirQFpljQCTNj7eutiqKx1TBxHE/export?format=csv&gid=1365675911'
  }
};

// DOM elements
const elements = {
  rushrecydsButton: document.getElementById('rushrecydsButton'),
  recButton: document.getElementById('recButton'),
  tdsButton: document.getElementById('tdsButton'),
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

// Initialize the application
async function init() {
  // Add debug log to page
  addDebugLog("Initialize application");
  
  // Set up event listeners
  elements.rushrecydsButton.addEventListener('click', () => switchCategory('RushRecYds'));
  elements.recButton.addEventListener('click', () => switchCategory('REC'));
  elements.tdsButton.addEventListener('click', () => switchCategory('TDs'));
  elements.playerSearchInput.addEventListener('input', handlePlayerSearch);
  elements.showAllButton.addEventListener('click', handleShowAll);
  elements.menuToggle.addEventListener('click', () => elements.navMenu.classList.toggle('show-menu'));

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

// Add debug log message to page (for troubleshooting)
function addDebugLog(message) {
  if (typeof console !== 'undefined') {
    console.log(message);
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

// Helper function to check if a date is 8-19-25
function isDate81925(dateString) {
  if (!dateString) return false;
  
  const patterns = [
    /^8-19-25$/,          
    /^08-19-25$/,          
    /^8\/19\/2025$/,        
    /^08\/19\/2025$/,      
    /^8-19-2025$/,          
    /^08-19-2025$/         
  ];
  
  return patterns.some(pattern => pattern.test(dateString.trim()));
}

function isDate82825(dateString) {
  if (!dateString) return false;
  
  const patterns = [
    /^8-28-25$/,          
    /^08-28-25$/,          
    /^8\/28\/2025$/,        
    /^08\/28\/2025$/,      
    /^8-28-2025$/,          
    /^08-28-2025$/         
  ];
  
  return patterns.some(pattern => pattern.test(dateString.trim()));
}

function isDate82925(dateString) {
  if (!dateString) return false;
  
  const patterns = [
    /^8-29-25$/,          
    /^08-29-25$/,          
    /^8\/29\/2025$/,        
    /^08\/29\/2025$/,      
    /^8-29-2025$/,          
    /^08-29-2025$/         
  ];
  
  return patterns.some(pattern => pattern.test(dateString.trim()));
}

function isDate83025(dateString) {
  if (!dateString) return false;
  
  const patterns = [
    /^8-30-25$/,          
    /^08-30-25$/,          
    /^8\/30\/2025$/,        
    /^08\/30\/2025$/,      
    /^8-30-2025$/,          
    /^08-30-2025$/         
  ];
  
  return patterns.some(pattern => pattern.test(dateString.trim()));
}

function isDate83125(dateString) {
  if (!dateString) return false;
  
  const patterns = [
    /^8-31-25$/,          
    /^08-31-25$/,          
    /^8\/31\/2025$/,        
    /^08\/31\/2025$/,      
    /^8-31-2025$/,          
    /^08-31-2025$/         
  ];
  
  return patterns.some(pattern => pattern.test(dateString.trim()));
}

// Helper function to check if a date is an exception date
function isExceptionDate(dateString) {
  return isDate81925(dateString) || isDate82825(dateString) || isDate82925(dateString) || isDate83025(dateString) || isDate83125(dateString);
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
    
    // Modified filter: Keep entries with Projection !== 0 OR entries from the exception date
    const filtered = data.filter(entry => {
      // Always include entries from the exception date, regardless of Projection value
      if (isExceptionDate(entry.Date)) {
        return true;
      }
      // For all other dates, filter out entries with Projection = 0
      return entry.Projection !== 0;
    });
    
    // Store the data
    allData[category] = filtered;
    
    addDebugLog(`Loaded ${filtered.length} entries for category ${category}`);
    
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
      if (index < values.length) {
        if (['Target Value', 'Rank', 'Votes', 'Hit', 'Projection', 'Delta'].includes(header)) {
          entry[header] = parseFloat(values[index]) || 0;
        } else {
          entry[header] = values[index];
        }
      }
    });
    
    // Only add entry if it has the necessary fields
    if (entry.Date && entry.Name && entry['Target Value'] !== undefined) {
      result.push(entry);
    }
  }
  
  return result;
}

// Switch between categories
async function switchCategory(category) {
  // Update active button
  elements.rushrecydsButton.classList.toggle('active', category === 'RushRecYds');
  elements.recButton.classList.toggle('active', category === 'REC');
  elements.tdsButton.classList.toggle('active', category === 'TDs');
  
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
    if (entry.Name && entry.Name.toLowerCase().includes(searchTerm)) {
      playerSet.add(entry.Name);
    }
  });
  
  return Array.from(playerSet).sort();
}

// Convert date string to a format that can be compared
function getDateParts(dateString) {
  if (!dateString) return [0, 0, 0];
  
  // Check if the date is in format MM-DD-YY
  const hyphenMatch = /^(\d{1,2})-(\d{1,2})-(\d{2})$/.exec(dateString);
  if (hyphenMatch) {
    let [_, month, day, year] = hyphenMatch;
    // Convert 2-digit year to 4-digit year
    year = parseInt(year) + 2000; // Assuming all years are post-2000
    return [parseInt(year), parseInt(month), parseInt(day)];
  }
  
  // Check if the date is in format MM/DD/YYYY
  const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateString);
  if (slashMatch) {
    let [_, month, day, year] = slashMatch;
    return [parseInt(year), parseInt(month), parseInt(day)];
  }
  
  // Default return if format is not recognized
  return [0, 0, 0];
}

// Function to compare dates and sort from newest to oldest
function sortByDateDescending(a, b) {
  // Get date parts [year, month, day] for each date
  const [yearA, monthA, dayA] = getDateParts(a.Date);
  const [yearB, monthB, dayB] = getDateParts(b.Date);
  
  // Compare years first (descending order for newest first)
  if (yearA !== yearB) {
    return yearB - yearA;
  }
  
  // Then compare months (descending order)
  if (monthA !== monthB) {
    return monthB - monthA;
  }
  
  // Finally compare days (descending order)
  return dayB - dayA;
}

// Select a player and display their stats
function selectPlayer(playerName) {
  addDebugLog(`Selecting player: ${playerName}`);
  currentPlayer = playerName;
  
  // Update results title
  elements.resultsTitle.textContent = `Results for ${playerName} - ${getCategoryFullName(currentCategory)}`;
  
  // Filter data for the selected player
  let playerData = allData[currentCategory].filter(entry => entry.Name === playerName);
  
  addDebugLog(`Found ${playerData.length} entries for ${playerName}`);
  if (playerData.length > 0) {
    addDebugLog(`Before sorting - First entry: ${playerData[0].Date}`);
    
    // Check date format of first entry
    const firstDate = playerData[0].Date;
    addDebugLog(`Date format check: ${firstDate} -> Parts: ${getDateParts(firstDate).join('/')}`);
  }
  
  // IMPORTANT: Sort data from newest to oldest
  playerData.sort(sortByDateDescending);
  
  if (playerData.length > 0) {
    addDebugLog(`After sorting - First entry: ${playerData[0].Date}`);
  }
  
  // Verify sort by printing first few entries
  if (playerData.length > 1) {
    addDebugLog("First few entries after sorting:");
    playerData.slice(0, Math.min(5, playerData.length)).forEach((entry, i) => {
      addDebugLog(`${i+1}. ${entry.Date}`);
    });
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
  addDebugLog(`Displaying player data. Limit to five: ${limitToFive}`);
  
  // Clear previous results
  elements.playerStatsBody.innerHTML = '';
  
  // Check if there are results
  if (playerData.length > 0) {
    // Show the table, hide no results message
    elements.noResultsMessage.classList.add('hidden');
    elements.playerStatsBody.parentElement.classList.remove('hidden');
    
    // Make a copy of the player data to avoid modifying the original
    let dataToDisplay = [...playerData];
    
    // Sort again to ensure newest first (redundant but safe)
    dataToDisplay.sort(sortByDateDescending);
    
    // Limit to first 5 if requested
    if (limitToFive && dataToDisplay.length > 5) {
      dataToDisplay = dataToDisplay.slice(0, 5);
    }
    
    // Log first and last entries for debugging
    if (dataToDisplay.length > 0) {
      addDebugLog(`First displayed entry date: ${dataToDisplay[0].Date}`);
      if (dataToDisplay.length > 1) {
        addDebugLog(`Last displayed entry date: ${dataToDisplay[dataToDisplay.length-1].Date}`);
      }
    }
    
    // Populate table with player data
    dataToDisplay.forEach(entry => {
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
  
  // Copy data array to avoid modifying original
  let sortedData = [...playerData];
  
  // Sort by date (newest first)
  sortedData.sort(sortByDateDescending);
  
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
    case 'RushRecYds': return 'Rush + Rec Yards';
    case 'REC': return 'Receptions';
    case 'TDs': return 'TDs (non-passing)';
    default: return category;
  }
}

// Format date from M-D-YY or MM/DD/YYYY to a more readable format
function formatDate(dateString) {
  if (!dateString) return '';
  
  // Get date parts [year, month, day]
  const [year, month, day] = getDateParts(dateString);
  
  // Manual formatting to avoid browser inconsistencies
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[month - 1] || '';
  
  return `${monthName} ${day}, ${year}`;
}

// Update last updated text
function updateLastUpdatedText() {
  if (dataLastUpdated) {
    const formattedDate = formatDateWithTime(dataLastUpdated);
    elements.lastUpdated.textContent = `Last updated: ${formattedDate}`;
  } else {
    elements.lastUpdated.textContent = 'Data successfully loaded';
  }
}

// Helper function to format date with time
function formatDateWithTime(date) {
  try {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return date.toString();
  }
}
