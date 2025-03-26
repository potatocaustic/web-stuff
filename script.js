// Fetch the team and player data from the JSON file
fetch('teamsData.json')
  .then(response => response.json())
  .then(teamsData => {
    // Fetch the latest builderTeams_abbr_fullnames_v2.json file
    fetch('builderTeams_abbr_fullnames_v2.json')  // Updated to the new JSON
      .then(response => response.json())
      .then(builderTeams => {
        // Populate the team selection dynamically
        const teamSelectionContainer = document.querySelector('.team-selection');
        teamsData.forEach((team, index) => {
          // Skip "FA" team
          if (team.name === "FA") return;

          // Create a checkbox for each team with full name
          const teamLabel = document.createElement('label');
          const checkbox = document.createElement('input');
          
          checkbox.type = 'checkbox';
          checkbox.id = `team${index + 1}`; // Unique ID for each team
          teamLabel.appendChild(checkbox);
          
          const textNode = document.createTextNode(` ${team.name}`); // Display full team name
          teamLabel.appendChild(textNode);
          teamSelectionContainer.appendChild(teamLabel);
          teamSelectionContainer.appendChild(document.createElement('br'));
        });

        // Set up the Build My Team button
        const buildButton = document.getElementById("buildButton");
        const buttonContainer = document.getElementById("buttonContainer"); // A container for both buttons
        buildButton.addEventListener("click", function () {
          // Clear the existing recommended buys list before creating a new one
          const recommendationsList = document.getElementById("recommendationsList");
          recommendationsList.innerHTML = ""; // Clear previous recommendations

          const budget = parseFloat(document.getElementById("budget").value);
          const selectedTeams = [];
          let totalCost = 0;
          let totalPlayers = 0;
          let playerCost = 200;
          let maxPlayers = 70;

          // Check which teams are selected
          teamsData.forEach((team, index) => {
            const checkbox = document.getElementById(`team${index + 1}`);
            if (checkbox && checkbox.checked && team.name !== "FA") {  // Exclude "FA" team
              selectedTeams.push(team);
              totalCost += 800; // Each team costs 800
              totalPlayers += (budget >= 10000) ? 5 : 1; // For each selected team, you must buy 5 players (or 1/2 depending on budget)
            }
          });

          // Ensure budget is not exceeded by the team selection
          if (totalCost > budget) return; // Skip if total team cost exceeds budget

          // Add players from selected teams
          const recommendedPlayers = [];
          selectedTeams.forEach(team => {
            // Add the top 5 or 2 players depending on budget
            const topPlayers = team.players.sort((a, b) => a.Rank - b.Rank).slice(0, budget >= 10000 ? 5 : 2);
            topPlayers.forEach(player => {
              recommendedPlayers.push(player);
            });
          });

          // Subtract the cost of players from the remaining budget
          totalCost += recommendedPlayers.length * playerCost;
          let remainingBudget = budget - totalCost;

          // If remaining budget is invalid, return
          if (remainingBudget < 0) return;

          // Calculate how many more players can be added with the remaining budget
          const remainingPlayers = teamsData.filter(team => team.name !== "FA").flatMap(team => team.players);
          const sortedRemainingPlayers = remainingPlayers.sort((a, b) => a.Rank - b.Rank);

          // Calculate how many additional players can be selected
          const remainingPlayerCount = Math.floor(remainingBudget / playerCost);

          // Add remaining players (up to 70 in total)
          for (let i = 0; i < sortedRemainingPlayers.length; i++) {
            if (recommendedPlayers.length < maxPlayers && i < remainingPlayerCount) {
              recommendedPlayers.push(sortedRemainingPlayers[i]);
            }
          }

          // Ensure no more than 70 players are selected
          if (recommendedPlayers.length > maxPlayers) {
            recommendedPlayers.length = maxPlayers;  // Cap to 70 players
          }

          // Display recommended buys with numbering
          recommendedPlayers.forEach((player, index) => {
            const listItem = document.createElement("li");
            // Display player name with numbering (index + 1)
            listItem.textContent = `${index + 1}. ${player.Name}`;  // Add numbering to the player name
            recommendationsList.appendChild(listItem);
          });

          // Calculate the final remaining balance (after all players have been added)
          const totalPlayerCost = recommendedPlayers.length * playerCost;
          const finalRemainingBalance = budget - totalCost - totalPlayerCost;

          // Display the remaining balance at the end of the list
          const remainingBalanceItem = document.createElement("li");
          remainingBalanceItem.textContent = `Remaining Rax: ${finalRemainingBalance}`;  // Show remaining balance
          recommendationsList.appendChild(remainingBalanceItem);

          // Create a CSV button if there are recommended players
          if (recommendedPlayers.length > 0) {
            const csvButton = document.createElement('button');
            csvButton.textContent = 'Download CSV';
            csvButton.addEventListener('click', function () {
              downloadCSV(recommendedPlayers);
            });
            
            // Insert the CSV button next to the Build My Team button
            buttonContainer.appendChild(csvButton);  // Insert into the container
          }
        });
      })
      .catch(error => console.error("Error fetching builder teams data:", error));
  })
  .catch(error => console.error("Error fetching teams data:", error));

// Function to download the recommended player list as a CSV file
function downloadCSV(players) {
  // Create CSV data (header + rows of player names)
  const header = ["Player Name"];
  const rows = players.map(player => [player.Name]);

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
    const fileName = "recommended_buy_list.csv";
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", fileName);
    link.click();  // Trigger the download
  }
}

