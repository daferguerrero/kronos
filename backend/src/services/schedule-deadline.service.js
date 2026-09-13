import { isHolidayPeriod } from "../utils/academic-calendar.js";

// Calcula la fecha límite restando siete días al fin de la etapa lectiva.
const calculate = (lectiveStageEndDate) => {
  const deadline = new Date(lectiveStageEndDate);

  deadline.setDate(deadline.getDate() - 7);

  let crossedHoliday = false;

  while (isHolidayPeriod(deadline)) {
    crossedHoliday = true;

    deadline.setDate(deadline.getDate() - 1);
  }

  if (crossedHoliday) {
    deadline.setDate(deadline.getDate() - 7);
  }

  return deadline;
};

export default {
  calculate,
};
