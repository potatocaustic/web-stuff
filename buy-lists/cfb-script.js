document.addEventListener('DOMContentLoaded', function () {
    // --- NEW: Navigation menu toggle script ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show-menu');
        });
    }

    // Fetch the team and player data from the JSON file
    fetch('cfbteamsData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(teamsData => {
            const featuredTeams = ["Texas", "Georgia", "Alabama", "Ohio State", "Penn State", "Notre Dame", "Oregon", "Tennessee", "Clemson"];
            const featuredTeamsContainer = document.getElementById('featured-teams');
            const teamSelectionContainer = document.getElementById('team-selection-list');
            const sortedTeams = teamsData.sort((a, b) => a.name.localeCompare(b.name));

            sortedTeams.forEach(team => {
                if (team.name === "FA") return;
                const teamId = `team-${team.name.replace(/\s+/g, '-')}`;
                const teamLabel = document.createElement('label');
                teamLabel.className = 'flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 cursor-pointer';
                teamLabel.setAttribute('for', teamId);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = teamId;
                checkbox.value = team.name;
                checkbox.className = 'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 team-checkbox';

                const textNode = document.createElement('span');
                textNode.textContent = team.name;
                textNode.className = 'text-sm';

                teamLabel.appendChild(checkbox);
                teamLabel.appendChild(textNode);

                if (featuredTeams.includes(team.name)) {
                    featuredTeamsContainer.appendChild(teamLabel);
                } else {
                    teamSelectionContainer.appendChild(teamLabel);
                }
            });

            // --- NEW: Team selection limit validation ---
            const allCheckboxes = document.querySelectorAll('.team-checkbox');
            const errorElement = document.getElementById('team-limit-error');
            allCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const selectedCount = document.querySelectorAll('.team-checkbox:checked').length;
                    if (selectedCount > 5) {
                        checkbox.checked = false; // Prevent selection
                        errorElement.classList.remove('hidden');
                    } else {
                        errorElement.classList.add('hidden');
                    }
                });
            });

            // Search functionality
            const searchInput = document.getElementById('team-search');
            searchInput.addEventListener('input', function () {
                const filter = searchInput.value.toLowerCase();
                const labels = teamSelectionContainer.getElementsByTagName('label');
                Array.from(labels).forEach(label => {
                    const teamName = label.textContent.toLowerCase();
                    if (teamName.includes(filter)) {
                        label.style.display = "flex";
                    } else {
                        label.style.display = "none";
                    }
                });
            });

            // Build button event listener
            const buildButton = document.getElementById("buildButton");
            buildButton.addEventListener("click", () => buildRecommendationList(teamsData));
        })
        .catch(error => console.error("Error fetching teams data:", error));

    /**
     * Core logic to build the recommendation list
     * @param {Array} teamsData - The array of all team data.
     */
    function buildRecommendationList(teamsData) {
        const recommendationsList = document.getElementById("recommendationsList");
        recommendationsList.innerHTML = ""; // Clear previous recommendations

        const budgetInput = document.getElementById("budget").value;
        const budget = parseFloat(budgetInput.replace(/,/g, ''));

        if (isNaN(budget) || budget <= 0) {
            showError("Please enter a valid budget.");
            return;
        }

        const playerCost = 200;
        const maxPlayers = 70;
        const teamCost = 800;

        // --- REVISED: Budget and Player Selection Logic ---

        // 1. Get selected teams and calculate initial team cost
        const selectedTeams = [];
        document.querySelectorAll('.team-checkbox:checked').forEach(checkbox => {
            const teamData = teamsData.find(t => t.name === checkbox.value);
            if (teamData) selectedTeams.push(teamData);
        });

        const totalTeamCost = selectedTeams.length * teamCost;
        if (totalTeamCost > budget) {
            showError("Team selection cost exceeds your budget.");
            return;
        }

        // 2. Determine mandatory players and their cost
        const mandatoryPlayers = [];
        const addedPlayers = new Set();
        selectedTeams.forEach(team => {
            const playersToAddCount = budget >= 10000 ? 4 : 2;
            const topPlayers = team.players.sort((a, b) => a.Rank - b.Rank).slice(0, playersToAddCount);
            topPlayers.forEach(player => {
                if (!addedPlayers.has(player.Name)) {
                    mandatoryPlayers.push({ ...player, Team: team.name });
                    addedPlayers.add(player.Name);
                }
            });
        });
        
        const mandatoryPlayerCost = mandatoryPlayers.length * playerCost;
        const initialTotalCost = totalTeamCost + mandatoryPlayerCost;

        if (initialTotalCost > budget) {
            showError("Cost of teams and required players exceeds your budget.");
            return;
        }

        // 3. Calculate remaining budget and how many filler players can be afforded
        const remainingBudgetForFillers = budget - initialTotalCost;
        let numberOfFillersToAdd = Math.floor(remainingBudgetForFillers / playerCost);

        // 4. Build final player list, starting with mandatory players
        let recommendedPlayers = [...mandatoryPlayers];

        // 5. Add filler players from all teams based on rank
        const allPlayers = teamsData.flatMap(team => team.players.map(p => ({ ...p, Team: team.name })));
        const sortedAllPlayers = allPlayers.sort((a, b) => a.Rank - b.Rank);

        for (const player of sortedAllPlayers) {
            if (numberOfFillersToAdd <= 0 || recommendedPlayers.length >= maxPlayers) break;
            
            if (!addedPlayers.has(player.Name)) {
                recommendedPlayers.push(player);
                addedPlayers.add(player.Name);
                numberOfFillersToAdd--;
            }
        }
        
        // 6. Display results
        displayResults(recommendedPlayers, selectedTeams.length);
    }

    /**
     * Displays an error message in the results list.
     * @param {string} message - The error message to display.
     */
    function showError(message) {
        const recommendationsList = document.getElementById("recommendationsList");
        const errorItem = document.createElement("li");
        errorItem.textContent = message;
        errorItem.className = "text-center py-16 text-red-500";
        recommendationsList.innerHTML = "";
        recommendationsList.appendChild(errorItem);
        document.getElementById("totalCost").textContent = `Total Cost: 0 Rax`;
    }

    /**
     * Renders the final list of players and total cost.
     * @param {Array} players - The final list of players to recommend.
     * @param {number} teamCount - The number of teams selected.
     */
    function displayResults(players, teamCount) {
        const recommendationsList = document.getElementById("recommendationsList");
        const placeholder = document.getElementById("placeholder");
        
        if (players.length === 0) {
            recommendationsList.innerHTML = `<li id="placeholder" class="text-center py-16 text-gray-500">Your list will appear here once generated.</li>`;
        } else {
            players.forEach((player, index) => {
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

        const finalTotalCost = (800 * teamCount) + (players.length * 200);
        document.getElementById("totalCost").textContent = `Total Cost: ${finalTotalCost.toLocaleString()} Rax`;

        let csvButton = document.getElementById("csvButton");
        if (!csvButton) {
            csvButton = document.createElement('button');
            csvButton.id = "csvButton";
            csvButton.textContent = 'Download as CSV';
            csvButton.className = "w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500";
            document.getElementById("buttonContainer").appendChild(csvButton);
        }
        csvButton.onclick = () => downloadCSV(players);
    }

    /**
     * Downloads the recommended player list as a CSV file.
     * @param {Array} players - The array of recommended player objects.
     */
    function downloadCSV(players) {
        if (players.length === 0) return;
        const header = ["Rank", "Player Name", "Team"];
        const rows = players.map((player, index) => [index + 1, `"${player.Name}"`, player.Team]);
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
