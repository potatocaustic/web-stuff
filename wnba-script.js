// Create a lookup object for team names to make matching more reliable
const TEAM_NAMES = {
  "LV": "Las Vegas Aces",
  "Ind": "Indiana Fever",
  "NY": "New York Liberty",
  "Min": "Minnesota Lynx",
  "Dal": "Dallas Wings",
  "Phx": "Phoenix Mercury",
  "LA": "Los Angeles Sparks",
  "Chi": "Chicago Sky",
  "Sea": "Seattle Storm",
  "Atl": "Atlanta Dream",
  "Conn": "Connecticut Sun",
  "Wsh": "Washington Mystics",
  "GSV": "Golden State Valkyries"
};

// Fetch the team and player data from the JSON file
fetch('wnba-data.json')
  .then(response => response.json())
  .then(teamsData => {
    console.log("Teams data loaded:", teamsData);
    
    // Populate the team selection dynamically
    const teamSelectionContainer = document.querySelector('.team-selection');
    teamsData.forEach((team, index) => {
      // Create a checkbox for each team with full name
      const teamLabel = document.createElement('label');
      const checkbox = document.createElement('input');
      
      checkbox.type = 'checkbox';
      checkbox.id = `team${index + 1}`; // Unique ID for each team
      teamLabel.appendChild(checkbox);
      
      // Get the full team name from our lookup object
      const teamFullName = TEAM_NAMES[team.name] || team.name;
      
      const textNode = document.createTextNode(` ${teamFullName}`); // Display full team name
      teamLabel.appendChild(textNode);
      teamSelectionContainer.appendChild(teamLabel);
      teamSelectionContainer.appendChild(document.createElement('br'));
    });

    // Set up the Build My List button
    const buildButton = document.getElementById("buildButton");
    const buttonContainer = document.getElementById("buttonContainer"); // A container for both buttons
    buildButton.addEventListener("click", function() {
      // Clear the existing recommended buys list before creating a new one
      const recommendationsList = document.getElementById("recommendationsList");
      recommendationsList.innerHTML = ""; // Clear previous recommendations

      // Get the budget value, remove commas, and convert to number
      const budgetInput = document.getElementById("budget").value;
      const budget = parseFloat(budgetInput.replace(/,/g, '')); // Remove commas

      // If the budget is not a valid number, exit early
      if (isNaN(budget) || budget <= 0) {
        alert("Please enter a valid budget.");
        return;
      }

      const selectedTeams = [];
      let totalCost = 0;
      let playerCost = 200;
      let maxPlayers = 50; // Changed maximum players from 70 to 50
      const playersPerTeam = 3; // Changed from 5 to 3 players per team

      // Check which teams are selected
      teamsData.forEach((team, index) => {
        const checkbox = document.getElementById(`team${index + 1}`);
        if (checkbox && checkbox.checked) {
          selectedTeams.push(team);
          totalCost += 800; // Each team costs 800
        }
      });

      // Ensure budget is not exceeded by the team selection
      if (totalCost > budget) {
        alert("Your team selection exceeds your budget.");
        return;
      }

      // Use a Set to keep track of already added players (prevents duplicates)
      const addedPlayers = new Set();
      let recommendedPlayers = [];

      // New approach for adding players by tier (first player from each team, then second, etc.)
      // This ensures even distribution if budget constraints prevent adding all 3 players per team
      for (let tier = 0; tier < playersPerTeam; tier++) {
        selectedTeams.forEach(team => {
          // Sort players in the team by rank
          const sortedPlayers = [...team.players].sort((a, b) => a.Rank - b.Rank);
          
          // If there's a player at this tier
          if (tier < sortedPlayers.length) {
            const player = sortedPlayers[tier];
            
            // Check if the player is already in the set (shouldn't happen with this approach, but a safety check)
            if (!addedPlayers.has(player.Name)) {
              // Add team name to the player object
              recommendedPlayers.push({
                ...player,
                Team: team.name
              });
              addedPlayers.add(player.Name);
              
              // Increment total cost
              totalCost += playerCost;
              
              // Check if we've exceeded budget
              if (totalCost > budget) {
                // If adding this player exceeds budget, remove them and stop adding more
                recommendedPlayers.pop();
                addedPlayers.delete(player.Name);
                totalCost -= playerCost;
                return; // Break out of the current forEach iteration
              }
            }
          }
        });
      }

      // If there's budget left, add more players
      let remainingBudget = budget - totalCost;

      // Collect all remaining players from the teams (that haven't been added yet)
      const remainingPlayers = teamsData.flatMap(team => 
        team.players
          .filter(player => !addedPlayers.has(player.Name))
          .map(player => ({
            ...player,
            Team: team.name
          }))
      );
      
      // Sort the remaining players by rank
      const sortedRemainingPlayers = remainingPlayers.sort((a, b) => a.Rank - b.Rank);

      // Calculate how many more players we can add with the remaining budget
      const remainingPlayerCount = Math.floor(remainingBudget / playerCost);

      // Add remaining players until we hit the budget or the max player count
      for (let i = 0; i < sortedRemainingPlayers.length && i < remainingPlayerCount; i++) {
        const player = sortedRemainingPlayers[i];
        if (recommendedPlayers.length < maxPlayers && !addedPlayers.has(player.Name)) {
          recommendedPlayers.push(player);
          addedPlayers.add(player.Name);
          totalCost += playerCost;
        }
        
        // Stop if we've reached the maximum player count
        if (recommendedPlayers.length >= maxPlayers) {
          break;
        }
      }

      // Sort all recommended players by rank
      recommendedPlayers.sort((a, b) => a.Rank - b.Rank);

      // Display recommended buys with numbering and team name
      recommendedPlayers.forEach((player, index) => {
        const listItem = document.createElement("li");
        const teamFullName = TEAM_NAMES[player.Team] || player.Team;
        listItem.textContent = `${index + 1}. ${player.Name} (${teamFullName})`; 
        recommendationsList.appendChild(listItem);
      });

      // Calculate the total cost: (800 * number of teams) + (200 * number of players)
      const totalTeamCost = 800 * selectedTeams.length;
      const totalPlayerCost = recommendedPlayers.length * playerCost;
      const finalTotalCost = totalTeamCost + totalPlayerCost;

      // Display the total cost at the end of the list
      const totalCostItem = document.createElement("li");
      totalCostItem.textContent = `Total Cost: ${finalTotalCost} Rax`;  // Show total cost
      recommendationsList.appendChild(totalCostItem);

      // Check if CSV button already exists, if so, do not create a new one
      let csvButton = document.getElementById("csvButton");
      if (!csvButton) {
        // Create a CSV button if it does not already exist
        csvButton = document.createElement('button');
        csvButton.id = "csvButton";
        csvButton.textContent = 'Download CSV';
        csvButton.addEventListener('click', function() {
          downloadCSV(recommendedPlayers);
        });
        
        // Insert the CSV button next to the Build My List button
        buttonContainer.appendChild(csvButton);
      }
    });
  })
  .catch(error => {
    console.error("Error fetching teams data:", error);
    // Display error on page
    const teamSelectionContainer = document.querySelector('.team-selection');
    teamSelectionContainer.innerHTML = '<p style="color: red;">Error loading team data. Please check console for details.</p>';
  });

// Function to download the recommended player list as a CSV file
function downloadCSV(players) {
  // Create CSV data (header + rows of player names with team)
  const header = ["Player Name", "Team"];
  const rows = players.map(player => [player.Name, TEAM_NAMES[player.Team] || player.Team]);

  // Create CSV content by joining rows with commas and separating each row with a new line
  let csvContent = header.join(",") + "\n";
  rows.forEach(row => {
    csvContent += row.join(",") + "\n";
  });

  // Create a Blob object containing the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a download link and trigger the download
  const link = document.createElement("a");
  if (link.download !== undefined) {  // Ensure download attribute is supported
    const fileName = "recommended_wnba_players.csv";
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", fileName);
    link.click();  // Trigger the download
  }
}
