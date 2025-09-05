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
    { name: 'Pittsburgh vs Central Michigan', teams: ['Pittsburgh', 'Central Michigan'] },
    { name: 'Northwestern vs West Illinois', teams: ['Northwestern', 'WestIl'] },
    { name: 'Baylor vs SMU', teams: ['Baylor', 'SMU'] },
    { name: 'Minnesota vs NWSt', teams: ['Minnesota', 'NWSt'] },
    { name: 'North Carolina State vs Virginia', teams: ['North Carolina State', 'Virginia'] },
    { name: 'Penn State vs FIU', teams: ['Penn State', 'Florida International'] },
    { name: 'Alabama vs UL-Mon', teams: ['Alabama', 'Louisiana-Monroe'] },
    { name: 'Auburn vs Ball State', teams: ['Auburn', 'Ball State'] },
    { name: 'Nebraska vs Akron', teams: ['Nebraska', 'Akron'] },
    { name: 'Louisville vs James Madison', teams: ['Louisville', 'James Madison'] },
    { name: 'Washington vs UCDav', teams: ['Washington', 'UCDav'] },
    { name: 'Central Florida vs NCA&T', teams: ['Central Florida', 'NCA&T'] },
    { name: 'Boise State vs EastWa', teams: ['Boise State', 'EastWa'] },
    { name: 'Ohio State vs Gram', teams: ['Ohio State', 'Gram'] },
    { name: 'LSU vs LaTech', teams: ['LSU', 'Louisiana Tech'] },
    { name: 'Buffalo vs StF-Pa', teams: ['Buffalo', 'StF-Pa'] },
    { name: 'Texas vs San Jose State', teams: ['Texas', 'San Jose State'] },
    { name: 'UTSA vs Texas State', teams: ['UTSA', 'Texas State'] },
    { name: 'USC vs GaSo', teams: ['USC', 'Georgia Southern'] },
    { name: 'West Virginia vs Ohio', teams: ['West Virginia', 'Ohio'] },
    { name: 'Oregon State vs Fresno State', teams: ['Oregon State', 'Fresno State'] },
    { name: 'Texas Tech vs KentSt', teams: ['Texas Tech', 'Kent'] },
    { name: 'Toledo vs Western Kentucky', teams: ['Toledo', 'Western Kentucky'] },
    { name: 'Kansas State vs Army', teams: ['Kansas State', 'Army'] },
    { name: 'Arkansas vs ArkSt', teams: ['Arkansas', 'Arkansas State'] },
    { name: 'Arizona State vs Mississippi State', teams: ['Arizona State', 'Mississippi State'] },
    { name: 'Wake Forest vs WCU', teams: ['Wake Forest', 'WCU'] },
    { name: 'Texas A&M vs Utah State', teams: ['Texas A&M', 'Utah State'] },
    { name: 'BYU vs Stanford', teams: ['BYU', 'Stanford'] },
    { name: 'Memphis vs Georgia State', teams: ['Memphis', 'Georgia State'] },
    { name: 'Missouri vs Kansas', teams: ['Missouri', 'Kansas'] },
    { name: 'Clemson vs Troy', teams: ['Clemson', 'Troy'] },
    { name: 'Navy vs UAB', teams: ['Navy', 'UAB'] },
    { name: 'Colorado State vs NorCol', teams: ['Colorado State', 'NorCol'] },
    { name: 'Indiana vs KennSt', teams: ['Indiana', 'Kennesaw State'] },
    { name: 'Georgia Tech vs G-Webb', teams: ['Georgia Tech', 'G-Webb'] },
    { name: 'Utah vs CalPly', teams: ['Utah', 'CalPly'] },
    { name: 'Florida vs South Florida', teams: ['Florida', 'South Florida'] },
    { name: 'Coastal Carolina vs ChSou', teams: ['Coastal Carolina', 'ChSou'] },
    { name: 'Cincinnati vs BGSU', teams: ['Cincinnati', 'Bowling Green'] },
    { name: 'Wyoming vs UNI', teams: ['Wyoming', 'UNI'] },
    { name: 'Georgia vs APSU', teams: ['Georgia', 'APSU'] },
    { name: 'Maryland vs NIU', teams: ['Maryland', 'Northern Illinois'] },
    { name: 'Wisconsin vs MiddTn', teams: ['Wisconsin', 'Middle Tenn. St'] },
    { name: 'Mississippi vs UK', teams: ['Mississippi', 'Kentucky'] },
    { name: 'UConn vs Syracuse', teams: ['UConn', 'Syracuse'] },
    { name: 'Florida Atlantic vs FlaA&M', teams: ['Florida Atlantic', 'FlaA&M'] },
    { name: 'Oklahoma vs Michigan', teams: ['Oklahoma', 'Michigan'] },
    { name: 'Miami (OH) vs Rutgers', teams: ['Rutgers', 'Miami (OH)'] },
    { name: 'South Carolina vs SCSt', teams: ['South Carolina', 'SCSt'] },
    { name: 'Appalachian State vs Linden', teams: ['Appalachian State', 'Linden'] },
    { name: 'Purdue vs SIU', teams: ['Purdue', 'SIU'] },
    { name: 'Iowa State vs Iowa', teams: ['Iowa State', 'Iowa'] },
    { name: 'Toledo vs WestKy', teams: ['Toledo', 'Western Kentucky'] },
    { name: 'Jacksonville State vs Liberty', teams: ['Liberty', 'Jacksonville State'] },
    { name: 'UNLV vs UCLA', teams: ['UCLA', 'UNLV'] },
    { name: 'South Alabama vs Tulane', teams: ['Tulane', 'South Alabama'] },
    { name: 'New Mexico vs IdaSt', teams: ['New Mexico', 'IdaSt'] },
    { name: 'Western Michigan vs North Texas', teams: ['North Texas', 'Western Michigan'] },
    { name: 'Colorado vs Delaware', teams: ['Colorado', 'Delaware'] },
    { name: 'Virginia Tech vs Vanderbilt', teams: ['Virginia Tech', 'Vanderbilt'] },
    { name: 'Hawaii vs Sam Houston', teams: ['Hawaii', 'Sam Houston'] },
    { name: 'Arizona vs Web', teams: ['Arizona', 'Web'] },
    { name: 'Boston College vs Michigan State', teams: ['Michigan State', 'Boston College'] },
    { name: 'Washington State vs San Diego State', teams: ['Washington State', 'San Diego State'] },
    { name: 'Eastern Michigan vs LIU', teams: ['Eastern Michigan', 'LIU'] },
    { name: 'Massachusetts vs Bryant', teams: ['Massachusetts', 'Bryant'] },
    { name: 'UTEP vs TN-Mar', teams: ['UTEP', 'TN-Mar'] },
    { name: 'Tulsa vs NMSt', teams: ['Tulsa', 'New Mexico State'] },
    { name: 'California vs TxSo', teams: ['California', 'TxSo'] },
    { name: 'Missouri State vs Marshall', teams: ['Marshall', 'Missouri State'] },
    { name: 'North Carolina vs Charlotte', teams: ['North Carolina', 'UNC Charlotte'] },
    { name: 'Southern Miss vs JkSt', teams: ['Southern Miss', 'JkSt'] },
    { name: 'Nevada vs Sac', teams: ['Nevada', 'Sac'] },
    { name: 'Houston vs Rice', teams: ['Houston', 'Rice'] }
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
