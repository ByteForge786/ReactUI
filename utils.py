import pandas as pd
import os
from datetime import datetime
import hashlib
import logging
import random

# Constants
CSV_FILE = 'user_interactions.csv'
MAX_RETRIES = 3

# Initialize CSV file
def init_csv():
    if not os.path.exists(CSV_FILE):
        df = pd.DataFrame(columns=['timestamp', 'question', 'result', 'upvote', 'downvote', 'session_id'])
        df.to_csv(CSV_FILE, index=False)

# Load CSV file
def load_data():
    for _ in range(MAX_RETRIES):
        try:
            data = pd.read_csv(CSV_FILE)
            return data
        except pd.errors.EmptyDataError:
            logging.warning(f"CSV file {CSV_FILE} is empty. Initializing with header.")
            init_csv()
        except Exception as e:
            logging.error(f"Error loading CSV: {str(e)}")
    return pd.DataFrame()  # Return empty DataFrame if all retries fail

# Append data to CSV
def append_to_csv(new_data):
    for _ in range(MAX_RETRIES):
        try:
            with open(CSV_FILE, 'a', newline='') as f:
                new_data.to_csv(f, header=f.tell()==0, index=False)
            return True
        except Exception as e:
            logging.error(f"Error appending to CSV: {str(e)}")
    return False

# Generate a session ID
def generate_session_id():
    return hashlib.md5(str(datetime.now()).encode()).hexdigest()

# Mock function for SQL generation (replace with actual implementation)
def generate_sql(question):
    return f"SELECT * FROM sample_table WHERE condition = '{question}';"

# Mock function for query execution (replace with actual implementation)
def execute_query(sql):
    # This is a mock implementation. Replace with actual query execution.
    # Generating a larger mock dataset for pagination demonstration
    num_rows = random.randint(50, 200)
    return pd.DataFrame({
        'Column1': [f'Data{i}' for i in range(num_rows)],
        'Column2': [random.randint(1, 1000) for _ in range(num_rows)],
        'Column3': [f'Category{random.choice(["A", "B", "C"])}' for _ in range(num_rows)]
    })

# Handle user interaction
def handle_interaction(question, result):
    new_data = pd.DataFrame({
        'timestamp': [datetime.now()],
        'question': [question.strip().replace('\n', ' ')],
        'result': [result.strip().replace('\n', ' ')],
        'upvote': [0],
        'downvote': [0],
        'session_id': [generate_session_id()]
    })
    append_to_csv(new_data)

# Update feedback
def update_feedback(feedback_type, question):
    for _ in range(MAX_RETRIES):
        try:
            data = pd.read_csv(CSV_FILE)
            if not data.empty:
                matching_rows = data[data['question'] == question]
                if not matching_rows.empty:
                    latest_index = matching_rows.index[-1]
                    data.loc[latest_index, feedback_type] = 1
                    data.to_csv(CSV_FILE, index=False)
                    logging.info(f"Updated {feedback_type} for question: {question}")
                    return True
                else:
                    logging.warning(f"No matching question found for feedback: {question}")
            else:
                logging.warning("CSV file is empty")
            return False
        except Exception as e:
            logging.error(f"Error updating feedback: {str(e)}")
    return False
