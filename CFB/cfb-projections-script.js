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
    { name: 'Air Force vs San Jose State', teams: ['AF', 'Air Force', 'SJSU', 'San Jose State'] },
    { name: 'Akron vs Massachusetts', teams: ['Akron', 'Massachusetts', 'UMass'] },
    { name: 'Alabama vs LSU', teams: ['Alabama', 'BAMA', 'LSU'] },
    { name: 'Appalachian State vs Georgia Southern', teams: ['App', 'Appalachian State', 'GaSo', 'Georgia Southern'] },
    { name: 'Arizona vs Kansas', teams: ['Ari', 'Arizona', 'KU', 'Kansas'] },
    { name: 'Arkansas State vs Southern Miss', teams: ['ArkSt', 'Arkansas State', 'SouMis', 'Southern Miss'] },
    { name: 'Army vs Temple', teams: ['Army', 'TEM', 'Temple'] },
    { name: 'Auburn vs Vanderbilt', teams: ['Auburn', 'Vanderbilt', 'Vandy'] },
    { name: 'BYU vs Texas Tech', teams: ['BYU', 'TTU', 'Texas Tech'] },
    { name: 'Ball State vs Kent', teams: ['Ball State', 'BallSt', 'Kent', 'KentSt'] },
    { name: 'Boston College vs SMU', teams: ['BC', 'Boston College', 'SMU'] },
    { name: 'Bowling Green vs Eastern Michigan', teams: ['BGSU', 'Bowling Green', 'EastMi', 'Eastern Michigan'] },
    { name: 'California vs Louisville', teams: ['Cal', 'California', 'Lou', 'Louisville'] },
    { name: 'Central Florida vs Houston', teams: ['Central Florida', 'Hou', 'Houston', 'UCF'] },
    { name: 'Clemson vs Florida State', teams: ['Clem', 'Clemson', 'FSU', 'Florida State'] },
    { name: 'Coastal Carolina vs Georgia State', teams: ['CoastC', 'Coastal Carolina', 'GaSt', 'Georgia State'] },
    { name: 'Colorado vs West Virginia', teams: ['CU', 'Colorado', 'WVU', 'West Virginia'] },
    { name: 'Colorado State vs UNLV', teams: ['CSU', 'Colorado State', 'UNLV'] },
    { name: 'Delaware vs Louisiana Tech', teams: ['Del', 'Delaware', 'LaTech', 'Louisiana Tech'] },
    { name: 'Duke vs UConn', teams: ['Duke', 'UConn'] },
    { name: 'East Carolina vs UNC Charlotte', teams: ['Char', 'ECU', 'East Carolina', 'UNC Charlotte'] },
    { name: 'Florida vs Kentucky', teams: ['Fla', 'Florida', 'Kentucky', 'UK'] },
    { name: 'Florida Atlantic vs Tulsa', teams: ['FlaAtl', 'Florida Atlantic', 'TLSA', 'Tulsa'] },
    { name: 'Florida International vs Middle Tenn. St', teams: ['FIU', 'Florida International', 'MiddTn', 'Middle Tenn. St'] },
    { name: 'Georgia vs Mississippi State', teams: ['Georgia', 'MSST', 'Mississippi State', 'UGa'] },
    { name: 'Hawaii vs San Diego State', teams: ['Hawaii', 'SDSU', 'San Diego State'] },
    { name: 'Indiana vs Penn State', teams: ['IU', 'Indiana', 'PSU', 'Penn State'] },
    { name: 'Iowa vs Oregon', teams: ['Iowa', 'ORE', 'Oregon'] },
    { name: 'Iowa State vs TCU', teams: ['IaSt', 'Iowa State', 'TCU'] },
    { name: 'Jacksonville State vs UTEP', teams: ['JacSt', 'Jacksonville State', 'UTEP'] },
    { name: 'James Madison vs Marshall', teams: ['JMU', 'James Madison', 'Marsh', 'Marshall'] },
    { name: 'Kennesaw State vs New Mexico State', teams: ['KennSt', 'Kennesaw State', 'NMSt', 'New Mexico State'] },
    { name: 'Liberty vs Missouri State', teams: ['Lib', 'Liberty', 'Missouri State', 'MoStU'] },
    { name: 'Louisiana-Lafayette vs Texas State', teams: ['Louisiana-Lafayette', 'Texas State', 'TxSt', 'UL-Laf'] },
    { name: 'Maryland vs Rutgers', teams: ['MD', 'Maryland', 'Rut', 'Rutgers'] },
    { name: 'Memphis vs Tulane', teams: ['Mem', 'Memphis', 'TULN', 'Tulane'] },
    { name: 'Miami vs Syracuse', teams: ['MIA-FL', 'Miami', 'Syr', 'Syracuse'] },
    { name: 'Miami (OH) vs Ohio', teams: ['MIA-OH', 'Miami (OH)', 'Ohio'] },
    { name: 'Mississippi vs The Citadel', teams: ['Cit', 'Miss', 'Mississippi', 'The Citadel'] },
    { name: 'Missouri vs Texas A&M', teams: ['MIZZOU', 'Missouri', 'TexA&M', 'Texas A&M'] },
    { name: 'Navy vs Notre Dame', teams: ['ND', 'Navy', 'Notre Dame'] },
    { name: 'Nebraska vs UCLA', teams: ['Neb', 'Nebraska', 'UCLA'] },
    { name: 'Nevada vs Utah State', teams: ['Nevada', 'USU', 'Utah State'] },
    { name: 'North Carolina vs Stanford', teams: ['North Carolina', 'Stan', 'Stanford', 'UNC'] },
    { name: 'Northern Illinois vs Toledo', teams: ['NIU', 'Northern Illinois', 'TOL', 'Toledo'] },
    { name: 'Northwestern vs USC', teams: ['NW', 'Northwestern', 'USC'] },
    { name: 'Ohio State vs Purdue', teams: ['Ohio State', 'OhioSt', 'PUR', 'Purdue'] },
    { name: 'Oregon State vs Sam Houston', teams: ['ORST', 'Oregon State', 'Sam Houston', 'SamHou'] },
    { name: 'Rice vs UAB', teams: ['Rice', 'UAB'] },
    { name: 'South Florida vs UTSA', teams: ['South Florida', 'Tx-SA', 'USF', 'UTSA'] },
    { name: 'Virginia vs Wake Forest', teams: ['UVa', 'Virginia', 'Wake', 'Wake Forest'] },
    { name: 'Washington vs Wisconsin', teams: ['UW', 'Washington', 'Wisc', 'Wisconsin'] }
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
