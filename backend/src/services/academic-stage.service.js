import deadlineService from "./schedule-deadline.service.js";

const parseCalendarDate = (date) => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  return new Date(date);
};

// Calcula las fechas de las etapas lectiva y productiva a partir del fin del programa.
const calculate = ({ endProgramDate }) => {
  const productiveStageEndDate = parseCalendarDate(endProgramDate);

  const lectiveStageEndDate = parseCalendarDate(endProgramDate);

  lectiveStageEndDate.setMonth(lectiveStageEndDate.getMonth() - 6);

  const scheduleDeadline = deadlineService.calculate(lectiveStageEndDate);

  const productiveStageStartDate = new Date(lectiveStageEndDate);

  productiveStageStartDate.setDate(productiveStageStartDate.getDate() + 1);

  return {
    lectiveStageEndDate,
    productiveStageStartDate,
    productiveStageEndDate,
    scheduleDeadline
  };
};

export default {
  calculate,
};
