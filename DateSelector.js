import React, { useState } from 'react';

function DateSelector({ onDateRangeChange }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDateChange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 60) {
        onDateRangeChange({ startDate: start, endDate: end });
      } else {
        alert("The difference between start and end date cannot exceed 2 months.");
      }
    }
  };

  return (
    <div className="date-selector">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button onClick={handleDateChange}>Set Date Range</button>
    </div>
  );
}

export default DateSelector;
