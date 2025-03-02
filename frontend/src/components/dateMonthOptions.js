// Helper function para sa pagcompute ng 15 days approx. per month, and pag lagpas na sa 1-15 days, next month na
const getLastDayOfMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getMonthName = (month, locale = 'en-US') => {
    // month is 0-based; to get a short month name:
    return new Date(2025, month).toLocaleString(locale, { month: 'long' });
  };
  
  const getHarvestPeriods = () => {
    const today = new Date();
    const day = today.getDate();
    const currentMonth = today.getMonth(); // 0-based index
    const currentYear = today.getFullYear();
  
    const options = [];
    
    if (day <= 15) {
      // Option 1: current month, 1-15
      options.push({
        label: `${getMonthName(currentMonth)} 1-15, ${currentYear}`,
        value: `${currentYear}-${currentMonth + 1}-01_to_${currentYear}-${currentMonth + 1}-15`
      });
      // Option 2: current month, 16-end
      const lastDay = getLastDayOfMonth(currentYear, currentMonth);
      options.push({
        label: `${getMonthName(currentMonth)} 16-${lastDay}, ${currentYear}`,
        value: `${currentYear}-${currentMonth + 1}-16_to_${currentYear}-${currentMonth + 1}-${lastDay}`
      });
    } else {
      // Option 1: current month, 16-end
      const lastDay = getLastDayOfMonth(currentYear, currentMonth);
      options.push({
        label: `${getMonthName(currentMonth)} 16-${lastDay}, ${currentYear}`,
        value: `${currentYear}-${currentMonth + 1}-16_to_${currentYear}-${currentMonth + 1}-${lastDay}`
      });
      // Option 2: next month, 1-15 (handle year change)
      let nextMonth = currentMonth + 1;
      let nextYear = currentYear;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      options.push({
        label: `${getMonthName(nextMonth)} 1-15, ${nextYear}`,
        value: `${nextYear}-${nextMonth + 1}-01_to_${nextYear}-${nextMonth + 1}-15`
      });
    }
    return options;
  };

export default getHarvestPeriods;