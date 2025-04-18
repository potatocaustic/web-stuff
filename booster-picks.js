// Function to display the results in a table
function displayResults(data) {
  const resultsContainer = document.getElementById('boosterResults');
  
  // Create a table for each category
  Object.keys(data.categories).forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-section';
    
    const categoryHeader = document.createElement('h3');
    categoryHeader.textContent = category;
    categoryDiv.appendChild(categoryHeader);
    
    const table = document.createElement('table');
    table.className = 'booster-table';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const rankHeader = document.createElement('th');
    rankHeader.textContent = 'Rank';
    rankHeader.style.width = '50px'; // Narrow column for rank
    
    const playerHeader = document.createElement('th');
    playerHeader.textContent = 'Player';
    
    const teamHeader = document.createElement('th');
    teamHeader.textContent = 'Team';
    teamHeader.style.width = '120px'; // Medium width for team
    
    const ratingHeader = document.createElement('th');
    ratingHeader.textContent = 'Rating';
    ratingHeader.style.width = '80px'; // Narrow width for rating
    ratingHeader.style.textAlign = 'center';
    
    headerRow.appendChild(rankHeader);
    headerRow.appendChild(playerHeader);
    headerRow.appendChild(teamHeader);
    headerRow.appendChild(ratingHeader);
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    data.categories[category].forEach((player, index) => {
      const row = document.createElement('tr');
      
      // Rank cell
      const rankCell = document.createElement('td');
      rankCell.textContent = index + 1;
      
      // Player cell
      const playerCell = document.createElement('td');
      playerCell.textContent = player.player;
      
      // Team cell
      const teamCell = document.createElement('td');
      teamCell.textContent = player.team;
      
      // Rating cell with appropriate icon
      const ratingCell = document.createElement('td');
      ratingCell.style.textAlign = 'center';
      const ratingIcon = document.createElement('span');
      
      if (player.rating === 'Strong') {
        ratingIcon.className = 'strong-icon';
        ratingIcon.innerHTML = '●'; // Green circle for strong
        ratingIcon.style.fontSize = '1.6em'; // Bigger icon
      } else if (player.rating === 'Medium') {
        ratingIcon.className = 'medium-icon';
        ratingIcon.innerHTML = '●'; // Yellow circle for medium
        ratingIcon.style.fontSize = '1.6em'; // Bigger icon
      } else {
        ratingIcon.className = 'weak-icon';
        ratingIcon.innerHTML = '●'; // Red circle for weak
        ratingIcon.style.fontSize = '1.6em'; // Bigger icon
      }
      
      ratingCell.appendChild(ratingIcon);
      
      // Add cells to row
      row.appendChild(rankCell);
      row.appendChild(playerCell);
      row.appendChild(teamCell);
      row.appendChild(ratingCell);
      
      // Add row to table body
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    categoryDiv.appendChild(table);
    resultsContainer.appendChild(categoryDiv);
  });
  
  // Update the "last updated" date
  document.getElementById('updateDate').textContent = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
