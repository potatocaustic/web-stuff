// Global variables
let currentCategory = 'PTS'; // Default category
let allData = {
  PTS: [],
  REB: [],
  AST: [],
  TPM: []
};
let currentPlayer = null;
let dataLastUpdated = null;
let currentPlayerData = null; // Store current player data globally for "Show All" functionality

// Configuration - update these with your actual data sources
const CONFIG = {
  DATA_SOURCE: 'google_sheets',
  
  GOOGLE_SHEET_URLS: {
    PTS: 'https://docs.google.com/spreadsheets/d/1mb8Ff8jqKBuBOIKTwGVwLF4hInHt3FYIAvRlILeDnx8/export?format=csv&gid=0',
    REB: 'https://docs.google.com/spreadsheets/d/1mb8Ff8jqKBuBOIKTwGVwLF4hInHt3FYIAvRlILeDnx8/export?format=csv&gid=1526651812',
    AST: 'https://docs.google.com/spreadsheets/d/1mb8Ff8jqKBuBOIKTwGVwLF4hInHt3FYIAvRlILeDnx8/export?format=csv&gid=916391583',
    TPM: 'https://docs.google.com/spreadsheets/d/1mb8Ff8jqKBuBOIKTwGVwLF4hInHt3FYIAvRlILeDnx8/export?format=csv&gid=372469482'
  }
};

// DOM elements
const elements = {
  ptsButton: document.getElementById('ptsButton'),
  rebButton: document.getElementById('rebButton'),
  astButton: document.getElementById('astButton'),
  tpmButton: document.getElementById('tpmButton'),
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
  addDebugLog("Initialize application");
  
  // Set up event listeners
  elements.ptsButton.addEventListener('click', () => switchCategory('PTS'));
  elements.rebButton.addEventListener('click', () => switchCategory('REB'));
  elements.astButton.addEventListener('click', () => switchCategory('AST'));
  elements.tpmButton.addEventListener('click', () => switchCategory('TPM'));
  elements.playerSearchInput.addEventListener('input', handlePlayerSearch);
  elements.showAllButton.addEventListener('click', handleShowAll);
  elements.menuToggle.addEventListener('click', () => elements.navMenu.classList.toggle('show-menu'));

  // Initial data load
  try {
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

// Helper function to check if a date is 5-18-25
function isDate51825(dateString) {
  if (!dateString) return false;
  
  const patterns = [
    /^5-18-25$/,
    /^05-18-25$/,
    /^5\/18\/2025$/,
    /^05\/18\/2025$/,
    /^5-18-2025$/,
    /^05-18-2025$/
  ];
  
  return patterns.some(pattern => pattern.test(dateString.trim()));
}

// Helper function to check if a date is 6-6-25
function isDate6625(dateString) {
  if (!dateString) return false;
  
  const patterns = [
    /^6-6-25$/,
    /^06-06-25$/,
    /^6\/6\/2025$/,
    /^06\/06\/2025$/,
    /^6-6-2025$/,
    /^06-06-2025$/
  ];
  
  return patterns.some(pattern => pattern.test(dateString.trim()));
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

// Helper function to check if a date is an exception date
function isExceptionDate(dateString) {
  return isDate51825(dateString) || isDate6625(dateString) || isDate81925(dateString);
}

// Function to load data for a specific category
async function loadData(category) {
  if (allData[category].length > 0) {
    return;
  }
  
  try {
    let data;
    
    if (CONFIG.DATA_SOURCE === 'google_sheets') {
      const response = await fetch(CONFIG.GOOGLE_SHEET_URLS[category]);
      const csvText = await response.text();
      data = parseCSV(csvText);
    } else {
      const response = await fetch(CONFIG.SERVER_JSON_URLS[category]);
      const jsonData = await response.json();
      data = jsonData.data;
      if (!dataLastUpdated && jsonData.updated) {
        dataLastUpdated = new Date(jsonData.updated);
      }
    }
    
    const filtered = data.filter(entry => {
      if (isExceptionDate(entry.Date)) {
        return true;
      }
      return entry.Projection !== 0;
    });
    
    allData[category] = filtered;
    addDebugLog(`Loaded ${filtered.length} entries for category ${category}`);
    return filtered;
  } catch (error) {
    console.error(`Error loading data for ${category}:`, error);
    throw error;
  }
}

// Parse CSV text to JSON
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(value => value.trim());
    const entry = {};
    
    headers.forEach((header, index) => {
      if (index < values.length) {
        if (['Target Value', 'Rank', 'Votes', 'Hit', 'Projection', 'Delta'].includes(header)) {
          entry[header] = parseFloat(values[index]) || 0;
        } else {
          entry[header] = values[index];
        }
      }
    });
    
    if (entry.Date && entry.Name && entry['Target Value'] !== undefined) {
      result.push(entry);
    }
  }
  
  return result;
}

// Switch between categories
async function switchCategory(category) {
  elements.ptsButton.classList.toggle('active', category === 'PTS');
  elements.rebButton.classList.toggle('active', category === 'REB');
  elements.astButton.classList.toggle('active', category === 'AST');
  elements.tpmButton.classList.toggle('active', category === 'TPM');
  
  currentCategory = category;
  
  if (allData[category].length === 0) {
    try {
      await loadData(category);
      updateLastUpdatedText();
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

// Handle player search
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

// Handle Show All button click
function handleShowAll() {
  if (!currentPlayerData) return;
  displayPlayerData(currentPlayerData, false);
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
  
  const hyphenMatch = /^(\d{1,2})-(\d{1,2})-(\d{2})$/.exec(dateString);
  if (hyphenMatch) {
    let [_, month, day, year] = hyphenMatch;
    year = parseInt(year) + 2000;
    return [parseInt(year), parseInt(month), parseInt(day)];
  }
  
  const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateString);
  if (slashMatch) {
    let [_, month, day, year] = slashMatch;
    return [parseInt(year), parseInt(month), parseInt(day)];
  }
  
  return [0, 0, 0];
}

// Function to compare dates and sort from newest to oldest
function sortByDateDescending(a, b) {
  const [yearA, monthA, dayA] = getDateParts(a.Date);
  const [yearB, monthB, dayB] = getDateParts(b.Date);
  
  if (yearA !== yearB) return yearB - yearA;
  if (monthA !== monthB) return monthB - monthA;
  return dayB - dayA;
}

// Select a player and display their stats
function selectPlayer(playerName) {
  addDebugLog(`Selecting player: ${playerName}`);
  currentPlayer = playerName;
  elements.resultsTitle.textContent = `Results for ${playerName} - ${getCategoryFullName(currentCategory)}`;
  
  let playerData = allData[currentCategory].filter(entry => entry.Name === playerName);
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

// Display player data
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
      const formattedDate = formatDate(entry.Date);
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${entry['Target Value']}</td>
        <td>${Math.round(entry.Rank)}</td>
        <td><span class="${entry.Hit === 1 ? 'hit' : 'miss'}">${entry.Hit === 1 ? 'Hit' : 'Miss'}</span></td>
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
  elements.successRateByTarget.innerHTML = '';
  elements.avgRankSection.innerHTML = '';
  
  let sortedData = [...playerData];
  sortedData.sort(sortByDateDescending);
  
  const targetValueMap = new Map();
  playerData.forEach(entry => {
    const targetValue = entry['Target Value'];
    if (!targetValueMap.has(targetValue)) {
      targetValueMap.set(targetValue, { total: 0, hits: 0 });
    }
    const stats = targetValueMap.get(targetValue);
    stats.total += 1;
    stats.hits += entry.Hit;
  });
  
  if (targetValueMap.size > 0) {
    const targetHeader = document.createElement('h3');
    targetHeader.textContent = 'Success Rate by Target Value';
    elements.successRateByTarget.appendChild(targetHeader);
    const targetTable = document.createElement('table');
    targetTable.classList.add('stats-table');
    const tableHeader = document.createElement('tr');
    tableHeader.innerHTML = '<th>Target</th><th>Success Rate</th><th>Record</th>';
    targetTable.appendChild(tableHeader);
    
    const sortedTargets = Array.from(targetValueMap.keys()).sort((a, b) => a - b);
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
  
  const calculateAvgRank = (data) => {
    if (data.length === 0) return 0;
    const totalRank = data.reduce((sum, entry) => sum + entry.Rank, 0);
    return totalRank / data.length;
  };
  
  const overallAvgRank = calculateAvgRank(sortedData);
  const last5AvgRank = calculateAvgRank(sortedData.slice(0, Math.min(5, sortedData.length)));
  const last10AvgRank = calculateAvgRank(sortedData.slice(0, Math.min(10, sortedData.length)));
  
  const rankHeader = document.createElement('h3');
  rankHeader.textContent = 'Average Rank';
  elements.avgRankSection.appendChild(rankHeader);
  const rankTable = document.createElement('table');
  rankTable.classList.add('stats-table');
  const rankTableHeader = document.createElement('tr');
  rankTableHeader.innerHTML = '<th>Period</th><th>Avg. Rank</th>';
  rankTable.appendChild(rankTableHeader);
  
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
    case 'PTS': return 'Points';
    case 'REB': return 'Rebounds';
    case 'AST': return 'Assists';
    case 'TPM': return 'Three Pointers Made';
    default: return category;
  }
}

// Format date from M-D-YY or MM/DD/YYYY to a more readable format
function formatDate(dateString) {
  if (!dateString) return '';
  
  const [year, month, day] = getDateParts(dateString);
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
    hours = hours ? hours : 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return date.toString();
  }
}
