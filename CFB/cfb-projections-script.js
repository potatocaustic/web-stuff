// Global variables
let allData = {
  qb: [],
  nonQb: []
};
let currentPosition = 'nonQb'; // Default position group
let filteredDataCache = []; // Cache for sorting
let sortState = {
    key: 'Player Name',
    direction: 'asc'
};

// Configuration
const CONFIG = {
  GOOGLE_SHEET_URLS: {
    qb: 'https://docs.google.com/spreadsheets/d/1fXYQXnPAe8uABQKJ9LiGJWRNdfAM-W3EPrUsZdOAgiE/export?format=csv',
    nonQb: 'https://docs.google.com/spreadsheets/d/1L4H9R1kWcEBbxM9TTJcd5x6wdx_rhAJKQciLEUnk14M/export?format=csv'
  },
  GAMES: [
    { name: 'Pittsburgh vs Central Michigan', teams: ['Pitt', 'CMU'] },
    { name: 'Northwestern vs West Illinois', teams: ['NW', 'WestIl'] },
    { name: 'Baylor vs SMU', teams: ['Baylor', 'SMU'] },
    { name: 'Minnesota vs NWSt', teams: ['Minnesota', 'NWSt'] },
    { name: 'North Carolina State vs Virginia', teams: ['NCSU', 'UVa'] },
    { name: 'Penn State vs FIU', teams: ['PSU', 'FIU'] },
    { name: 'Alabama vs UL-Mon', teams: ['BAMA', 'UL-Mon'] },
    { name: 'Auburn vs Ball State', teams: ['Auburn', 'BallSt'] },
    { name: 'Nebraska vs Akron', teams: ['Neb', 'Akron'] },
    { name: 'Louisville vs James Madison', teams: ['Lou', 'JMU'] },
    { name: 'Washington vs UCDav', teams: ['UCDav', 'UCDav'] },
    { name: 'Central Florida vs NCA&T', teams: ['NCA&T', 'NCA&T'] },
    { name: 'Boise State vs EastWa', teams: ['Boise', 'EastWa'] },
    { name: 'Ohio State vs Gram', teams: ['Gram', 'Gram'] },
    { name: 'LSU vs LaTech', teams: ['LSU', 'LaTech'] },
    { name: 'Buffalo vs StF-Pa', teams: ['StF-Pa', 'StF-Pa'] },
    { name: 'Texas vs San Jose State', teams: ['Tex', 'SJSU'] },
    { name: 'UTSA vs Texas State', teams: ['Tx-SA', 'TxSt'] },
    { name: 'USC vs GaSo', teams: ['USC', 'GaSo'] },
    { name: 'West Virginia vs Ohio', teams: ['WVU', 'Ohio'] },
    { name: 'Oregon State vs Fresno State', teams: ['ORST', 'Fres'] },
    { name: 'Texas Tech vs KentSt', teams: ['TTU', 'KentSt'] },
    { name: 'Toledo vs Western Kentucky', teams: ['TOL', 'WestKy'] },
    { name: 'Kansas State vs Army', teams: ['KSU', 'Army'] },
    { name: 'Arkansas vs ArkSt', teams: ['ARK', 'ArkSt'] },
    { name: 'Arizona State vs Mississippi State', teams: ['ASU', 'MSST'] },
    { name: 'Wake Forest vs WCU', teams: ['WCU', 'WCU'] },
    { name: 'Texas A&M vs Utah State', teams: ['TexA&M', 'USU'] },
    { name: 'BYU vs Stanford', teams: ['BYU', 'Stan'] },
    { name: 'Memphis vs Georgia State', teams: ['Mem', 'GaSt'] },
    { name: 'Missouri vs Kansas', teams: ['MIZZOU', 'KU'] },
    { name: 'Clemson vs Troy', teams: ['Clem', 'Troy'] },
    { name: 'Navy vs UAB', teams: ['Navy', 'UAB'] },
    { name: 'Colorado State vs NorCol', teams: ['NorCol', 'NorCol'] },
    { name: 'Indiana vs KennSt', teams: ['IU', 'KennSt'] },
    { name: 'Georgia Tech vs G-Webb', teams: ['G-Webb', 'G-Webb'] },
    { name: 'Utah vs CalPly', teams: ['CalPly', 'CalPly'] },
    { name: 'Florida vs South Florida', teams: ['Fla', 'USF'] },
    { name: 'Coastal Carolina vs ChSou', teams: ['ChSou', 'ChSou'] },
    { name: 'Cincinnati vs BGSU', teams: ['CIN', 'BGSU'] },
    { name: 'Wyoming vs UNI', teams: ['UNI', 'UNI'] },
    { name: 'Georgia vs APSU', teams: ['APSU', 'APSU'] },
    { name: 'Maryland vs NIU', teams: ['MD', 'NIU'] },
    { name: 'Wisconsin vs MiddTn', teams: ['Wisc', 'MiddTn'] },
    { name: 'Mississippi vs UK', teams: ['Miss', 'UK'] },
    { name: 'UConn vs Syracuse', teams: ['Syr', 'Syr'] },
    { name: 'Florida Atlantic vs FlaA&M', teams: ['FlaA&M', 'FlaA&M'] },
    { name: 'Oklahoma vs Michigan', teams: ['Okla', 'Mich'] },
    { name: 'Miami (OH) vs Rutgers', teams: ['Rut', 'MIA-OH'] },
    { name: 'South Carolina vs SCSt', teams: ['SCSt', 'SCSt'] },
    { name: 'Appalachian State vs Linden', teams: ['Linden', 'Linden'] },
    { name: 'Purdue vs SIU', teams: ['SIU', 'SIU'] },
    { name: 'Iowa State vs Iowa', teams: ['IaSt', 'Iowa'] },
    { name: 'Toledo vs WestKy', teams: ['TOL', 'WestKy'] },
    { name: 'Jacksonville State vs Liberty', teams: ['Lib', 'JacSt'] },
    { name: 'UNLV vs UCLA', teams: ['UCLA', 'UNLV'] },
    { name: 'South Alabama vs Tulane', teams: ['TULN', 'USA'] },
    { name: 'New Mexico vs IdaSt', teams: ['IdaSt', 'IdaSt'] },
    { name: 'Western Michigan vs North Texas', teams: ['UNT', 'WestMI'] },
    { name: 'Colorado vs Delaware', teams: ['CU', 'Del'] },
    { name: 'Virginia Tech vs Vanderbilt', teams: ['VaTech', 'Vandy'] },
    { name: 'Hawaii vs Sam Houston', teams: ['Hawaii', 'SamHou'] },
    { name: 'Arizona vs Web', teams: ['Web', 'Web'] },
    { name: 'Boston College vs Michigan State', teams: ['MSU', 'BC'] },
    { name: 'Washington State vs San Diego State', teams: ['WSU', 'SDSU'] },
    { name: 'Eastern Michigan vs LIU', teams: ['LIU', 'LIU'] },
    { name: 'Massachusetts vs Bryant', teams: ['Bryant', 'Bryant'] },
    { name: 'UTEP vs TN-Mar', teams: ['TN-Mar', 'TN-Mar'] },
    { name: 'Tulsa vs NMSt', teams: ['TLSA', 'NMSt'] },
    { name: 'California vs TxSo', teams: ['TxSo', 'TxSo'] },
    { name: 'Missouri State vs Marshall', teams: ['Marsh', 'MoStU'] },
    { name: 'North Carolina vs Charlotte', teams: ['UNC', 'Char'] },
    { name: 'Southern Miss vs JkSt', teams: ['JkSt', 'JkSt'] },
    { name: 'Nevada vs Sac', teams: ['Sac', 'Sac'] },
    { name: 'Houston vs Rice', teams: ['Hou', 'Rice'] }
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
  // Reset sort state when switching views
  sortState = { key: 'Player Name', direction: 'asc' };
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
            sortState.direction = 'asc';
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
