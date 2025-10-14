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
    { name: 'Akron vs Ball State', teams: ['Akron', 'Ball State'] },
    { name: 'Air Force vs Wyoming', teams: ['Air Force', 'Wyoming'] },
    { name: 'Alabama vs Tennessee', teams: ['Alabama', 'Tennessee'] },
    { name: 'Appalachian State vs Coastal Carolina', teams: ['Appalachian State', 'Coastal Carolina'] },
    { name: 'Army vs Tulane', teams: ['Army', 'Tulane'] },
    { name: 'Baylor vs TCU', teams: ['Baylor', 'TCU'] },
    { name: 'Boise State vs UNLV', teams: ['Boise State', 'UNLV'] },
    { name: 'Boston College vs UConn', teams: ['Boston College', 'UConn'] },
    { name: 'Bowling Green vs Central Michigan', teams: ['Bowling Green', 'Central Michigan'] },
    { name: 'BYU vs Utah', teams: ['BYU', 'Utah'] },
    { name: 'Buffalo vs Massachusetts', teams: ['Buffalo', 'Massachusetts'] },
    { name: 'California vs North Carolina', teams: ['California', 'North Carolina'] },
    { name: 'Cincinnati vs Oklahoma State', teams: ['Cincinnati', 'Oklahoma State'] },
    { name: 'Duke vs Georgia Tech', teams: ['Duke', 'Georgia Tech'] },
    { name: 'East Carolina vs Tulsa', teams: ['East Carolina', 'Tulsa'] },
    { name: 'Florida International vs Western Kentucky', teams: ['Florida International', 'Western Kentucky'] },
    { name: 'Florida State vs Stanford', teams: ['Florida State', 'Stanford'] },
    { name: 'Florida vs Mississippi State', teams: ['Florida', 'Mississippi State'] },
    { name: 'Georgia State vs Georgia Southern', teams: ['Georgia State', 'Georgia Southern'] },
    { name: 'Hawaii vs Colorado State', teams: ['Hawaii', 'Colorado State'] },
    { name: 'Houston vs Arizona', teams: ['Houston', 'Arizona'] },
    { name: 'Indiana vs Michigan State', teams: ['Indiana', 'Michigan State'] },
    { name: 'Iowa vs Penn State', teams: ['Iowa', 'Penn State'] },
    { name: 'Jacksonville State vs Delaware', teams: ['Jacksonville State', 'Delaware'] },
    { name: 'LSU vs Vanderbilt', teams: ['LSU', 'Vanderbilt'] },
    { name: 'Liberty vs New Mexico State', teams: ['Liberty', 'New Mexico State'] },
    { name: 'Maryland vs UCLA', teams: ['Maryland', 'UCLA'] },
    { name: 'Memphis vs UAB', teams: ['Memphis', 'UAB'] },
    { name: 'Miami (OH) vs Eastern Michigan', teams: ['Miami (OH)', 'Eastern Michigan'] },
    { name: 'Miami vs Louisville', teams: ['Miami', 'Louisville'] },
    { name: 'Michigan vs Washington', teams: ['Michigan', 'Washington'] },
    { name: 'Mississippi vs Georgia', teams: ['Mississippi', 'Georgia'] },
    { name: 'Missouri vs Auburn', teams: ['Missouri', 'Auburn'] },
    { name: 'Nebraska vs Minnesota', teams: ['Nebraska', 'Minnesota'] },
    { name: 'New Mexico vs Nevada', teams: ['New Mexico', 'Nevada'] },
    { name: 'North Texas vs UTSA', teams: ['North Texas', 'UTSA'] },
    { name: 'Northwestern vs Purdue', teams: ['Northwestern', 'Purdue'] },
    { name: 'Notre Dame vs USC', teams: ['Notre Dame', 'USC'] },
    { name: 'Ohio State vs Wisconsin', teams: ['Ohio State', 'Wisconsin'] },
    { name: 'Oklahoma vs South Carolina', teams: ['Oklahoma', 'South Carolina'] },
    { name: 'Old Dominion vs James Madison', teams: ['Old Dominion', 'James Madison'] },
    { name: 'Oregon State vs Lafayette', teams: ['Oregon State', 'Lafayette'] },
    { name: 'Pittsburgh vs Syracuse', teams: ['Pittsburgh', 'Syracuse'] },
    { name: 'Rutgers vs Oregon', teams: ['Rutgers', 'Oregon'] },
    { name: 'SMU vs Clemson', teams: ['SMU', 'Clemson'] },
    { name: 'Sam Houston vs UTEP', teams: ['Sam Houston', 'UTEP'] },
    { name: 'San Jose State vs Utah State', teams: ['San Jose State', 'Utah State'] },
    { name: 'South Alabama vs Arkansas State', teams: ['South Alabama', 'Arkansas State'] },
    { name: 'Southern Miss vs Louisiana-Lafayette', teams: ['Southern Miss', 'Louisiana-Lafayette'] },
    { name: 'Temple vs UNC Charlotte', teams: ['Temple', 'UNC Charlotte'] },
    { name: 'Texas A&M vs Arkansas', teams: ['Texas A&M', 'Arkansas'] },
    { name: 'Texas State vs Marshall', teams: ['Texas State', 'Marshall'] },
    { name: 'Texas Tech vs Arizona State', teams: ['Texas Tech', 'Arizona State'] },
    { name: 'Texas vs Kentucky', teams: ['Texas', 'Kentucky'] },
    { name: 'Toledo vs Kent State', teams: ['Toledo', 'Kent State'] },
    { name: 'Troy vs Louisiana-Monroe', teams: ['Troy', 'Louisiana-Monroe'] },
    { name: 'Virginia vs Washington State', teams: ['Virginia', 'Washington State'] },
    { name: 'West Virginia vs Central Florida', teams: ['West Virginia', 'Central Florida'] }
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

        // CORRECTED LOGIC: Check if both values are strings before converting
        if (typeof valA === 'string' && typeof valB === 'string') {
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
