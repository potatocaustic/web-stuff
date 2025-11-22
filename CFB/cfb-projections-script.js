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
    { name: 'Air Force vs New Mexico', teams: ['AF', 'Air Force', 'NM', 'New Mexico'] },
    { name: 'Akron vs Bowling Green', teams: ['Akron', 'BGSU', 'Bowling Green'] },
    { name: 'Alabama vs Eastern Illinois', teams: ['Alabama', 'BAMA', 'EastIl', 'Eastern Illinois'] },
    { name: 'Appalachian State vs Marshall', teams: ['App', 'Appalachian State', 'Marsh', 'Marshall'] },
    { name: 'Arizona vs Baylor', teams: ['Ari', 'Arizona', 'Baylor'] },
    { name: 'Arizona State vs Colorado', teams: ['ASU', 'Arizona State', 'CU', 'Colorado'] },
    { name: 'Arkansas vs Texas', teams: ['ARK', 'Arkansas', 'Tex', 'Texas'] },
    { name: 'Arkansas State vs Louisiana-Lafayette', teams: ['ArkSt', 'Arkansas State', 'Louisiana-Lafayette', 'UL-Laf'] },
    { name: 'Army vs Tulsa', teams: ['Army', 'TLSA', 'Tulsa'] },
    { name: 'Auburn vs Mercer', teams: ['Auburn', 'Merc', 'Mercer'] },
    { name: 'BYU vs Cincinnati', teams: ['BYU', 'CIN', 'Cincinnati'] },
    { name: 'Ball State vs Toledo', teams: ['Ball State', 'BallSt', 'TOL', 'Toledo'] },
    { name: 'Boise State vs Colorado State', teams: ['Boise', 'Boise State', 'CSU', 'Colorado State'] },
    { name: 'Buffalo vs Miami (OH)', teams: ['Buff', 'Buffalo', 'MIA-OH', 'Miami (OH)'] },
    { name: 'California vs Stanford', teams: ['Cal', 'California', 'Stan', 'Stanford'] },
    { name: 'Central Florida vs Oklahoma State', teams: ['Central Florida', 'OKST', 'Oklahoma State', 'UCF'] },
    { name: 'Central Michigan vs Kent', teams: ['CMU', 'Central Michigan', 'Kent', 'KentSt'] },
    { name: 'Clemson vs Furman', teams: ['Clem', 'Clemson', 'Furman'] },
    { name: 'Coastal Carolina vs South Carolina', teams: ['CoastC', 'Coastal Carolina', 'SCAR', 'South Carolina'] },
    { name: 'Delaware vs Wake Forest', teams: ['Del', 'Delaware', 'Wake', 'Wake Forest'] },
    { name: 'Duke vs North Carolina', teams: ['Duke', 'North Carolina', 'UNC'] },
    { name: 'East Carolina vs UTSA', teams: ['ECU', 'East Carolina', 'Tx-SA', 'UTSA'] },
    { name: 'Florida vs Tennessee', teams: ['Fla', 'Florida', 'Tenn', 'Tennessee'] },
    { name: 'Florida Atlantic vs UConn', teams: ['FlaAtl', 'Florida Atlantic', 'UConn'] },
    { name: 'Florida International vs Jacksonville State', teams: ['FIU', 'Florida International', 'JacSt', 'Jacksonville State'] },
    { name: 'Florida State vs North Carolina State', teams: ['FSU', 'Florida State', 'NCSU', 'North Carolina State'] },
    { name: 'Fresno State vs Utah State', teams: ['Fres', 'Fresno State', 'USU', 'Utah State'] },
    { name: 'Georgia vs UNC Charlotte', teams: ['Char', 'Georgia', 'UGa', 'UNC Charlotte'] },
    { name: 'Georgia Southern vs Old Dominion', teams: ['GaSo', 'Georgia Southern', 'ODU', 'Old Dominion'] },
    { name: 'Georgia State vs Troy', teams: ['GaSt', 'Georgia State', 'Troy'] },
    { name: 'Georgia Tech vs Pittsburgh', teams: ['GT', 'Georgia Tech', 'Pitt', 'Pittsburgh'] },
    { name: 'Hawaii vs UNLV', teams: ['Hawaii', 'UNLV'] },
    { name: 'Houston vs TCU', teams: ['Hou', 'Houston', 'TCU'] },
    { name: 'Illinois vs Wisconsin', teams: ['Ill', 'Illinois', 'Wisc', 'Wisconsin'] },
    { name: 'Iowa vs Michigan State', teams: ['Iowa', 'MSU', 'Michigan State'] },
    { name: 'Iowa State vs Kansas', teams: ['IaSt', 'Iowa State', 'KU', 'Kansas'] },
    { name: 'James Madison vs Washington State', teams: ['JMU', 'James Madison', 'WSU', 'Washington State'] },
    { name: 'Kansas State vs Utah', teams: ['KSU', 'Kansas State', 'UTAH', 'Utah'] },
    { name: 'Kennesaw State vs Missouri State', teams: ['KennSt', 'Kennesaw State', 'Missouri State', 'MoStU'] },
    { name: 'Kentucky vs Vanderbilt', teams: ['Kentucky', 'UK', 'Vanderbilt', 'Vandy'] },
    { name: 'LSU vs Western Kentucky', teams: ['LSU', 'WestKy', 'Western Kentucky'] },
    { name: 'Liberty vs Louisiana Tech', teams: ['LaTech', 'Lib', 'Liberty', 'Louisiana Tech'] },
    { name: 'Louisville vs SMU', teams: ['Lou', 'Louisville', 'SMU'] },
    { name: 'Louisiana-Monroe vs Texas State', teams: ['Louisiana-Monroe', 'Texas State', 'TxSt', 'UL-Mon'] },
    { name: 'Maryland vs Michigan', teams: ['MD', 'Maryland', 'Mich', 'Michigan'] },
    { name: 'Massachusetts vs Ohio', teams: ['Massachusetts', 'Ohio', 'UMass'] },
    { name: 'Miami vs Virginia Tech', teams: ['MIA-FL', 'Miami', 'VaTech', 'Virginia Tech'] },
    { name: 'Middle Tenn. St vs Sam Houston', teams: ['MiddTn', 'Middle Tenn. St', 'Sam', 'Sam Houston', 'SamHou'] },
    { name: 'Minnesota vs Northwestern', teams: ['Minn', 'Minnesota', 'NW', 'Northwestern'] },
    { name: 'Missouri vs Oklahoma', teams: ['MIZZOU', 'Missouri', 'Okla', 'Oklahoma'] },
    { name: 'Nebraska vs Penn State', teams: ['Neb', 'Nebraska', 'PSU', 'Penn State'] },
    { name: 'Nevada vs Wyoming', teams: ['Nevada', 'Wyo', 'Wyoming'] },
    { name: 'New Mexico State vs UTEP', teams: ['NMSt', 'New Mexico State', 'UTEP'] },
    { name: 'North Texas vs Rice', teams: ['North Texas', 'Rice', 'UNT'] },
    { name: 'Northern Illinois vs Western Michigan', teams: ['NIU', 'Northern Illinois', 'WestMI', 'Western Michigan'] },
    { name: 'Notre Dame vs Syracuse', teams: ['ND', 'Notre Dame', 'Syr', 'Syracuse'] },
    { name: 'Ohio State vs Rutgers', teams: ['Ohio State', 'OhioSt', 'Rut', 'Rutgers'] },
    { name: 'Oregon vs USC', teams: ['ORE', 'Oregon', 'USC'] },
    { name: 'San Diego State vs San Jose State', teams: ['SDSU', 'SJSU', 'San Diego State', 'San Jose State'] },
    { name: 'South Alabama vs Southern Miss', teams: ['SouMis', 'South Alabama', 'Southern Miss', 'USA'] },
    { name: 'South Florida vs UAB', teams: ['South Florida', 'UAB', 'USF'] },
    { name: 'Temple vs Tulane', teams: ['TEM', 'TULN', 'Temple', 'Tulane'] },
    { name: 'Texas A&M vs Sam Houston', teams: ['Sam', 'Sam Houston', 'TexA&M', 'Texas A&M'] },
    { name: 'UCLA vs Washington', teams: ['UCLA', 'UW', 'Washington'] }
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
