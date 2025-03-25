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
          const budget = parseFloat(document.getElementById("budget").value);
          const selectedTeams = [];
          let totalCost = 0;

          // Check which teams are selected
          teamsData.forEach((team, index) => {
            const checkbox = document.getElementById(`team${index + 1}`);
            if (checkbox && checkbox.checked && team.name !== "FA") {  // Exclude "FA" team
              selectedTeams.push(team);
              totalCost += 800; // Each team costs 800
            }
          });

          // Team and player costs
          const playerCost = 200;
          // Ensure the budget is not exceeded
          if (totalCost > budget) {
            alert("Your selected teams exceed your budget. Please select fewer teams.");
            return;
          }

          // Get recommended players from selected teams
          const recommendedPlayers = [];
          selectedTeams.forEach(team => {
            team.players.forEach(player => {
              if (player.team !== "FA") { // Exclude players from "FA"
                recommendedPlayers.push(player);
              }
            });
          });

          // Calculate remaining budget for players
          totalCost += recommendedPlayers.length * playerCost;
          const remainingBudget = budget - totalCost;

          // Display recommended buys
          const recommendationsList = document.getElementById("recommendationsList");
          recommendationsList.innerHTML = ""; // Clear previous recommendations

          recommendedPlayers.forEach(player => {
            const listItem = document.createElement("li");
            listItem.textContent = `${player.name} (${player.rank})`;
            recommendationsList.appendChild(listItem);
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


