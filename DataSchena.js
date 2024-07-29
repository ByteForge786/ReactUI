import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

function DataSchema() {
  const [schema, setSchema] = useState([]);

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sample_data_schema`);
      setSchema(response.data.tables);
    } catch (error) {
      console.error('Error fetching schema:', error);
    }
  };

  return (
    <div className="data-schema">
      <h3>Sample Data Schema:</h3>
      <table>
        <thead>
          <tr>
            <th>Table</th>
            <th>Columns</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((table, index) => (
            <tr key={index}>
              <td>{table.name}</td>
              <td>{table.columns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataSchema;
