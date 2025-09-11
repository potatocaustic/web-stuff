import pandas as pd
import psycopg2
import re
from sqlalchemy import create_engine

# --- Configuration ---
CSV_FILE_PATH = 'cfbsched - Sheet1.csv'  # Path to your schedule CSV
DB_USER = 'postgres'
DB_PASSWORD = 'dHbS2UNXgzXy9g'
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'cfb_modeler_db'

# --- Helper Function ---
def clean_team_name(team_name):
    """Removes the rank prefix like (25) from a team name."""
    if isinstance(team_name, str):
        return re.sub(r'\(\d+\)\s*', '', team_name).strip()
    return team_name

# --- Database Connection ---
db_url = f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
engine = create_engine(db_url)

# --- Main Script ---
try:
    print(f"Reading schedule data from {CSV_FILE_PATH}...")
    df = pd.read_csv(CSV_FILE_PATH)

    # Clean the DataFrame
    df = df[['Wk', 'Date', 'Day', 'Team1', 'Team2']].copy()
    df.columns = ['week', 'game_date', 'game_day', 'team1', 'team2']
    
    # Convert date column to datetime objects
    df['game_date'] = pd.to_datetime(df['game_date'], errors='coerce')
    
    # Apply the cleaning function to team names
    df['team1'] = df['team1'].apply(clean_team_name)
    df['team2'] = df['team2'].apply(clean_team_name)
    
    df.dropna(subset=['game_date'], inplace=True)

    # Write data to PostgreSQL
    print("Writing data to the 'schedule' table...")
    # 'replace' will drop the table if it exists and create a new one. Use 'append' if you want to add to it.
    df.to_sql('schedule', engine, if_exists='replace', index=False)
    
    print("Successfully populated the schedule table.")

except Exception as e:
    print(f"An error occurred: {e}")