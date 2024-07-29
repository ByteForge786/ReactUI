import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DateSelector from './DateSelector';
import QuestionInput from './QuestionInput';
import ChatMessage from './ChatMessage';
import SampleQuestions from './SampleQuestions';
import DataSchema from './DataSchema';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSessionId();
  }, []);

  const fetchSessionId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/session_id`);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Error fetching session ID:', error);
    }
  };

  const handleQuestionSubmit = async (question) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate_sql`, {
        question: question,
        date_range: dateRange
      });
      const newChatEntry = {
        question: question,
        sql_query: response.data.sql_query,
        result: response.data.result,
        totalRecords: response.data.total_records,
        totalPages: response.data.total_pages,
        currentPage: response.data.current_page
      };
      setChatHistory([...chatHistory, newChatEntry]);
    } catch (error) {
      console.error('Error generating SQL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (question, feedbackType) => {
    try {
      await axios.post(`${API_BASE_URL}/feedback`, {
        question: question,
        feedback_type: feedbackType
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/logo.png" alt="NhanceBot Logo" className="App-logo" />
        <h1>NhanceBot</h1>
      </header>
      <main className="App-main">
        <p className="App-description">
          NhanceBot is an AI-powered Data Insight tool designed to help you 
          interact with your Snowflake data warehouse using natural language.
        </p>
        <DateSelector onDateRangeChange={setDateRange} />
        <DataSchema />
        <div className="chat-container">
          {chatHistory.map((entry, index) => (
            <ChatMessage
              key={index}
              question={entry.question}
              sqlQuery={entry.sql_query}
              result={entry.result}
              totalRecords={entry.totalRecords}
              totalPages={entry.totalPages}
              currentPage={entry.currentPage}
              onFeedback={(feedbackType) => handleFeedback(entry.question, feedbackType)}
            />
          ))}
        </div>
        <QuestionInput onSubmit={handleQuestionSubmit} isLoading={isLoading} />
        <SampleQuestions onQuestionClick={handleQuestionSubmit} />
      </main>
    </div>
  );
}

export default App;
