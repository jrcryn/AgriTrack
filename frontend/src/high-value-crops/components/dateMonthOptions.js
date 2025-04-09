// Helper function para sa pagcompute ng 15 days approx. per month, and pag lagpas na sa 1-15 days, next month na
const getLastDayOfMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getMonthName = (month, locale = 'en-US') => {
  // month is 0-based; to get a full month name:
  return new Date(2025, month).toLocaleString(locale, { month: 'long' });
};

const getHarvestPeriods = () => {
  const today = new Date();
  const day = today.getDate();
  const currentMonth = today.getMonth(); // 0-based index
  const currentYear = today.getFullYear();

  const options = [];
  
  // Determine which date periods to show based on whether it's before or after the 15th
  if (day <= 15) {
    // Before or on the 15th: Show last two weeks of previous month and first two weeks of current month
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }
    
    const lastDayPrev = getLastDayOfMonth(prevYear, prevMonth);
    options.push({
      label: `${getMonthName(prevMonth)} 16-${lastDayPrev}, ${prevYear}`,
      value: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-16_to_${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${lastDayPrev}`,
      startDate: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-16`,
      endDate: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${lastDayPrev}`
    });

    // First two weeks of the current month
    options.push({
      label: `${getMonthName(currentMonth)} 1-15, ${currentYear}`,
      value: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01_to_${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
      startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
      endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`
    });
  } else {
    // After the 15th: Show last two weeks of current month and first two weeks of next month
    const lastDayCurrent = getLastDayOfMonth(currentYear, currentMonth);
    options.push({
      label: `${getMonthName(currentMonth)} 16-${lastDayCurrent}, ${currentYear}`,
      value: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-16_to_${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${lastDayCurrent}`,
      startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-16`,
      endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${lastDayCurrent}`
    });

    // First two weeks of the next month
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }
    
    options.push({
      label: `${getMonthName(nextMonth)} 1-15, ${nextYear}`,
      value: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01_to_${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-15`,
      startDate: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`,
      endDate: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-15`
    });
  }

  return options;
};

export default getHarvestPeriods;