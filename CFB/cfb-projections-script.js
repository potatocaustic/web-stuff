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
    { name: 'Air Force vs Army', teams: ['Air Force', 'Army', 'AF'] },
    { name: 'Arizona vs Colorado', teams: ['Arizona', 'Colorado', 'Ari', 'CU'] },
    { name: 'Arizona State vs Iowa State', teams: ['Arizona State', 'Iowa State', 'ASU', 'IaSt'] },
    { name: 'Arkansas vs Mississippi State', teams: ['Arkansas', 'Mississippi State', 'ARK', 'MSST'] },
    { name: 'Arkansas State vs Troy', teams: ['Arkansas State', 'Troy', 'ArkSt'] },
    { name: 'Auburn vs Kentucky', teams: ['Auburn', 'Kentucky', 'UK'] },
    { name: 'Baylor vs Central Florida', teams: ['Baylor', 'Central Florida', 'UCF'] },
    { name: 'Boise State vs Fresno State', teams: ['Boise State', 'Fresno State', 'Boise', 'Fres'] },
    { name: 'Buffalo vs Bowling Green', teams: ['Buffalo', 'Bowling Green', 'Buff', 'BGSU'] },
    { name: 'California vs Virginia', teams: ['California', 'Virginia', 'Cal', 'UVa'] },
    { name: 'Cincinnati vs Utah', teams: ['Cincinnati', 'Utah', 'CIN', 'UTAH'] },
    { name: 'Clemson vs Duke', teams: ['Clemson', 'Duke', 'Clem'] },
    { name: 'Florida vs Georgia', teams: ['Florida', 'Georgia', 'Fla', 'UGa'] },
    { name: 'Florida International vs Missouri State', teams: ['Florida International', 'Missouri State', 'FIU', 'MoStU'] },
    { name: 'Houston vs West Virginia', teams: ['Houston', 'West Virginia', 'Hou', 'WVU'] },
    { name: 'Indiana vs Maryland', teams: ['Indiana', 'Maryland', 'IU', 'MD'] },
    { name: 'Jacksonville State vs Middle Tenn. St', teams: ['Jacksonville State', 'Middle Tenn. St', 'JacSt', 'MiddTn'] },
    { name: 'Kansas vs Oklahoma State', teams: ['Kansas', 'Oklahoma State', 'KU', 'OKST'] },
    { name: 'Kennesaw State vs UTEP', teams: ['Kennesaw State', 'UTEP', 'KennSt'] },
    { name: 'Liberty vs Delaware', teams: ['Liberty', 'Delaware', 'Lib', 'Del'] },
    { name: 'Louisiana Tech vs Sam Houston', teams: ['Louisiana Tech', 'Sam Houston', 'LaTech', 'SamHou'] },
    { name: 'Louisville vs Virginia Tech', teams: ['Louisville', 'Virginia Tech', 'Lou', 'VaTech'] },
    { name: 'Marshall vs Coastal Carolina', teams: ['Marshall', 'Coastal Carolina', 'Marsh', 'CoastC'] },
    { name: 'Memphis vs Rice', teams: ['Memphis', 'Rice', 'Mem'] },
    { name: 'Miami vs SMU', teams: ['Miami', 'SMU', 'MIA-FL'] },
    { name: 'Michigan vs Purdue', teams: ['Michigan', 'Purdue', 'Mich', 'PUR'] },
    { name: 'Minnesota vs Michigan State', teams: ['Minnesota', 'Michigan State', 'Minn', 'MSU'] },
    { name: 'Mississippi vs South Carolina', teams: ['Mississippi', 'South Carolina', 'Miss', 'SCAR'] },
    { name: 'New Mexico State vs Western Kentucky', teams: ['New Mexico State', 'Western Kentucky', 'NMSt', 'WestKy'] },
    { name: 'North Carolina State vs Georgia Tech', teams: ['North Carolina State', 'Georgia Tech', 'NCSU', 'GT'] },
    { name: 'North Texas vs Navy', teams: ['North Texas', 'Navy', 'UNT'] },
    { name: 'Notre Dame vs Boston College', teams: ['Notre Dame', 'Boston College', 'ND', 'BC'] },
    { name: 'Ohio State vs Penn State', teams: ['Ohio State', 'Penn State', 'OhioSt', 'PSU'] },
    { name: 'Old Dominion vs Louisiana-Monroe', teams: ['Old Dominion', 'Louisiana-Monroe', 'ODU', 'UL-Mon'] },
    { name: 'Oregon State vs Washington State', teams: ['Oregon State', 'Washington State', 'ORST', 'WSU'] },
    { name: 'Pittsburgh vs Stanford', teams: ['Pittsburgh', 'Stanford', 'Pitt', 'Stan'] },
    { name: 'Rutgers vs Illinois', teams: ['Rutgers', 'Illinois', 'Rut', 'Ill'] },
    { name: 'San Diego State vs Wyoming', teams: ['San Diego State', 'Wyoming', 'SDSU', 'Wyo'] },
    { name: 'San Jose State vs Hawaii', teams: ['San Jose State', 'Hawaii', 'SJSU'] },
    { name: 'South Alabama vs Louisiana-Lafayette', teams: ['South Alabama', 'Louisiana-Lafayette', 'USA', 'UL-Laf'] },
    { name: 'Syracuse vs North Carolina', teams: ['Syracuse', 'North Carolina', 'Syr', 'UNC'] },
    { name: 'Temple vs East Carolina', teams: ['Temple', 'East Carolina', 'TEM', 'ECU'] },
    { name: 'Tennessee vs Oklahoma', teams: ['Tennessee', 'Oklahoma', 'Tenn', 'Okla'] },
    { name: 'Texas vs Vanderbilt', teams: ['Texas', 'Vanderbilt', 'Tex', 'Vandy'] },
    { name: 'Texas State vs James Madison', teams: ['Texas State', 'James Madison', 'TxSt', 'JMU'] },
    { name: 'Texas Tech vs Kansas State', teams: ['Texas Tech', 'Kansas State', 'TTU', 'KSU'] },
    { name: 'Tulane vs UTSA', teams: ['Tulane', 'UTSA', 'TULN', 'Tx-SA'] },
    { name: 'UConn vs UAB', teams: ['UConn', 'UAB'] },
    { name: 'UNLV vs New Mexico', teams: ['UNLV', 'New Mexico', 'NM'] },
    { name: 'USC vs Nebraska', teams: ['USC', 'Nebraska', 'Neb'] },
    { name: 'Western Michigan vs Central Michigan', teams: ['Western Michigan', 'Central Michigan', 'WestMI', 'CMU'] }
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
