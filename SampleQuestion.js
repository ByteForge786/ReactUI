import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

function SampleQuestions({ onQuestionClick }) {
  const [sampleQuestions, setSampleQuestions] = useState([]);

  useEffect(() => {
    fetchSampleQuestions();
  }, []);

  const fetchSampleQuestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sample_questions`);
      setSampleQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching sample questions:', error);
    }
  };

  return (
    <div className="sample-questions">
      <h3>Sample questions you can ask:</h3>
      <ul>
        {sampleQuestions.map((question, index) => (
          <li key={index}>
            {question}
            <button onClick={() => onQuestionClick(question)}>Ask</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SampleQuestions;
