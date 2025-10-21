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
    { name: 'Akron vs Buffalo', teams: ['Akron', 'Buff'] },
    { name: 'Alabama vs South Carolina', teams: ['Alabama', 'SCAR', 'South Carolina', 'BAMA'] },
    { name: 'Appalachian State vs Old Dominion', teams: ['Appalachian State', 'ODU', 'Old Dominion', 'App'] },
    { name: 'Arizona State vs Houston', teams: ['Arizona State', 'Hou', 'Houston', 'ASU'] },
    { name: 'Arkansas vs Auburn', teams: ['Arkansas', 'Auburn', 'ARK'] },
    { name: 'Arkansas State vs Georgia Southern', teams: ['Arkansas State', 'GaSo', 'Georgia Southern', 'ArkSt'] },
    { name: 'Ball State vs Northern Illinois', teams: ['Ball State', 'NIU', 'Northern Illinois'] },
    { name: 'Baylor vs Cincinnati', teams: ['Baylor', 'CIN', 'Cincinnati'] },
    { name: 'Boise State vs Nevada', teams: ['Boise State', 'Nevada'] },
    { name: 'Boston College vs Louisville', teams: ['Boston College', 'Lou', 'Louisville', 'BC'] },
    { name: 'Bowling Green vs Kent State', teams: ['Bowling Green', 'KentSt', 'Kent', 'BGSU'] },
    { name: 'BYU vs Iowa State', teams: ['BYU', 'IaSt', 'Iowa State'] },
    { name: 'California vs Virginia Tech', teams: ['California', 'VaTech', 'Virginia Tech', 'Cal'] },
    { name: 'Central Michigan vs Massachusetts', teams: ['Central Michigan', 'UMass', 'Massachusetts', 'CMU'] },
    { name: 'Colorado vs Utah', teams: ['Colorado', 'UTAH', 'Utah', 'CU'] },
    { name: 'Delaware vs Middle Tenn. St', teams: ['Delaware', 'MiddTn', 'Middle Tenn. St', 'Del'] },
    { name: 'Florida Atlantic vs Navy', teams: ['Florida Atlantic', 'Navy', 'FlaAtl'] },
    { name: 'Florida International vs Kennesaw State', teams: ['Florida International', 'KennSt', 'Kennesaw State', 'FIU'] },
    { name: 'Fresno State vs San Diego State', teams: ['Fresno State', 'SDSU', 'San Diego State', 'Fres'] },
    { name: 'Georgia State vs South Alabama', teams: ['Georgia State', 'USA', 'South Alabama', 'GaSt'] },
    { name: 'Georgia Tech vs Syracuse', teams: ['Georgia Tech', 'Syr', 'Syracuse', 'GT'] },
    { name: 'Illinois vs Washington', teams: ['Illinois', 'UW', 'Washington', 'Ill'] },
    { name: 'Indiana vs UCLA', teams: ['Indiana', 'UCLA', 'IU'] },
    { name: 'Iowa vs Minnesota', teams: ['Iowa', 'Minn', 'Minnesota'] },
    { name: 'Kansas vs Kansas State', teams: ['Kansas', 'KSU', 'Kansas State', 'KU'] },
    { name: 'Kentucky vs Tennessee', teams: ['Kentucky', 'Tenn', 'Tennessee', 'UK'] },
    { name: 'LSU vs Texas A&M', teams: ['LSU', 'TexA&M', 'Texas A&M'] },
    { name: 'Louisiana Tech vs Western Kentucky', teams: ['Louisiana Tech', 'WestKy', 'Western Kentucky', 'LaTech'] },
    { name: 'Louisiana-Lafayette vs Troy', teams: ['Louisiana-Lafayette', 'Troy', 'UL-Laf'] },
    { name: 'Louisiana-Monroe vs Southern Miss', teams: ['Louisiana-Monroe', 'SouMis', 'Southern Miss', 'UL-Mon'] },
    { name: 'Memphis vs South Florida', teams: ['Memphis', 'USF', 'South Florida'] },
    { name: 'Miami vs Stanford', teams: ['Miami', 'Stan', 'Stanford', 'MIA-FL'] },
    { name: 'Miami (OH) vs Western Michigan', teams: ['Miami (OH)', 'WestMI', 'Western Michigan', 'MIA-OH'] },
    { name: 'Michigan vs Michigan State', teams: ['Michigan', 'MSU', 'Michigan State', 'Mich'] },
    { name: 'Mississippi vs Oklahoma', teams: ['Mississippi', 'Okla', 'Oklahoma', 'Miss'] },
    { name: 'Mississippi State vs Texas', teams: ['Mississippi State', 'Tex', 'Texas', 'MSST'] },
    { name: 'Missouri vs Vanderbilt', teams: ['Missouri', 'Vandy', 'Vanderbilt', 'MIZZOU'] },
    { name: 'Missouri State vs New Mexico State', teams: ['Missouri State', 'NMSt', 'New Mexico State', 'MoStU'] },
    { name: 'Nebraska vs Northwestern', teams: ['Nebraska', 'NW', 'Northwestern', 'Neb'] },
    { name: 'New Mexico vs Utah State', teams: ['New Mexico', 'USU', 'Utah State', 'NM'] },
    { name: 'North Carolina vs Virginia', teams: ['North Carolina', 'UVa', 'Virginia', 'UNC'] },
    { name: 'North Carolina State vs Pittsburgh', teams: ['North Carolina State', 'Pitt', 'Pittsburgh', 'NCSU'] },
    { name: 'North Texas vs UNC Charlotte', teams: ['North Texas', 'Char', 'UNC Charlotte', 'UNT'] },
    { name: 'Ohio vs Eastern Michigan', teams: ['Ohio', 'EastMi', 'Eastern Michigan'] },
    { name: 'Oklahoma State vs Texas Tech', teams: ['Oklahoma State', 'TTU', 'Texas Tech', 'OKST'] },
    { name: 'Oregon vs Wisconsin', teams: ['Oregon', 'Wisc', 'Wisconsin', 'ORE'] },
    { name: 'Purdue vs Rutgers', teams: ['Purdue', 'Rut', 'Rutgers', 'PUR'] },
    { name: 'Rice vs UConn', teams: ['Rice', 'UConn'] },
    { name: 'SMU vs Wake Forest', teams: ['SMU', 'Wake', 'Wake Forest'] },
    { name: 'TCU vs West Virginia', teams: ['TCU', 'WVU', 'West Virginia'] },
    { name: 'Temple vs Tulsa', teams: ['Temple', 'TLSA', 'Tulsa', 'TEM'] },
    { name: 'Toledo vs Washington State', teams: ['Toledo', 'WSU', 'Washington State', 'TOL'] },
    { name: 'Wyoming vs Colorado State', teams: ['Wyoming', 'CSU', 'Colorado State', 'Wyo'] }
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
