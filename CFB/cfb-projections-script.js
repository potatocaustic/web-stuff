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
    { name: 'Air Force vs Navy', teams: ['Air Force', 'Navy'] },
    { name: 'Akron vs Central Michigan', teams: ['Akron', 'Central Michigan'] },
    { name: 'Alabama vs Vanderbilt', teams: ['Alabama', 'Vanderbilt'] },
    { name: 'Appalachian State vs Oregon State', teams: ['Appalachian State', 'Oregon State'] },
    { name: 'Arizona vs Oklahoma State', teams: ['Arizona', 'Oklahoma State'] },
    { name: 'Arkansas State vs Texas State', teams: ['Arkansas State', 'Texas State'] },
    { name: 'Army vs UAB', teams: ['Army', 'UAB'] },
    { name: 'BYU vs West Virginia', teams: ['BYU', 'West Virginia'] },
    { name: 'Ball State vs Ohio', teams: ['Ball State', 'Ohio'] },
    { name: 'Baylor vs Kansas State', teams: ['Baylor', 'Kansas State'] },
    { name: 'Boise State vs Notre Dame', teams: ['Boise State', 'Notre Dame'] },
    { name: 'Boston College vs Pittsburgh', teams: ['Boston College', 'Pittsburgh'] },
    { name: 'Buffalo vs Eastern Michigan', teams: ['Buffalo', 'Eastern Michigan'] },
    { name: 'California vs Duke', teams: ['California', 'Duke'] },
    { name: 'Campbell vs North Carolina State', teams: ['Campbell', 'North Carolina State'] },
    { name: 'Central Florida vs Kansas', teams: ['Central Florida', 'Kansas'] },
    { name: 'Cincinnati vs Iowa State', teams: ['Cincinnati', 'Iowa State'] },
    { name: 'Clemson vs North Carolina', teams: ['Clemson', 'North Carolina'] },
    { name: 'Coastal Carolina vs Old Dominion', teams: ['Coastal Carolina', 'Old Dominion'] },
    { name: 'Colorado State vs San Diego State', teams: ['Colorado State', 'San Diego State'] },
    { name: 'Colorado vs TCU', teams: ['Colorado', 'TCU'] },
    { name: 'Delaware vs Western Kentucky', teams: ['Delaware', 'Western Kentucky'] },
    { name: 'Florida Atlantic vs Rice', teams: ['Florida Atlantic', 'Rice'] },
    { name: 'Florida State vs Miami', teams: ['Florida State', 'Miami'] },
    { name: 'Florida vs Texas', teams: ['Florida', 'Texas'] },
    { name: 'Fresno State vs Nevada', teams: ['Fresno State', 'Nevada'] },
    { name: 'Georgia State vs James Madison', teams: ['Georgia State', 'James Madison'] },
    { name: 'Georgia vs Kentucky', teams: ['Georgia', 'Kentucky'] },
    { name: 'Houston vs Texas Tech', teams: ['Houston', 'Texas Tech'] },
    { name: 'Illinois vs Purdue', teams: ['Illinois', 'Purdue'] },
    { name: 'Kent State vs Oklahoma', teams: ['Kent State', 'Oklahoma'] },
    { name: 'Louisiana-Monroe vs Northwestern', teams: ['Louisiana-Monroe', 'Northwestern'] },
    { name: 'Louisville vs Virginia', teams: ['Louisville', 'Virginia'] },
    { name: 'Maryland vs Washington', teams: ['Maryland', 'Washington'] },
    { name: 'Massachusetts vs Western Michigan', teams: ['Massachusetts', 'Western Michigan'] },
    { name: 'Memphis vs Tulsa', teams: ['Memphis', 'Tulsa'] },
    { name: 'Miami (OH) vs Northern Illinois', teams: ['Miami (OH)', 'Northern Illinois'] },
    { name: 'Michigan State vs Nebraska', teams: ['Michigan State', 'Nebraska'] },
    { name: 'Michigan vs Wisconsin', teams: ['Michigan', 'Wisconsin'] },
    { name: 'Minnesota vs Ohio State', teams: ['Minnesota', 'Ohio State'] },
    { name: 'Mississippi State vs Texas A&M', teams: ['Mississippi State', 'Texas A&M'] },
    { name: 'New Mexico State vs Sam Houston', teams: ['New Mexico State', 'Sam Houston'] },
    { name: 'New Mexico vs San Jose State', teams: ['New Mexico', 'San Jose State'] },
    { name: 'Penn State vs UCLA', teams: ['Penn State', 'UCLA'] },
    { name: 'SMU vs Syracuse', teams: ['SMU', 'Syracuse'] },
    { name: 'South Alabama vs Troy', teams: ['South Alabama', 'Troy'] },
    { name: 'South Florida vs UNC Charlotte', teams: ['South Florida', 'UNC Charlotte'] },
    { name: 'Temple vs UTSA', teams: ['Temple', 'UTSA'] },
    { name: 'UConn vs Florida International', teams: ['UConn', 'Florida International'] },
    { name: 'UNLV vs Wyoming', teams: ['UNLV', 'Wyoming'] },
    { name: 'Virginia Tech vs Wake Forest', teams: ['Virginia Tech', 'Wake Forest'] }
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
