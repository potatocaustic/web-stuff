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
    { name: 'Air Force vs Colorado State', teams: ['AF', 'Air Force', 'CSU', 'Colorado State'] },
    { name: 'Arizona State vs Arizona', teams: ['ASU', 'Ari', 'Arizona', 'Arizona State'] },
    { name: 'Appalachian State vs Arkansas State', teams: ['App', 'Appalachian State', 'ArkSt', 'Arkansas State'] },
    { name: 'Auburn vs Alabama', teams: ['Alabama', 'Auburn', 'BAMA'] },
    { name: 'Boston College vs Syracuse', teams: ['BC', 'Boston College', 'Syr', 'Syracuse'] },
    { name: 'Bowling Green vs Massachusetts', teams: ['BGSU', 'Bowling Green', 'Massachusetts', 'UMass'] },
    { name: 'BYU vs Central Florida', teams: ['BYU', 'Central Florida', 'UCF'] },
    { name: 'Baylor vs Houston', teams: ['Baylor', 'Hou', 'Houston'] },
    { name: 'Boise State vs Utah State', teams: ['Boise', 'Boise State', 'USU', 'Utah State'] },
    { name: 'Delaware vs UTEP', teams: ['Del', 'Delaware', 'UTEP'] },
    { name: 'Duke vs Wake Forest', teams: ['Duke', 'Wake', 'Wake Forest'] },
    { name: 'East Carolina vs Florida Atlantic', teams: ['ECU', 'East Carolina', 'FlaAtl', 'Florida Atlantic'] },
    { name: 'Florida International vs Sam Houston', teams: ['FIU', 'Florida International', 'Sam Houston', 'SamHou'] },
    { name: 'Florida State vs Florida', teams: ['FSU', 'Fla', 'Florida', 'Florida State'] },
    { name: 'Fresno State vs San Jose State', teams: ['Fres', 'Fresno State', 'SJSU', 'San Jose State'] },
    { name: 'Hawaii vs Wyoming', teams: ['Hawaii', 'Wyo', 'Wyoming'] },
    { name: 'Indiana vs Purdue', teams: ['IU', 'Indiana', 'PUR', 'Purdue'] },
    { name: 'Iowa State vs Oklahoma State', teams: ['IaSt', 'Iowa State', 'OKST', 'Oklahoma State'] },
    { name: 'Illinois vs Northwestern', teams: ['Ill', 'Illinois', 'NW', 'Northwestern'] },
    { name: 'Iowa vs Nebraska', teams: ['Iowa', 'Neb', 'Nebraska'] },
    { name: 'James Madison vs Coastal Carolina', teams: ['CoastC', 'Coastal Carolina', 'JMU', 'James Madison'] },
    { name: 'Kansas State vs Colorado', teams: ['CU', 'Colorado', 'KSU', 'Kansas State'] },
    { name: 'Kennesaw State vs Liberty', teams: ['KennSt', 'Kennesaw State', 'Lib', 'Liberty'] },
    { name: 'Louisville vs Kentucky', teams: ['Kentucky', 'Lou', 'Louisville', 'UK'] },
    { name: 'Miami vs Pittsburgh', teams: ['MIA-FL', 'Miami', 'Pitt', 'Pittsburgh'] },
    { name: 'Miami (OH) vs Ball State', teams: ['Ball State', 'BallSt', 'MIA-OH', 'Miami (OH)'] },
    { name: 'Missouri vs Arkansas', teams: ['ARK', 'Arkansas', 'MIZZOU', 'Missouri'] },
    { name: 'Michigan State vs Maryland', teams: ['MD', 'MSU', 'Maryland', 'Michigan State'] },
    { name: 'Marshall vs Georgia Southern', teams: ['GaSo', 'Georgia Southern', 'Marsh', 'Marshall'] },
    { name: 'Memphis vs Navy', teams: ['Mem', 'Memphis', 'Navy'] },
    { name: 'Minnesota vs Wisconsin', teams: ['Minn', 'Minnesota', 'Wisc', 'Wisconsin'] },
    { name: 'Mississippi vs Mississippi State', teams: ['MSST', 'Miss', 'Mississippi', 'Mississippi State'] },
    { name: 'Missouri State vs Louisiana Tech', teams: ['LaTech', 'Louisiana Tech', 'Missouri State', 'MoStU'] },
    { name: 'North Carolina State vs North Carolina', teams: ['NCSU', 'North Carolina', 'North Carolina State', 'UNC'] },
    { name: 'Notre Dame vs Stanford', teams: ['ND', 'Notre Dame', 'Stan', 'Stanford'] },
    { name: 'Northern Illinois vs Kent', teams: ['Kent', 'KentSt', 'NIU', 'Northern Illinois'] },
    { name: 'New Mexico State vs Middle Tenn. St', teams: ['MiddTn', 'Middle Tenn. St', 'NMSt', 'New Mexico State'] },
    { name: 'Old Dominion vs Georgia State', teams: ['GaSt', 'Georgia State', 'ODU', 'Old Dominion'] },
    { name: 'Oregon vs Washington', teams: ['ORE', 'Oregon', 'UW', 'Washington'] },
    { name: 'Ohio vs Buffalo', teams: ['Buff', 'Buffalo', 'Ohio'] },
    { name: 'Ohio State vs Michigan', teams: ['Mich', 'Michigan', 'Ohio State', 'OhioSt'] },
    { name: 'Oklahoma vs LSU', teams: ['LSU', 'Okla', 'Oklahoma'] },
    { name: 'Penn State vs Rutgers', teams: ['PSU', 'Penn State', 'Rut', 'Rutgers'] },
    { name: 'South Carolina vs Clemson', teams: ['Clem', 'Clemson', 'SCAR', 'South Carolina'] },
    { name: 'San Diego State vs New Mexico', teams: ['NM', 'New Mexico', 'SDSU', 'San Diego State'] },
    { name: 'SMU vs California', teams: ['Cal', 'California', 'SMU'] },
    { name: 'Troy vs Southern Miss', teams: ['SouMis', 'Southern Miss', 'Troy'] },
    { name: 'TCU vs Cincinnati', teams: ['CIN', 'Cincinnati', 'TCU'] },
    { name: 'UAB vs Tulsa', teams: ['TLSA', 'Tulsa', 'UAB'] },
    { name: 'Toledo vs Central Michigan', teams: ['CMU', 'Central Michigan', 'TOL', 'Toledo'] },
    { name: 'West Virginia vs Texas Tech', teams: ['TTU', 'Texas Tech', 'WVU', 'West Virginia'] },
    { name: 'Tulane vs UNC Charlotte', teams: ['Char', 'TULN', 'Tulane', 'UNC Charlotte'] },
    { name: 'Tennessee vs Vanderbilt', teams: ['Tenn', 'Tennessee', 'Vanderbilt', 'Vandy'] },
    { name: 'Texas A&M vs Texas', teams: ['Tex', 'TexA&M', 'Texas', 'Texas A&M'] },
    { name: 'UTSA vs Army', teams: ['Army', 'Tx-SA', 'UTSA'] },
    { name: 'Texas State vs South Alabama', teams: ['South Alabama', 'Texas State', 'TxSt', 'USA'] },
    { name: 'Georgia vs Georgia Tech', teams: ['GT', 'Georgia', 'Georgia Tech', 'UGa'] },
    { name: 'Louisiana-Lafayette vs Louisiana-Monroe', teams: ['Louisiana-Lafayette', 'Louisiana-Monroe', 'UL-Laf', 'UL-Mon'] },
    { name: 'UNLV vs Nevada', teams: ['Nevada', 'UNLV'] },
    { name: 'North Texas vs Temple', teams: ['North Texas', 'TEM', 'Temple', 'UNT'] },
    { name: 'USC vs UCLA', teams: ['UCLA', 'USC'] },
    { name: 'South Florida vs Rice', teams: ['Rice', 'South Florida', 'USF'] },
    { name: 'Utah vs Kansas', teams: ['KU', 'Kansas', 'UTAH', 'Utah'] },
    { name: 'Virginia vs Virginia Tech', teams: ['UVa', 'VaTech', 'Virginia', 'Virginia Tech'] },
    { name: 'Washington State vs Oregon State', teams: ['ORST', 'Oregon State', 'WSU', 'Washington State'] },
    { name: 'Western Kentucky vs Jacksonville State', teams: ['JacSt', 'Jacksonville State', 'WestKy', 'Western Kentucky'] },
    { name: 'Western Michigan vs Eastern Michigan', teams: ['EastMi', 'Eastern Michigan', 'WestMI', 'Western Michigan'] }
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
