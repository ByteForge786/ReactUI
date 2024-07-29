import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date
from typing import List, Optional
from utils import (
    init_csv, load_data, append_to_csv, generate_session_id,
    generate_sql, execute_query, handle_interaction, update_feedback
)

# Set up logging
logging.basicConfig(filename='app.log', level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

class Feedback(BaseModel):
    question: str
    feedback_type: str

class DateRange(BaseModel):
    start_date: date
    end_date: date

@app.on_event("startup")
async def startup_event():
    init_csv()

@app.post("/generate_sql")
async def generate_sql_endpoint(
    question: Question,
    date_range: DateRange,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    try:
        sql_response = generate_sql(question.question)
        result_df = execute_query(sql_response)
        
        # Calculate total pages
        total_records = len(result_df)
        total_pages = (total_records + page_size - 1) // page_size
        
        # Paginate the result
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_result = result_df.iloc[start_idx:end_idx]
        
        handle_interaction(question.question, sql_response)
        return {
            "sql_query": sql_response,
            "result": paginated_result.to_dict(orient="records"),
            "total_records": total_records,
            "total_pages": total_pages,
            "current_page": page
        }
    except Exception as e:
        logging.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your query")

@app.post("/feedback")
async def feedback_endpoint(feedback: Feedback):
    success = update_feedback(feedback.feedback_type, feedback.question)
    if success:
        return {"message": "Feedback updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update feedback")

@app.get("/session_id")
async def get_session_id():
    return {"session_id": generate_session_id()}

@app.get("/sample_data_schema")
async def get_sample_data_schema():
    return {
        "tables": [
            {"name": "CUSTOMERS", "columns": "customer_id, name, email, segment"},
            {"name": "ORDERS", "columns": "order_id, customer_id, order_date, total_amount"},
            {"name": "PRODUCTS", "columns": "product_id, name, category, price"},
            {"name": "SALES", "columns": "sale_id, product_id, quantity, revenue"}
        ]
    }

@app.get("/sample_questions")
async def get_sample_questions():
    return {
        "questions": [
            "What is the total revenue for each product category?",
            "Who are the top 5 customers by sales volume?",
            "What's the average order value by month?",
            "Which regions have seen the highest growth in the last quarter?",
            "What's the distribution of customer segments across different product lines?"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
