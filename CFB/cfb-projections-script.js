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
    { name: 'Air Force vs Buck', teams: ['Air Force', 'Buck'] },
    { name: 'Akron vs Wyoming', teams: ['Akron', 'Wyoming'] },
    { name: 'Alabama vs Florida State', teams: ['Alabama', 'Florida State'] },
    { name: 'Appalachian State vs UNC Charlotte', teams: ['Appalachian State', 'Charlotte'] },
    { name: 'Arizona vs Hawaii', teams: ['Arizona', 'Hawaii'] },
    { name: 'Arizona State vs NoAri', teams: ['Arizona State', 'NoAri'] },
    { name: 'Arkansas vs AlaA&M', teams: ['Arkansas', 'AlaA&M'] },
    { name: 'Arkansas State vs SEMO', teams: ['Arkansas State', 'SEMO'] },
    { name: 'Army vs TarlSt', teams: ['Army', 'TarlSt'] },
    { name: 'Auburn vs Baylor', teams: ['Auburn', 'Baylor'] },
    { name: 'Ball State vs Purdue', teams: ['Ball State', 'Purdue'] },
    { name: 'Boise State vs South Florida', teams: ['Boise State', 'South Florida'] },
    { name: 'Boston College vs Ford', teams: ['Boston College', 'Ford'] },
    { name: 'BYU vs PorSt', teams: ['BYU', 'PorSt'] },
    { name: 'California vs Oregon State', teams: ['California', 'Oregon State'] },
    { name: 'Central Florida vs Jacksonville State', teams: ['Central Florida', 'JacSt'] },
    { name: 'Central Michigan vs San Jose State', teams: ['Central Michigan', 'San Jose State'] },
    { name: 'Cincinnati vs Nebraska', teams: ['Cincinnati', 'Nebraska'] },
    { name: 'Clemson vs LSU', teams: ['Clemson', 'LSU'] },
    { name: 'Coastal Carolina vs Virginia', teams: ['Coastal Carolina', 'Virginia'] },
    { name: 'Colorado vs Georgia Tech', teams: ['Colorado', 'Georgia Tech'] },
    { name: 'Colorado State vs Washington', teams: ['Colorado State', 'Washington'] },
    { name: 'Delaware vs DelSt', teams: ['Delaware', 'DelSt'] },
    { name: 'Duke vs Elon', teams: ['Duke', 'Elon'] },
    { name: 'East Carolina vs North Carolina State', teams: ['East Carolina', 'NC State'] },
    { name: 'Eastern Michigan vs Texas State', teams: ['Eastern Michigan', 'Texas State'] },
    { name: 'Florida vs LIU', teams: ['Florida', 'LIU'] },
    { name: 'Florida Atlantic vs Maryland', teams: ['Florida Atlantic', 'Maryland'] },
    { name: 'Fresno State vs Georgia Southern', teams: ['Fresno State', 'Georgia Southern'] },
    { name: 'Georgia vs Marsh', teams: ['Georgia', 'Marsh'] },
    { name: 'Georgia State vs Mississippi', teams: ['Georgia State', 'Ole Miss'] },
    { name: 'Illinois vs WestIl', teams: ['Illinois', 'WestIl'] },
    { name: 'Indiana vs Old Dominion', teams: ['Indiana', 'Old Dominion'] },
    { name: 'Iowa vs Albany', teams: ['Iowa', 'Albany'] },
    { name: 'Iowa State vs SouDak', teams: ['Iowa State', 'SouDak'] },
    { name: 'James Madison vs Web', teams: ['James Madison', 'Web'] },
    { name: 'Kansas vs Wagner', teams: ['Kansas', 'Wagner'] },
    { name: 'Kansas State vs NorDak', teams: ['Kansas State', 'NorDak'] },
    { name: 'Kennesaw State vs Wake Forest', teams: ['Kennesaw State', 'Wake Forest'] },
    { name: 'Kent vs Merrim', teams: ['Kent State', 'Merrim'] },
    { name: 'Kentucky vs Toledo', teams: ['Kentucky', 'Toledo'] },
    { name: 'Liberty vs Maine', teams: ['Liberty', 'Maine'] },
    { name: 'Louisiana Tech vs SELa', teams: ['Louisiana Tech', 'SELa'] },
    { name: 'Louisiana-Lafayette vs Rice', teams: ['Louisiana', 'Rice'] },
    { name: 'Louisiana-Monroe vs StF-Pa', teams: ['UL Monroe', 'StF-Pa'] },
    { name: 'Louisville vs EastKy', teams: ['Louisville', 'EastKy'] },
    { name: 'Memphis vs Chat', teams: ['Memphis', 'Chat'] },
    { name: 'Miami vs Notre Dame', teams: ['Miami', 'Notre Dame'] },
    { name: 'Miami (OH) vs Wisconsin', teams: ['Miami (OH)', 'Wisconsin'] },
    { name: 'Michigan vs New Mexico', teams: ['Michigan', 'New Mexico'] },
    { name: 'Michigan State vs Western Michigan', teams: ['Michigan State', 'Western Michigan'] },
    { name: 'Minnesota vs Buffalo', teams: ['Minnesota', 'Buffalo'] },
    { name: 'Mississippi State vs Southern Miss', teams: ['Mississippi State', 'Southern Miss'] },
    { name: 'Missouri vs CenArk', teams: ['Missouri', 'CenArk'] },
    { name: 'Navy vs VMI', teams: ['Navy', 'VMI'] },
    { name: 'New Mexico State vs Bryant', teams: ['New Mexico State', 'Bryant'] },
    { name: 'North Carolina vs TCU', teams: ['North Carolina', 'TCU'] },
    { name: 'North Texas vs Lamar', teams: ['North Texas', 'Lamar'] },
    { name: 'Northern Illinois vs HolyCr', teams: ['Northern Illinois', 'HolyCr'] },
    { name: 'Northwestern vs Tulane', teams: ['Northwestern', 'Tulane'] },
    { name: 'Ohio vs Rutgers', teams: ['Ohio', 'Rutgers'] },
    { name: 'Ohio State vs Texas', teams: ['Ohio State', 'Texas'] },
    { name: 'Oklahoma vs IllSt', teams: ['Oklahoma', 'IllSt'] },
    { name: 'Oklahoma State vs TN-Mar', teams: ['Oklahoma State', 'TN-Mar'] },
    { name: 'Oregon vs MontSt', teams: ['Oregon', 'MontSt'] },
    { name: 'Penn State vs Nevada', teams: ['Penn State', 'Nevada'] },
    { name: 'Pittsburgh vs Duq', teams: ['Pittsburgh', 'Duq'] },
    { name: 'San Diego State vs StnyBr', teams: ['San Diego State', 'StnyBr'] },
    { name: 'South Alabama vs MorgSt', teams: ['South Alabama', 'MorgSt'] },
    { name: 'South Carolina vs Virginia Tech', teams: ['South Carolina', 'Virginia Tech'] },
    { name: 'Temple vs Massachusetts', teams: ['Temple', 'UMass'] },
    { name: 'Tennessee vs Syracuse', teams: ['Tennessee', 'Syracuse'] },
    { name: 'Texas A&M vs UTSA', teams: ['Texas A&M', 'UTSA'] },
    { name: 'Texas Tech vs Ark-PB', teams: ['Texas Tech', 'Ark-PB'] },
    { name: 'UConn vs CentCt', teams: ['UConn', 'CentCt'] },
    { name: 'UNLV vs Sam Houston', teams: ['UNLV', 'Sam Houston'] },
    { name: 'USC vs MoStU', teams: ['USC', 'MoStU'] },
    { name: 'UTEP vs Utah State', teams: ['UTEP', 'Utah State'] },
    { name: 'Utah vs UCLA', teams: ['Utah', 'UCLA'] },
    { name: 'Washington State vs Idaho', teams: ['Washington State', 'Idaho'] },
    { name: 'West Virginia vs RMor', teams: ['West Virginia', 'RMor'] },
    { name: 'Western Kentucky vs NortAL', teams: ['Western Kentucky', 'NortAL'] }
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
