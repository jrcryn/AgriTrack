const monthsAndYear = () => {
    const months = [];
    const date = new Date();
    const year = date.getFullYear(); // Get current year
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(year, i).toLocaleString('default', { month: 'long' });
      months.push(`${monthName} ${year}`);
    }
    return months;
  };

export default monthsAndYear;