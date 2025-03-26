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

        // Set up the Build My List button
        const buildButton = document.getElementById("buildButton");
        const buttonContainer = document.getElementById("buttonContainer"); // A container for both buttons
        buildButton.addEventListener("click", function () {
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

          if (remainingBudget < 0) return;

          const remainingPlayers = teamsData.filter(team => team.name !== "FA").flatMap(team => team.players);
          const sortedRemainingPlayers = remainingPlayers.sort((a, b) => a.Rank - b.Rank);

          const remainingPlayerCount = Math.floor(remainingBudget / playerCost);

          // Add remaining players (up to 70 in total)
          for (let i = 0; i < sortedRemainingPlayers.length; i++) {
            if (recommendedPlayers.length < maxPlayers && i < remainingPlayerCount) {
              recommendedPlayers.push(sortedRemainingPlayers[i]);
            }
          }

          // Ensure no more than 70 players are selected
          if (recommendedPlayers.length > maxPlayers) {
            recommendedPlayers.length = maxPlayers;
          }

          // Display recommended buys with numbering
          recommendedPlayers.forEach((player, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${index + 1}. ${player.Name}`; 
            recommendationsList.appendChild(listItem);
          });

          // Calculate the total cost again: (800 * number of teams) + (200 * number of players)
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
            csvButton.addEventListener('click', function () {
              downloadCSV(recommendedPlayers);
            });
            
            // Insert the CSV button next to the Build My List button
            buttonContainer.appendChild(csvButton);
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
