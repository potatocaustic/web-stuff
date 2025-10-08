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
    { name: 'Air Force vs UNLV', teams: ['Air Force', 'UNLV'] },
    { name: 'Akron vs Miami (OH)', teams: ['Akron', 'Miami (OH)'] },
    { name: 'Alabama vs Missouri', teams: ['Alabama', 'Missouri'] },
    { name: 'Appalachian State vs Georgia State', teams: ['Appalachian State', 'Georgia State'] },
    { name: 'Arizona vs BYU', teams: ['Arizona', 'BYU'] },
    { name: 'Arizona State vs Utah', teams: ['Arizona State', 'Utah'] },
    { name: 'Arkansas vs Tennessee', teams: ['Arkansas', 'Tennessee'] },
    { name: 'Army vs UNC Charlotte', teams: ['Army', 'UNC Charlotte'] },
    { name: 'Auburn vs Georgia', teams: ['Auburn', 'Georgia'] },
    { name: 'Ball State vs Western Michigan', teams: ['Ball State', 'Western Michigan'] },
    { name: 'Boise State vs New Mexico', teams: ['Boise State', 'New Mexico'] },
    { name: 'Boston College vs Clemson', teams: ['Boston College', 'Clemson'] },
    { name: 'Bowling Green vs Toledo', teams: ['Bowling Green', 'Toledo'] },
    { name: 'Central Florida vs Cincinnati', teams: ['Central Florida', 'Cincinnati'] },
    { name: 'Coastal Carolina vs Louisiana-Monroe', teams: ['Coastal Carolina', 'Louisiana-Monroe'] },
    { name: 'Colorado State vs Fresno State', teams: ['Colorado State', 'Fresno State'] },
    { name: 'Colorado vs Iowa State', teams: ['Colorado', 'Iowa State'] },
    { name: 'East Carolina vs Tulane', teams: ['East Carolina', 'Tulane'] },
    { name: 'Eastern Michigan vs Northern Illinois', teams: ['Eastern Michigan', 'Northern Illinois'] },
    { name: 'Florida Atlantic vs UAB', teams: ['Florida Atlantic', 'UAB'] },
    { name: 'Florida State vs Pittsburgh', teams: ['Florida State', 'Pittsburgh'] },
    { name: 'Florida vs Texas A&M', teams: ['Florida', 'Texas A&M'] },
    { name: 'Georgia Southern vs Southern Miss', teams: ['Georgia Southern', 'Southern Miss'] },
    { name: 'Georgia Tech vs Virginia Tech', teams: ['Georgia Tech', 'Virginia Tech'] },
    { name: 'Hawaii vs Utah State', teams: ['Hawaii', 'Utah State'] },
    { name: 'Houston vs Oklahoma State', teams: ['Houston', 'Oklahoma State'] },
    { name: 'Illinois vs Ohio State', teams: ['Illinois', 'Ohio State'] },
    { name: 'Indiana vs Oregon', teams: ['Indiana', 'Oregon'] },
    { name: 'Iowa vs Wisconsin', teams: ['Iowa', 'Wisconsin'] },
    { name: 'Jacksonville State vs Sam Houston', teams: ['Jacksonville State', 'Sam Houston'] },
    { name: 'James Madison vs Louisiana-Lafayette', teams: ['James Madison', 'Louisiana-Lafayette'] },
    { name: 'Kansas State vs TCU', teams: ['Kansas State', 'TCU'] },
    { name: 'Kansas vs Texas Tech', teams: ['Kansas', 'Texas Tech'] },
    { name: 'Kennesaw State vs Louisiana Tech', teams: ['Kennesaw State', 'Louisiana Tech'] },
    { name: 'Kent State vs Massachusetts', teams: ['Kent State', 'Massachusetts'] },
    { name: 'LSU vs South Carolina', teams: ['LSU', 'South Carolina'] },
    { name: 'Liberty vs UTEP', teams: ['Liberty', 'UTEP'] },
    { name: 'Marshall vs Old Dominion', teams: ['Marshall', 'Old Dominion'] },
    { name: 'Maryland vs Nebraska', teams: ['Maryland', 'Nebraska'] },
    { name: 'Michigan State vs UCLA', teams: ['Michigan State', 'UCLA'] },
    { name: 'Michigan vs USC', teams: ['Michigan', 'USC'] },
    { name: 'Middle Tenn. St vs Missouri State', teams: ['Middle Tenn. St', 'Missouri State'] },
    { name: 'Minnesota vs Purdue', teams: ['Minnesota', 'Purdue'] },
    { name: 'Mississippi vs Washington State', teams: ['Mississippi', 'Washington State'] },
    { name: 'Navy vs Temple', teams: ['Navy', 'Temple'] },
    { name: 'Nevada vs San Diego State', teams: ['Nevada', 'San Diego State'] },
    { name: 'North Carolina State vs Notre Dame', teams: ['North Carolina State', 'Notre Dame'] },
    { name: 'North Texas vs South Florida', teams: ['North Texas', 'South Florida'] },
    { name: 'Northwestern vs Penn State', teams: ['Northwestern', 'Penn State'] },
    { name: 'Oklahoma vs Texas', teams: ['Oklahoma', 'Texas'] },
    { name: 'Oregon State vs Wake Forest', teams: ['Oregon State', 'Wake Forest'] },
    { name: 'Rice vs UTSA', teams: ['Rice', 'UTSA'] },
    { name: 'Rutgers vs Washington', teams: ['Rutgers', 'Washington'] },
    { name: 'SMU vs Stanford', teams: ['SMU', 'Stanford'] },
    { name: 'San Jose State vs Wyoming', teams: ['San Jose State', 'Wyoming'] }
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
