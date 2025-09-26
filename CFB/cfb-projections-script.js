// Global variables
let allData = {
  qb: [],
  nonQb: []
};
let currentPosition = 'nonQb'; // Default position group
let filteredDataCache = []; // Cache for sorting
// CHANGED: Set the initial sort state to Total Yards for the default Non-QB view
let sortState = {
    key: 'RushRecYds',
    direction: 'desc'
};

// Configuration
const CONFIG = {
  GOOGLE_SHEET_URLS: {
    qb: 'https://docs.google.com/spreadsheets/d/1fXYQXnPAe8uABQKJ9LiGJWRNdfAM-W3EPrUsZdOAgiE/export?format=csv',
    nonQb: 'https://docs.google.com/spreadsheets/d/1L4H9R1kWcEBbxM9TTJcd5x6wdx_rhAJKQciLEUnk14M/export?format=csv'
  },
  GAMES: [
    { name: 'Akron vs Toledo', teams: ['Akron', 'Toledo'] },
    { name: 'Air Force vs Hawaii', teams: ['Air Force', 'Hawaii'] },
    { name: 'Alabama vs Georgia', teams: ['Alabama', 'Georgia'] },
    { name: 'Appalachian State vs Boise State', teams: ['Appalachian State', 'Boise State'] },
    { name: 'Arizona vs Iowa State', teams: ['Arizona', 'Iowa State'] },
    { name: 'Arizona State vs TCU', teams: ['Arizona State', 'TCU'] },
    { name: 'Arkansas vs Notre Dame', teams: ['Arkansas', 'Notre Dame'] },
    { name: 'Arkansas State vs Louisiana-Monroe', teams: ['Arkansas State', 'Louisiana-Monroe'] },
    { name: 'Army vs East Carolina', teams: ['Army', 'East Carolina'] },
    { name: 'Auburn vs Texas A&M', teams: ['Auburn', 'Texas A&M'] },
    { name: 'Baylor vs Oklahoma State', teams: ['Baylor', 'Oklahoma State'] },
    { name: 'Boston College vs California', teams: ['Boston College', 'California'] },
    { name: 'BYU vs Colorado', teams: ['BYU', 'Colorado'] },
    { name: 'Central Florida vs Kansas State', teams: ['Central Florida', 'Kansas State'] },
    { name: 'Central Michigan vs Eastern Michigan', teams: ['Central Michigan', 'Eastern Michigan'] },
    { name: 'Cincinnati vs Kansas', teams: ['Cincinnati', 'Kansas'] },
    { name: 'Colorado State vs Washington State', teams: ['Colorado State', 'Washington State'] },
    { name: 'Duke vs Syracuse', teams: ['Duke', 'Syracuse'] },
    { name: 'Florida Atlantic vs Memphis', teams: ['Florida Atlantic', 'Memphis'] },
    { name: 'Florida State vs Virginia', teams: ['Florida State', 'Virginia'] },
    { name: 'Georgia Tech vs Wake Forest', teams: ['Georgia Tech', 'Wake Forest'] },
    { name: 'Houston vs Oregon State', teams: ['Houston', 'Oregon State'] },
    { name: 'Illinois vs USC', teams: ['Illinois', 'USC'] },
    { name: 'Indiana vs Iowa', teams: ['Indiana', 'Iowa'] },
    { name: 'James Madison vs Georgia Southern', teams: ['James Madison', 'Georgia Southern'] },
    { name: 'Kentucky vs South Carolina', teams: ['Kentucky', 'South Carolina'] },
    { name: 'Liberty vs Old Dominion', teams: ['Liberty', 'Old Dominion'] },
    { name: 'Louisiana Tech vs UTEP', teams: ['Louisiana Tech', 'UTEP'] },
    { name: 'Louisiana-Lafayette vs Marshall', teams: ['Louisiana-Lafayette', 'Marshall'] },
    { name: 'Louisville vs Pittsburgh', teams: ['Louisville', 'Pittsburgh'] },
    { name: 'Massachusetts vs Missouri', teams: ['Massachusetts', 'Missouri'] },
    { name: 'Miami (OH) vs Lindenwood', teams: ['Miami (OH)', 'Lindenwood'] },
    { name: 'Middle Tenn. St vs Kennesaw State', teams: ['Middle Tenn. St', 'Kennesaw State'] },
    { name: 'Minnesota vs Rutgers', teams: ['Minnesota', 'Rutgers'] },
    { name: 'Mississippi vs LSU', teams: ['Mississippi', 'LSU'] },
    { name: 'Mississippi State vs Tennessee', teams: ['Mississippi State', 'Tennessee'] },
    { name: 'Navy vs Rice', teams: ['Navy', 'Rice'] },
    { name: 'New Mexico vs New Mexico State', teams: ['New Mexico', 'New Mexico State'] },
    { name: 'North Carolina State vs Virginia Tech', teams: ['North Carolina State', 'Virginia Tech'] },
    { name: 'North Texas vs South Alabama', teams: ['North Texas', 'South Alabama'] },
    { name: 'Northern Illinois vs San Diego State', teams: ['Northern Illinois', 'San Diego State'] },
    { name: 'Northwestern vs UCLA', teams: ['Northwestern', 'UCLA'] },
    { name: 'Ohio vs Bowling Green', teams: ['Ohio', 'Bowling Green'] },
    { name: 'Ohio State vs Washington', teams: ['Ohio State', 'Washington'] },
    { name: 'Oregon vs Penn State', teams: ['Oregon', 'Penn State'] },
    { name: 'San Jose State vs Stanford', teams: ['San Jose State', 'Stanford'] },
    { name: 'Southern Miss vs Jacksonville State', teams: ['Southern Miss', 'Jacksonville State'] },
    { name: 'Tulane vs Tulsa', teams: ['Tulane', 'Tulsa'] },
    { name: 'UConn vs Buffalo', teams: ['UConn', 'Buffalo'] },
    { name: 'Utah vs West Virginia', teams: ['Utah', 'West Virginia'] },
    { name: 'Utah State vs Vanderbilt', teams: ['Utah State', 'Vanderbilt'] },
    { name: 'Western Kentucky vs Missouri State', teams: ['Western Kentucky', 'Missouri State'] },
    { name: 'Western Michigan vs Rhode Island', teams: ['Western Michigan', 'Rhode Island'] }
  ]
};

// DOM elements
const elements = {
  gameSelector: document.getElementById('gameSelector'),
  qbButton: document.getElementById('qbButton'),
  nonQbButton: document.getElementById('nonQbButton'),
  resultsTitle: document.getElementById('resultsTitle'),
  projectionsTableHeader: document.getElementById('projectionsTableHeader'),
  projectionsTableBody: document.getElementById('projectionsTableBody'),
  noResultsMessage: document.getElementById('noResultsMessage'),
  lastUpdated: document.getElementById('last-updated'),
  menuToggle: document.getElementById('menu-toggle'),
  navMenu: document.getElementById('nav-menu')
};

// Event listeners
document.addEventListener('DOMContentLoaded', init);

/**
 * Initializes the application
 */
async function init() {
  // Set up event listeners
  elements.qbButton.addEventListener('click', () => switchPosition('qb'));
  elements.nonQbButton.addEventListener('click', () => switchPosition('nonQb'));
  elements.gameSelector.addEventListener('change', displayProjections);
  elements.menuToggle.addEventListener('click', () => elements.navMenu.classList.toggle('show-menu'));

  populateGameSelector();
  
  try {
    await Promise.all([loadData('qb'), loadData('nonQb')]);
    elements.lastUpdated.textContent = 'Projection data loaded successfully.';
    displayProjections();
  } catch (error) {
    console.error('Failed to load initial data:', error);
    elements.lastUpdated.textContent = 'Error loading data. Please try refreshing the page.';
  }
}

/**
 * Populates the game selector dropdown
 */
function populateGameSelector() {
    CONFIG.GAMES.forEach((game, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = game.name;
        elements.gameSelector.appendChild(option);
    });
}

/**
 * Loads and parses data from a Google Sheet
 * @param {string} position - The position type ('qb' or 'nonQb')
 */
async function loadData(position) {
  if (allData[position].length > 0) return;
  
  try {
    const response = await fetch(CONFIG.GOOGLE_SHEET_URLS[position]);
    const csvText = await response.text();
    const data = parseCSV(csvText);
    allData[position] = data;
    console.log(`Loaded ${data.length} entries for ${position}`);
  } catch (error) {
    console.error(`Error loading data for ${position}:`, error);
    throw error;
  }
}

/**
 * Parses CSV text into an array of JSON objects
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(header => header.trim());
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
    const entry = {};
    
    headers.forEach((header, index) => {
      if (index < values.length) {
        const isNumeric = !isNaN(parseFloat(values[index])) && isFinite(values[index]);
        entry[header] = isNumeric ? parseFloat(values[index]) : values[index];
      }
    });
    
    if (entry['Player Name']) {
        result.push(entry);
    }
  }
  return result;
}

/**
 * Switches between QB and non-QB views
 * @param {string} position - The new position to display
 */
function switchPosition(position) {
  currentPosition = position;
  elements.qbButton.classList.toggle('active', position === 'qb');
  elements.nonQbButton.classList.toggle('active', position === 'nonQb');
  
  // ADDED: Update the sortState to the desired default for the selected position
  if (position === 'qb') {
    sortState = { key: 'pYds', direction: 'desc' }; // Default sort for QBs
  } else {
    sortState = { key: 'RushRecYds', direction: 'desc' }; // Default sort for Non-QBs
  }
  
  displayProjections();
}

/**
 * Filters and displays player projections based on selections
 */
function displayProjections() {
  const selectedGameIndex = elements.gameSelector.value;

  elements.projectionsTableHeader.innerHTML = '';
  elements.projectionsTableBody.innerHTML = '';

  if (selectedGameIndex === "") {
    elements.resultsTitle.textContent = 'Select a game to view projections';
    elements.noResultsMessage.classList.remove('hidden');
    elements.projectionsTableBody.parentElement.classList.add('hidden');
    return;
  }

  const selectedGame = CONFIG.GAMES[selectedGameIndex];
  elements.resultsTitle.textContent = `${selectedGame.name} - ${currentPosition === 'qb' ? 'QB' : 'Non-QB'} Projections`;

  const data = allData[currentPosition];
  filteredDataCache = data.filter(player => selectedGame.teams.includes(player.Team));

  if (filteredDataCache.length > 0) {
    elements.noResultsMessage.classList.add('hidden');
    elements.projectionsTableBody.parentElement.classList.remove('hidden');
    sortAndRender();
  } else {
    elements.noResultsMessage.classList.remove('hidden');
    elements.noResultsMessage.textContent = `No ${currentPosition === 'qb' ? 'QB' : 'Non-QB'} data found for this game.`;
    elements.projectionsTableBody.parentElement.classList.add('hidden');
  }
}

/**
 * Sorts the cached data and renders the table
 */
function sortAndRender() {
    const { key, direction } = sortState;

    // Sorting logic
    filteredDataCache.sort((a, b) => {
        if (a[key] === undefined || a[key] === null) return 1;
        if (b[key] === undefined || b[key] === null) return -1;
        
        let valA = a[key];
        let valB = b[key];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    updateTableHeader();
    populateTable(filteredDataCache);
}


/**
 * Updates the header of the projections table and adds sort listeners
 */
function updateTableHeader() {
  elements.projectionsTableHeader.innerHTML = ''; // Clear existing header
  const headerRow = document.createElement('tr');
  let headers = [];
  const keyMap = {};

  if (currentPosition === 'nonQb') {
    headers = ['Player Name', 'Team', 'Pos', 'Total Yards', 'Total TDs', 'Receptions'];
    Object.assign(keyMap, { 'Player Name': 'Player Name', 'Team': 'Team', 'Pos': 'Pos', 'Total Yards': 'RushRecYds', 'Total TDs': 'TotalTD', 'Receptions': 'Rec' });
  } else { // 'qb'
    headers = ['Player Name', 'Team', 'Pos', 'Passing Yards', 'Passing TDs', 'Rushing Yards', 'Rushing TDs'];
    Object.assign(keyMap, { 'Player Name': 'Player Name', 'Team': 'Team', 'Pos': 'Pos', 'Passing Yards': 'pYds', 'Passing TDs': 'pTD', 'Rushing Yards': 'rYds', 'Rushing TDs': 'rTD' });
  }

  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.classList.add('sortable');
    const dataKey = keyMap[headerText];

    // Add sort indicator
    if (sortState.key === dataKey) {
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        indicator.textContent = sortState.direction === 'asc' ? ' ▲' : ' ▼';
        th.appendChild(indicator);
    }
    
    // Add click listener for sorting
    th.addEventListener('click', () => {
        if (sortState.key === dataKey) {
            sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortState.key = dataKey;
            sortState.direction = 'desc'; // CHANGED: Default to descending on new column click
        }
        sortAndRender();
    });

    headerRow.appendChild(th);
  });

  elements.projectionsTableHeader.appendChild(headerRow);
}

/**
 * Populates the table body with player data
 * @param {Array<Object>} playerData - The filtered and sorted data to display
 */
function populateTable(playerData) {
  elements.projectionsTableBody.innerHTML = ''; // Clear existing rows
  playerData.forEach(player => {
    const row = document.createElement('tr');
    
    if (currentPosition === 'nonQb') {
      row.innerHTML = `
        <td>${player['Player Name']}</td>
        <td>${player.Team}</td>
        <td>${player.Pos}</td>
        <td>${player.RushRecYds}</td>
        <td>${player.TotalTD}</td>
        <td>${player.Rec}</td>
      `;
    } else { // 'qb'
      row.innerHTML = `
        <td>${player['Player Name']}</td>
        <td>${player.Team}</td>
        <td>${player.Pos}</td>
        <td>${player['pYds']}</td>
        <td>${player['pTD']}</td>
        <td>${player['rYds']}</td>
        <td>${player['rTD']}</td>
      `;
    }
    
    elements.projectionsTableBody.appendChild(row);
  });
}
