// Fetch the team and player data from the JSON file
fetch('teamsData.json')
  .then(response => response.json())
  .then(teamsData => {
    // Fetch the latest builderTeams_abbr_fullnames_v2.json file
    fetch('builderTeams_abbr_fullnames_v2.json')  // Updated to the new JSON
      .then(response => response.json())
      .then(builderTeams => {
        // Map team abbreviations to full names
        const teamNamesMap = {};
        builderTeams.forEach(team => {
          teamNamesMap[team.abbreviation] = team.fullName;  // Map abbreviation to full name
        });

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
          
          const textNode = document.createTextNode(` ${teamNamesMap[team.name] || team.name}`); // Display full team name
          teamLabel.appendChild(textNode);
          teamSelectionContainer.appendChild(teamLabel);
          teamSelectionContainer.appendChild(document.createElement('br'));
        });

        // Set up the Build My Team button
        document.getElementById("buildButton").addEventListener("click", function () {
          // Clear the existing recommended buys list before creating a new one
          const recommendationsList = document.getElementById("recommendationsList");
          recommendationsList.innerHTML = ""; // Clear previous recommendations

          const budget = parseFloat(document.getElementById("budget").value);
          const selectedTeams = [];
          let totalCost = 0;
          let totalPlayers = 0;

          // Check which teams are selected
          teamsData.forEach((team, index) => {
            const checkbox = document.getElementById(`team${index + 1}`);
            if (checkbox && checkbox.checked && team.name !== "FA") {  // Exclude "FA" team
              selectedTeams.push(team);
              totalCost += 800; // Each team costs 800
              totalPlayers += 5; // For each selected team, you must buy 5 players
            }
          });

          // Team and player costs
          const playerCost = 200;

          // Ensure the budget is not exceeded and that no more than 5 teams are selected
          if (selectedTeams.length > 5) {
            alert("You can select no more than 5 teams.");
            return;
          }

          // Ensure no more than 70 players are selected
          if (totalPlayers > 70) {
            alert("You can select no more than 70 players.");
            return;
          }

          // Ensure budget is not exceeded by the team selection
          if (totalCost > budget) {
            alert("Your selected teams exceed your budget. Please select fewer teams.");
            return;
          }

          // Get recommended players from selected teams (top 5 players per team)
          const recommendedPlayers = [];
          selectedTeams.forEach(team => {
            const topPlayers = team.players.sort((a, b) => a.Rank - b.Rank).slice(0, 5); // Get top 5 players by rank
            topPlayers.forEach(player => {
              recommendedPlayers.push(player);
            });
          });

          // Calculate remaining budget after selecting team players
          totalCost += recommendedPlayers.length * playerCost;
          const remainingBudget = budget - totalCost;

          // If the budget is exceeded after selecting team players
          if (totalCost > budget) {
            alert("Your budget is exceeded after selecting the best players from your teams.");
            return;
          }

          // Add the best remaining players (excluding "FA" players) to fill the team
          const remainingPlayers = teamsData.filter(team => team.name !== "FA").flatMap(team => team.players);
          const sortedRemainingPlayers = remainingPlayers.sort((a, b) => a.Rank - b.Rank);
          
          // Add remaining players until the budget is exhausted or player limit is reached
          sortedRemainingPlayers.forEach(player => {
            if (recommendedPlayers.length < 70 && remainingBudget >= playerCost) {
              recommendedPlayers.push(player);
              totalCost += playerCost;
            }
          });

          // Display recommended buys
          recommendedPlayers.forEach(player => {
            // Ensure player data is correctly referenced (name and team)
            if (player && player.Name && player.team) {
              // Use the player team abbreviation to show the correct team abbreviation
              const teamAbbreviation = player.team || 'Unknown Team';
              const listItem = document.createElement("li");
              // Replace rank with team abbreviation
              listItem.textContent = `${player.Name} (${teamAbbreviation})`;  // Display player name and team abbreviation
              recommendationsList.appendChild(listItem);
            } else {
              console.warn(`Player data is missing for ${player}`);
            }
          });

          // If there's remaining budget, alert the user
          if (remainingBudget >= 0) {
            alert(`Your team is ready! Remaining budget: $${remainingBudget}`);
          } else {
            alert("You have exceeded your budget!");
          }
        });
      })
      .catch(error => console.error("Error fetching builder teams data:", error));
  })
  .catch(error => console.error("Error fetching teams data:", error));
