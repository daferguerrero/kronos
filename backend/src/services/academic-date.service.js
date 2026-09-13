import { isHolidayPeriod } from "../utils/academic-calendar.js";

const moveToNextAcademicDate = (date) => {
  const adjustedDate = new Date(date);

  while (isHolidayPeriod(adjustedDate)) {
    adjustedDate.setDate(adjustedDate.getDate() + 1);
  }

  return adjustedDate;
};

const addAcademicDays = (startDate, days) => {
  const result = new Date(startDate);

  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);

    if (!isHolidayPeriod(result)) {
      addedDays++;
    }
  }

  return result;
};

export default {
  moveToNextAcademicDate,
  addAcademicDays,
};
