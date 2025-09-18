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
    { name: 'Akron vs Duquesne', teams: ['Akron', 'Duquesne'] },
    { name: 'Air Force vs Boise State', teams: ['Air Force', 'Boise State'] },
    { name: 'Arizona State vs Baylor', teams: ['Arizona State', 'Baylor'] },
    { name: 'Arkansas vs Memphis', teams: ['Arkansas', 'Memphis'] },
    { name: 'Arkansas State vs Kennesaw State', teams: ['Arkansas State', 'Kennesaw State'] },
    { name: 'Army vs North Texas', teams: ['Army', 'North Texas'] },
    { name: 'Auburn vs Oklahoma', teams: ['Auburn', 'Oklahoma'] },
    { name: 'Ball State vs UConn', teams: ['Ball State', 'UConn'] },
    { name: 'BYU vs East Carolina', teams: ['BYU', 'East Carolina'] },
    { name: 'California vs San Diego State', teams: ['California', 'San Diego State'] },
    { name: 'Central Florida vs North Carolina', teams: ['Central Florida', 'North Carolina'] },
    { name: 'Clemson vs Syracuse', teams: ['Clemson', 'Syracuse'] },
    { name: 'Coastal Carolina vs South Alabama', teams: ['Coastal Carolina', 'South Alabama'] },
    { name: 'Colorado vs Wyoming', teams: ['Colorado', 'Wyoming'] },
    { name: 'Colorado State vs UTSA', teams: ['Colorado State', 'UTSA'] },
    { name: 'Duke vs North Carolina State', teams: ['Duke', 'North Carolina State'] },
    { name: 'Eastern Michigan vs Louisiana-Lafayette', teams: ['Eastern Michigan', 'Louisiana-Lafayette'] },
    { name: 'Florida vs Miami', teams: ['Florida', 'Miami'] },
    { name: 'Florida International vs Delaware', teams: ['Florida International', 'Delaware'] },
    { name: 'Florida State vs Kent State', teams: ['Florida State', 'Kent State'] },
    { name: 'Fresno State vs Hawaii', teams: ['Fresno State', 'Hawaii'] },
    { name: 'Georgia State vs Vanderbilt', teams: ['Georgia State', 'Vanderbilt'] },
    { name: 'Georgia Tech vs Temple', teams: ['Georgia Tech', 'Temple'] },
    { name: 'Illinois vs Indiana', teams: ['Illinois', 'Indiana'] },
    { name: 'Iowa vs Rutgers', teams: ['Iowa', 'Rutgers'] },
    { name: 'Jacksonville State vs Murray State', teams: ['Jacksonville State', 'Murray State'] },
    { name: 'James Madison vs Liberty', teams: ['James Madison', 'Liberty'] },
    { name: 'Kansas vs West Virginia', teams: ['Kansas', 'West Virginia'] },
    { name: 'Louisville vs Bowling Green', teams: ['Louisville', 'Bowling Green'] },
    { name: 'LSU vs Southeastern Louisiana', teams: ['LSU', 'Southeastern Louisiana'] },
    { name: 'Marshall vs Middle Tenn. St', teams: ['Marshall', 'Middle Tenn. St'] },
    { name: 'Maryland vs Wisconsin', teams: ['Maryland', 'Wisconsin'] },
    { name: 'Michigan vs Nebraska', teams: ['Michigan', 'Nebraska'] },
    { name: 'Michigan State vs USC', teams: ['Michigan State', 'USC'] },
    { name: 'Mississippi vs Tulane', teams: ['Mississippi', 'Tulane'] },
    { name: 'Mississippi State vs Northern Illinois', teams: ['Mississippi State', 'Northern Illinois'] },
    { name: 'Missouri vs South Carolina', teams: ['Missouri', 'South Carolina'] },
    { name: 'Missouri State vs Tennessee-Martin', teams: ['Missouri State', 'Tennessee-Martin'] },
    { name: 'Nevada vs Western Kentucky', teams: ['Nevada', 'Western Kentucky'] },
    { name: 'Notre Dame vs Purdue', teams: ['Notre Dame', 'Purdue'] },
    { name: 'Ohio vs Gardner-Webb', teams: ['Ohio', 'Gardner-Webb'] },
    { name: 'Oklahoma State vs Tulsa', teams: ['Oklahoma State', 'Tulsa'] },
    { name: 'Oregon vs Oregon State', teams: ['Oregon', 'Oregon State'] },
    { name: 'Rice vs UNC Charlotte', teams: ['Rice', 'UNC Charlotte'] },
    { name: 'San Jose State vs Idaho', teams: ['San Jose State', 'Idaho'] },
    { name: 'SMU vs TCU', teams: ['SMU', 'TCU'] },
    { name: 'South Florida vs South Carolina State', teams: ['South Florida', 'South Carolina State'] },
    { name: 'Southern Miss vs Louisiana Tech', teams: ['Southern Miss', 'Louisiana Tech'] },
    { name: 'Stanford vs Virginia', teams: ['Stanford', 'Virginia'] },
    { name: 'Tennessee vs UAB', teams: ['Tennessee', 'UAB'] },
    { name: 'Texas vs Sam Houston', teams: ['Texas', 'Sam Houston'] },
    { name: 'Texas State vs Nicholls State', teams: ['Texas State', 'Nicholls State'] },
    { name: 'Texas Tech vs Utah', teams: ['Texas Tech', 'Utah'] },
    { name: 'Toledo vs Western Michigan', teams: ['Toledo', 'Western Michigan'] },
    { name: 'UNLV vs Miami (OH)', teams: ['UNLV', 'Miami (OH)'] },
    { name: 'UTEP vs Louisiana-Monroe', teams: ['UTEP', 'Louisiana-Monroe'] },
    { name: 'Utah State vs McNeese State', teams: ['Utah State', 'McNeese State'] },
    { name: 'Virginia Tech vs Wofford', teams: ['Virginia Tech', 'Wofford'] },
    { name: 'Washington vs Washington State', teams: ['Washington', 'Washington State'] }
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
