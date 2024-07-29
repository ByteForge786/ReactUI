import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

function ChatMessage({ question, sqlQuery, result, totalRecords, totalPages, currentPage, onFeedback }) {
  const [page, setPage] = useState(currentPage);
  const [currentResult, setCurrentResult] = useState(result);

  const handlePageChange = async (newPage) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/generate_sql`, {
        question: question,
        page: newPage,
        page_size: 10 // Adjust as needed
      });
      setCurrentResult(response.data.result);
      setPage(newPage);
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  };

  return (
    <div className="chat-message">
      <div className="user-message">
        <span className="avatar">👤</span>
        <p>{question}</p>
      </div>
      <div className="assistant-message">
        <span className="avatar">🤖</span>
        <pre><code>{sqlQuery}</code></pre>
        <table className="result-table">
          <thead>
            <tr>
              {Object.keys(currentResult[0] || {}).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentResult.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
        </div>
        <p>Total Records: {totalRecords}</p>
        <div className="feedback-buttons">
          <button onClick={() => onFeedback('upvote')}>👍 Upvote</button>
          <button onClick={() => onFeedback('downvote')}>👎 Downvote</button>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
