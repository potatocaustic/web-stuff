document.getElementById("buildButton").addEventListener("click", function () {
  const budget = parseFloat(document.getElementById("budget").value);
  const selectedTeams = [];

  // Check which teams are selected
  if (document.getElementById("team1").checked) selectedTeams.push("Team 1");
  if (document.getElementById("team2").checked) selectedTeams.push("Team 2");
  if (document.getElementById("team3").checked) selectedTeams.push("Team 3");
  if (document.getElementById("team4").checked) selectedTeams.push("Team 4");
  if (document.getElementById("team5").checked) selectedTeams.push("Team 5");

  // Team cost and player cost
  const teamCost = 800;
  const playerCost = 200;
  let totalCost = selectedTeams.length * teamCost;

  // Ensure the budget is not exceeded
  if (totalCost > budget) {
    alert("Your selected teams exceed your budget. Please select fewer teams.");
    return;
  }

  // Sample player data (you can later replace this with a dynamic dataset)
  const players = [
    { name: "Player 1", team: "Team 1" },
    { name: "Player 2", team: "Team 1" },
    { name: "Player 3", team: "Team 1" },
    { name: "Player 4", team: "Team 2" },
    { name: "Player 5", team: "Team 2" },
    { name: "Player 6", team: "Team 3" },
    { name: "Player 7", team: "Team 4" },
    { name: "Player 8", team: "Team 5" },
  ];

  // Get top players from selected teams
  const recommendedPlayers = [];
  selectedTeams.forEach(team => {
    players.forEach(player => {
      if (player.team === team) {
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
    listItem.textContent = `${player.name} (${player.team})`;
    recommendationsList.appendChild(listItem);
  });

  // If there's remaining budget, alert the user
  if (remainingBudget >= 0) {
    alert(`Your team is ready! Remaining budget: $${remainingBudget}`);
  } else {
    alert("You have exceeded your budget!");
  }
});
