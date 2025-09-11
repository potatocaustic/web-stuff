document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('draft-form');
    const loader = document.getElementById('loader');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loader and hide previous results/errors
        loader.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating...';

        const formData = new FormData(form);

        try {
            const response = await fetch('/run_model', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An unknown error occurred.');
            }

            displayResults(data);

        } catch (error) {
            displayError(error.message);
        } finally {
            // Hide loader and re-enable button
            loader.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Lineup';
        }
    });

    function displayResults(data) {
        // Total Score
        document.getElementById('total-score').textContent = data.total_score;

        // Final Lineup Table
        const lineupTableBody = document.querySelector('#lineup-table tbody');
        lineupTableBody.innerHTML = '';
        data.final_lineup.forEach(player => {
            const row = `<tr>
                <td>${player.rank}</td>
                <td>${player.player_name}</td>
                <td>${player.type}</td>
                <td>${player.score}</td>
            </tr>`;
            lineupTableBody.innerHTML += row;
        });

        // All Considered Table
        const consideredTableBody = document.querySelector('#considered-table tbody');
        consideredTableBody.innerHTML = '';
        data.all_considered.forEach(player => {
            const row = `<tr>
                <td>${player.player_name}</td>
                <td>${player.type}</td>
                <td>${player.multiplier_bonus.toFixed(2)}</td>
            </tr>`;
            consideredTableBody.innerHTML += row;
        });

        resultsDiv.classList.remove('hidden');
    }

    function displayError(message) {
        errorDiv.textContent = `Error: ${message}`;
        errorDiv.classList.remove('hidden');
    }
});