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

  // Last two weeks of the previous month
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear--;
  }
  const lastDayPrev = getLastDayOfMonth(prevYear, prevMonth);
  options.push({
    label: `${getMonthName(prevMonth)} 16-${lastDayPrev}, ${prevYear}`,
    value: `${prevYear}-${prevMonth + 1}-16_to_${prevYear}-${prevMonth + 1}-${lastDayPrev}`,
    startDate: `${prevYear}-${prevMonth + 1}-16`,
    endDate: `${prevYear}-${prevMonth + 1}-${lastDayPrev}`
  });

  // First two weeks of the current month
  options.push({
    label: `${getMonthName(currentMonth)} 1-15, ${currentYear}`,
    value: `${currentYear}-${currentMonth + 1}-01_to_${currentYear}-${currentMonth + 1}-15`,
    startDate: `${currentYear}-${currentMonth + 1}-01`,
    endDate: `${currentYear}-${currentMonth + 1}-15`
  });

  // Last two weeks of the current month
  const lastDayCurrent = getLastDayOfMonth(currentYear, currentMonth);
  options.push({
    label: `${getMonthName(currentMonth)} 16-${lastDayCurrent}, ${currentYear}`,
    value: `${currentYear}-${currentMonth + 1}-16_to_${currentYear}-${currentMonth + 1}-${lastDayCurrent}`,
    startDate: `${currentYear}-${currentMonth + 1}-16`,
    endDate: `${currentYear}-${currentMonth + 1}-${lastDayCurrent}`
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
    value: `${nextYear}-${nextMonth + 1}-01_to_${nextYear}-${nextMonth + 1}-15`,
    startDate: `${nextYear}-${nextMonth + 1}-01`,
    endDate: `${nextYear}-${nextMonth + 1}-15`
  });
  return options;

};

export default getHarvestPeriods;