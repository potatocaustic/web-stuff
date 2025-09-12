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
    { name: 'North Carolina State vs Wake Forest', teams: ['North Carolina State', 'Wake Forest'] },
    { name: 'Colgate vs Syracuse', teams: ['Colgate', 'Syracuse'] },
    { name: 'Colorado vs Houston', teams: ['Colorado', 'Houston'] },
    { name: 'Indiana State vs Indiana', teams: ['Indiana State', 'Indiana'] },
    { name: 'Kansas State vs Arizona', teams: ['Kansas State', 'Arizona'] },
    { name: 'New Mexico vs UCLA', teams: ['New Mexico', 'UCLA'] },
    { name: 'Abilene Christian vs TCU', teams: ['Abilene Christian', 'TCU'] },
    { name: 'Air Force vs Utah State', teams: ['Air Force', 'Utah State'] },
    { name: 'Akron vs UAB', teams: ['Akron', 'UAB'] },
    { name: 'Alcorn State vs Mississippi State', teams: ['Alcorn State', 'Mississippi State'] },
    { name: 'Appalachian State vs Southern Mississippi', teams: ['Appalachian State', 'Southern Mississippi'] },
    { name: 'Arkansas vs Mississippi', teams: ['Arkansas', 'Mississippi'] },
    { name: 'Boston College vs Stanford', teams: ['Boston College', 'Stanford'] },
    { name: 'Buffalo vs Kent', teams: ['Buffalo', 'Kent'] },
    { name: 'Central Michigan vs Michigan', teams: ['Central Michigan', 'Michigan'] },
    { name: 'Clemson vs Georgia Tech', teams: ['Clemson', 'Georgia Tech'] },
    { name: 'UConn vs Delaware', teams: ['UConn', 'Delaware'] },
    { name: 'Duke vs Tulane', teams: ['Duke', 'Tulane'] },
    { name: 'East Carolina vs Coastal Carolina', teams: ['East Carolina', 'Coastal Carolina'] },
    { name: 'Eastern Kentucky vs Marshall', teams: ['Eastern Kentucky', 'Marshall'] },
    { name: 'Eastern Michigan vs Kentucky', teams: ['Eastern Michigan', 'Kentucky'] },
    { name: 'Florida vs LSU', teams: ['Florida', 'LSU'] },
    { name: 'Florida Atlantic vs Florida International', teams: ['Florida Atlantic', 'Florida International'] },
    { name: 'Georgia vs Tennessee', teams: ['Georgia', 'Tennessee'] },
    { name: 'Houston Baptist vs Nebraska', teams: ['Houston Baptist', 'Nebraska'] },
    { name: 'Incarnate Word vs UTSA', teams: ['Incarnate Word', 'Texas-San Antonio'] },
    { name: 'Iowa State vs Arkansas State', teams: ['Iowa State', 'Arkansas State'] },
    { name: 'Jacksonville State vs Georgia Southern', teams: ['Jacksonville State', 'Georgia Southern'] },
    { name: 'Liberty vs Bowling Green', teams: ['Liberty', 'Bowling Green'] },
    { name: 'Louisiana-Lafayette vs Missouri', teams: ['Louisiana-Lafayette', 'Missouri'] },
    { name: 'Massachusetts vs Iowa', teams: ['Massachusetts', 'Iowa'] },
    { name: 'Memphis vs Troy', teams: ['Memphis', 'Troy'] },
    { name: 'Merrimack vs Kennesaw State', teams: ['Merrimack', 'Kennesaw State'] },
    { name: 'Middle Tenn. St vs Nevada', teams: ['Middle Tenn. St', 'Nevada'] },
    { name: 'Minnesota vs California', teams: ['Minnesota', 'California'] },
    { name: 'Monmouth vs UNC Charlotte', teams: ['Monmouth', 'UNC Charlotte'] },
    { name: 'Morgan State vs Toledo', teams: ['Morgan State', 'Toledo'] },
    { name: 'Murray State vs Georgia State', teams: ['Murray State', 'Georgia State'] },
    { name: 'Navy vs Tulsa', teams: ['Navy', 'Tulsa'] },
    { name: 'New Hampshire vs Ball State', teams: ['New Hampshire', 'Ball State'] },
    { name: 'New Mexico State vs Louisiana Tech', teams: ['New Mexico State', 'Louisiana Tech'] },
    { name: 'Norfolk State vs Rutgers', teams: ['Norfolk State', 'Rutgers'] },
    { name: 'Northwestern State vs Cincinnati', teams: ['Northwestern State', 'Cincinnati'] },
    { name: 'Ohio vs Ohio State', teams: ['Ohio', 'Ohio State'] },
    { name: 'Oklahoma vs Temple', teams: ['Oklahoma', 'Temple'] },
    { name: 'Old Dominion vs Virginia Tech', teams: ['Old Dominion', 'Virginia Tech'] },
    { name: 'Oregon vs Northwestern', teams: ['Oregon', 'Northwestern'] },
    { name: 'Oregon State vs Texas Tech', teams: ['Oregon State', 'Texas Tech'] },
    { name: 'Pittsburgh vs West Virginia', teams: ['Pittsburgh', 'West Virginia'] },
    { name: 'Prairie View A&M vs Rice', teams: ['Prairie View A&M', 'Rice'] },
    { name: 'Richmond vs North Carolina', teams: ['Richmond', 'North Carolina'] },
    { name: 'Samford vs Baylor', teams: ['Samford', 'Baylor'] },
    { name: 'South Alabama vs Auburn', teams: ['South Alabama', 'Auburn'] },
    { name: 'South Florida vs Miami', teams: ['South Florida', 'Miami'] },
    { name: 'Southern vs Fresno State', teams: ['Southern', 'Fresno State'] },
    { name: 'Southern California vs Purdue', teams: ['Southern California', 'Purdue'] },
    { name: 'SMU vs Missouri State', teams: ['SMU', 'Missouri State'] },
    { name: 'Texas A&M vs Notre Dame', teams: ['Texas A&M', 'Notre Dame'] },
    { name: 'Texas State vs Arizona State', teams: ['Texas State', 'Arizona State'] },
    { name: 'UTEP vs Texas', teams: ['UTEP', 'Texas'] },
    { name: 'Towson vs Maryland', teams: ['Towson', 'Maryland'] },
    { name: 'Utah vs Wyoming', teams: ['Utah', 'Wyoming'] },
    { name: 'Vanderbilt vs South Carolina', teams: ['Vanderbilt', 'South Carolina'] },
    { name: 'Villanova vs Penn State', teams: ['Villanova', 'Penn State'] },
    { name: 'Washington State vs North Texas', teams: ['Washington State', 'North Texas'] },
    { name: 'Western Michigan vs Illinois', teams: ['Western Michigan', 'Illinois'] },
    { name: 'William & Mary vs Virginia', teams: ['William & Mary', 'Virginia'] },
    { name: 'Wisconsin vs Alabama', teams: ['Wisconsin', 'Alabama'] },
    { name: 'Youngstown State vs Michigan State', teams: ['Youngstown State', 'Michigan State'] },
    { name: 'Portland State vs Hawaii', teams: ['Portland State', 'Hawaii'] }
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
