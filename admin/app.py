import pandas as pd
import psycopg2
import re
import requests
import time
from flask import Flask, render_template, request, jsonify
from sqlalchemy import create_engine

# --- Flask & Database Configuration ---
app = Flask(__name__)
DB_USER = 'postgres'
DB_PASSWORD = 'dHbS2UNXgzXy9g'
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'cfb_modeler_db'
db_url = f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
engine = create_engine(db_url)

# --- API Configuration ---
API_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
API_DELAY = 1  # seconds between requests

# --- Helper Functions ---
def process_uploads(qb_file, non_qb_file, game_date):
    """Cleans uploaded CSVs and writes them to the database."""
    try:
        # Process QB data
        qb_df = pd.read_csv(qb_file, header=1)
        qb_df = qb_df[['Player Name', 'Team', 'Opp', 'Points']].copy()
        qb_df.columns = ['player_name', 'team', 'opponent', 'points']
        qb_df['game_date'] = game_date
        qb_df.to_sql('qb_projections', engine, if_exists='replace', index=False)

        # Process Non-QB data
        non_qb_df = pd.read_csv(non_qb_file, header=1)
        
        # Rename the second 'Points' column to 'PPRPoints'
        cols = pd.Series(non_qb_df.columns)
        for dup in non_qb_df.columns[non_qb_df.columns.duplicated()].unique():
            cols[non_qb_df.columns.get_loc(dup)] = [f"{dup}.{i}" if i != 0 else dup for i in range(non_qb_df.columns.value_counts()[dup])]
        non_qb_df.columns = cols
        non_qb_df.rename(columns={'Points.1': 'PPRPoints'}, inplace=True)
        
        # Calculate TotalTD and RushRecYds
        non_qb_df['TotalTD'] = non_qb_df['TD'] + non_qb_df['TD.1']
        non_qb_df['RushRecYds'] = non_qb_df['Yds'] + non_qb_df['Yds.1']
        
        non_qb_df = non_qb_df[['Player Name', 'Team', 'Pos', 'Opp', 'Points', 'PPRPoints', 'TotalTD', 'RushRecYds']].copy()
        non_qb_df.columns = ['player_name', 'team', 'pos', 'opponent', 'points', 'ppr_points', 'total_td', 'rush_rec_yds']
        non_qb_df['game_date'] = game_date
        non_qb_df.to_sql('non_qb_projections', engine, if_exists='replace', index=False)
        
        return True
    except Exception as e:
        print(f"Error processing uploads: {e}")
        return False

def get_player_pool(game_date):
    """Gets all players from teams playing on a specific date."""
    with engine.connect() as conn:
        teams_query = f"SELECT team1, team2 FROM schedule WHERE game_date = '{game_date}'"
        teams_df = pd.read_sql(teams_query, conn)
        
        if teams_df.empty:
            return pd.DataFrame()
            
        playing_teams = pd.concat([teams_df['team1'], teams_df['team2']]).unique()
        
        qb_query = f"SELECT * FROM qb_projections WHERE team = ANY(ARRAY{list(playing_teams)})"
        non_qb_query = f"SELECT * FROM non_qb_projections WHERE team = ANY(ARRAY{list(playing_teams)})"
        
        qbs = pd.read_sql(qb_query, conn)
        qbs['type'] = 'QB'
        
        non_qbs = pd.read_sql(non_qb_query, conn)
        non_qbs['type'] = 'Non-QB'
        
        return pd.concat([qbs, non_qbs], ignore_index=True)

# Replace your entire get_multiplier function with this one

def get_multiplier(player_name, game_date, force_api=False):
    """Fetches a player's multiplier from the DB or API."""
    with engine.connect() as conn:
        # 1. Check database first
        if not force_api:
            query = f"SELECT multiplier_bonus FROM player_multipliers WHERE player_name = '{player_name.replace("'", "''")}'"
            result = pd.read_sql(query, conn)
            if not result.empty:
                return result['multiplier_bonus'].iloc[0]

        # 2. If not in DB or if forced, fetch from API
        try:
            # For multi-word names, we search on the full name
            query_name = player_name.replace(' ', '%20')
            date_str = pd.to_datetime(game_date).strftime('%Y-%m-%d')
            url = f"https://api.real.vg/players/sport/ncaaf/search?day={date_str}&includeNoOneOption=false&query={query_name}&searchType=ratingLineup"

            time.sleep(API_DELAY) # Polite delay
            response = requests.get(url, headers=API_HEADERS)
            response.raise_for_status()
            data = response.json()

            if data['players']:
                multiplier = data['players'][0]['team']['multiplierBonus']
            else:
                print(f"Player '{player_name}' not found in API. Defaulting to 0.")
                multiplier = 0.0


            # 3. Store in DB for future use
            # Note: Using parameterized queries is safer
            from sqlalchemy.sql import text
            insert_query = text("""
                INSERT INTO player_multipliers (player_name, multiplier_bonus)
                VALUES (:name, :mult)
                ON CONFLICT (player_name) DO UPDATE SET multiplier_bonus = :mult;
            """)
            conn.execute(insert_query, {'name': player_name, 'mult': multiplier})
            # The commit is implicit with engine.connect() context manager
            return multiplier
        except Exception as e:
            print(f"Could not fetch multiplier for {player_name}: {e}. Defaulting to 0.")
            return 0.0

def run_optimizer(player_pool):
    """Runs the draft optimization algorithm."""
    # Step 6: Calculate RealScore
    player_pool['realscore'] = 0.0
    qb_mask = player_pool['type'] == 'QB'
    non_qb_mask = player_pool['type'] == 'Non-QB'
    player_pool.loc[qb_mask, 'realscore'] = (0.183 * player_pool.loc[qb_mask, 'points']) + 0.0985
    player_pool.loc[non_qb_mask, 'realscore'] = (0.24 * player_pool.loc[non_qb_mask, 'ppr_points']) + 0.139
    
    # Calculate weighted scores for each rank
    rank_multipliers = [2.0, 1.8, 1.6, 1.4, 1.2]
    for i, mult in enumerate(rank_multipliers):
        player_pool[f'rank_{i+1}_score'] = (mult + player_pool['multiplier_bonus']) * player_pool['realscore']

    # --- Run Draft ---
    selected_players_info = []
    available_players = player_pool.copy()
    all_considered = set()
    total_score = 0

    for i in range(5):
        rank = i + 1
        score_col = f'rank_{rank}_score'
        
        if available_players.empty:
            break
            
        # Find best player for this rank
        best_player_idx = available_players[score_col].idxmax()
        best_player = available_players.loc[best_player_idx]
        
        # Store top 5 choices for context
        top_choices = available_players.nlargest(5, score_col)
        
        selected_players_info.append({
            'rank': rank,
            'player_name': best_player['player_name'],
            'score': round(best_player[score_col], 2),
            'type': best_player['type']
        })
        
        total_score += best_player[score_col]
        all_considered.update(top_choices['player_name'].tolist())
        
        # Remove selected player from pool
        available_players.drop(best_player_idx, inplace=True)
        
    return selected_players_info, round(total_score, 2), list(all_considered)

# --- Flask Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run_model', methods=['POST'])
def run_model():
    game_date = request.form.get('game_date')
    qb_file = request.files.get('qb_file')
    non_qb_file = request.files.get('non_qb_file')

    if not all([game_date, qb_file, non_qb_file]):
        return jsonify({'error': 'Missing date or file uploads.'}), 400

    # 1. Process uploads
    if not process_uploads(qb_file, non_qb_file, game_date):
        return jsonify({'error': 'Failed to process uploaded files.'}), 500

    # 2. Get initial player pool
    player_pool = get_player_pool(game_date)
    if player_pool.empty:
        return jsonify({'error': f'No games or players found for {game_date}.'}), 404
        
    # --- Optimizer & Verification Loop ---
    verified_players = set()
    max_reruns = 3
    for i in range(max_reruns):
        # Get multipliers for all players currently in the pool
        player_pool['multiplier_bonus'] = player_pool['player_name'].apply(lambda name: get_multiplier(name, game_date))
        
        # Run optimizer
        final_lineup, total_score, all_considered_list = run_optimizer(player_pool)
        
        # Verification check
        needs_rerun = False
        newly_considered = set(all_considered_list) - verified_players

        if not newly_considered:
            break # No new players to check, exit loop
        
        for player_name in newly_considered:
            current_multiplier = player_pool.loc[player_pool['player_name'] == player_name, 'multiplier_bonus'].iloc[0]
            # Force a re-fetch from the API
            new_multiplier = get_multiplier(player_name, game_date, force_api=True)
            
            if new_multiplier != current_multiplier:
                needs_rerun = True
            
            verified_players.add(player_name)
        
        if not needs_rerun:
            break # Multipliers are stable, exit loop
        else:
            print(f"Multiplier changes detected. Re-running optimizer (run {i+2})...")

    # Final list of all players with their verified multipliers
    final_considered_data = player_pool[player_pool['player_name'].isin(all_considered_list)][['player_name', 'type', 'multiplier_bonus']].to_dict('records')

    return jsonify({
        'final_lineup': final_lineup,
        'total_score': total_score,
        'all_considered': final_considered_data
    })


if __name__ == '__main__':
    app.run(debug=True)