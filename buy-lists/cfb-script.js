document.addEventListener('DOMContentLoaded', function () {
    // Fetch the team and player data from the JSON file
    fetch('cfbteamsData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(teamsData => {
            // These are the teams that will be displayed by default
            const featuredTeams = ["Texas", "Georgia", "Alabama", "Ohio State", "Penn State", "Notre Dame", "Oregon", "Tennessee", "Clemson"];
            
            const featuredTeamsContainer = document.getElementById('featured-teams');
            const teamSelectionContainer = document.getElementById('team-selection-list');

            // Sort teams alphabetically for the searchable list
            const sortedTeams = teamsData.sort((a, b) => a.name.localeCompare(b.name));

            // Populate the team selection checkboxes
            sortedTeams.forEach(team => {
                if (team.name === "FA") return; // Skip "FA" team if it exists

                const teamId = `team-${team.name.replace(/\s+/g, '-')}`;
                const teamLabel = document.createElement('label');
                teamLabel.className = 'flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 cursor-pointer';
                teamLabel.setAttribute('for', teamId);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = teamId;
                checkbox.value = team.name;
                checkbox.className = 'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500';

                const textNode = document.createElement('span');
                textNode.textContent = team.name;
                textNode.className = 'text-sm';
                
                teamLabel.appendChild(checkbox);
                teamLabel.appendChild(textNode);

                // Add to the appropriate container
                if (featuredTeams.includes(team.name)) {
                    featuredTeamsContainer.appendChild(teamLabel);
                } else {
                    teamSelectionContainer.appendChild(teamLabel);
                }
            });
            
            // Search functionality
            const searchInput = document.getElementById('team-search');
            searchInput.addEventListener('input', function() {
                const filter = searchInput.value.toLowerCase();
                const labels = teamSelectionContainer.getElementsByTagName('label');
                Array.from(labels).forEach(label => {
                    const teamName = label.textContent.toLowerCase();
                    if (teamName.includes(filter)) {
                        label.style.display = "";
                    } else {
                        label.style.display = "none";
                    }
                });
            });

            // Set up the Build My List button
            const buildButton = document.getElementById("buildButton");
            buildButton.addEventListener("click", function () {
                buildRecommendationList(teamsData);
            });
        })
        .catch(error => console.error("Error fetching teams data:", error));

    /**
     * Core logic to build the recommendation list
     * @param {Array} teamsData - The array of all team data.
     */
    function buildRecommendationList(teamsData) {
        const recommendationsList = document.getElementById("recommendationsList");
        const placeholder = document.getElementById("placeholder");
        recommendationsList.innerHTML = ""; // Clear previous recommendations
        
        // Get budget and validate
        const budgetInput = document.getElementById("budget").value;
        const budget = parseFloat(budgetInput.replace(/,/g, ''));

        if (isNaN(budget) || budget <= 0) {
            const errorItem = document.createElement("li");
            errorItem.textContent = "Please enter a valid budget.";
            errorItem.className = "text-center py-16 text-red-500";
            recommendationsList.appendChild(errorItem);
            return;
        }
        
        // Find selected teams
        const selectedTeams = [];
        let totalCost = 0;
        const playerCost = 200;
        const maxPlayers = 70;

        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const teamData = teamsData.find(t => t.name === checkbox.value);
                if (teamData) {
                    selectedTeams.push(teamData);
                    totalCost += 800; // Each team costs 800
                }
            }
        });

        // Early exit if team cost exceeds budget
        if (totalCost > budget) {
            const errorItem = document.createElement("li");
            errorItem.textContent = "Team selection cost exceeds your budget.";
            errorItem.className = "text-center py-16 text-red-500";
            recommendationsList.appendChild(errorItem);
            return;
        }

        const addedPlayers = new Set();
        const recommendedPlayers = [];

        // Add top players from selected teams
        selectedTeams.forEach(team => {
            const playersToAddCount = budget >= 10000 ? 4 : 2;
            const topPlayers = team.players.sort((a, b) => a.Rank - b.Rank).slice(0, playersToAddCount);
            topPlayers.forEach(player => {
                if (!addedPlayers.has(player.Name)) {
                    recommendedPlayers.push({ ...player, Team: team.name });
                    addedPlayers.add(player.Name);
                }
            });
        });
        
        // Update cost and remaining budget
        totalCost += recommendedPlayers.length * playerCost;
        let remainingBudget = budget - totalCost;

        if (remainingBudget < 0) {
             const errorItem = document.createElement("li");
            errorItem.textContent = "Cost of required players from selected teams exceeds budget.";
            errorItem.className = "text-center py-16 text-red-500";
            recommendationsList.appendChild(errorItem);
            return;
        }

        // Add remaining players from all teams based on rank
        const allPlayers = teamsData.flatMap(team => team.players.map(p => ({ ...p, Team: team.name })));
        const sortedAllPlayers = allPlayers.sort((a, b) => a.Rank - b.Rank);

        const remainingPlayerCount = Math.floor(remainingBudget / playerCost);
        
        for (const player of sortedAllPlayers) {
            if (recommendedPlayers.length >= maxPlayers || recommendedPlayers.length >= (Math.floor(remainingBudget / playerCost) + addedPlayers.size)) break;
            if (!addedPlayers.has(player.Name)) {
                recommendedPlayers.push(player);
                addedPlayers.add(player.Name);
            }
        }
        
        // Ensure we don't exceed max players
        if (recommendedPlayers.length > maxPlayers) {
            recommendedPlayers.length = maxPlayers;
        }

        // Display recommended buys
        if (recommendedPlayers.length === 0) {
             if (placeholder) placeholder.style.display = 'block';
        } else {
            if (placeholder) placeholder.style.display = 'none';
            recommendedPlayers.forEach((player, index) => {
                const listItem = document.createElement("li");
                listItem.className = "flex justify-between items-center py-3 px-2";
                listItem.innerHTML = `
                    <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-500 w-8">${index + 1}.</span>
                        <span class="font-semibold text-gray-800">${player.Name}</span>
                    </div>
                    <span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">${player.Team}</span>
                `;
                recommendationsList.appendChild(listItem);
            });
        }
        
        // Calculate and display final total cost
        const finalTotalCost = (800 * selectedTeams.length) + (recommendedPlayers.length * playerCost);
        document.getElementById("totalCost").textContent = `Total Cost: ${finalTotalCost.toLocaleString()} Rax`;

        // Add or update the CSV download button
        let csvButton = document.getElementById("csvButton");
        if (!csvButton) {
            csvButton = document.createElement('button');
            csvButton.id = "csvButton";
            csvButton.textContent = 'Download as CSV';
            csvButton.className = "w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500";
            document.getElementById("buttonContainer").appendChild(csvButton);
        }
        // Always update the event listener to capture the current list
        csvButton.onclick = function () {
            downloadCSV(recommendedPlayers);
        };
    }

    /**
     * Function to download the recommended player list as a CSV file
     * @param {Array} players - The array of recommended player objects.
     */
    function downloadCSV(players) {
        if (players.length === 0) return;

        const header = ["Rank", "Player Name", "Team"];
        const rows = players.map((player, index) => [index + 1, player.Name, player.Team]);

        let csvContent = "data:text/csv;charset=utf-8," + header.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "cfb_recommended_buys.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
