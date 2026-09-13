// Determina si una fecha pertenece al periodo vacacional de diciembre o enero.
const isHolidayPeriod = (date) => {
  const month = date.getMonth() + 1;

  const day = date.getDate();

  const isDecemberHoliday = month === 12 && day >= 15;

  const isJanuaryHoliday = month === 1 && day <= 31;

  return isDecemberHoliday || isJanuaryHoliday;
};

export { isHolidayPeriod };
