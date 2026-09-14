import academicScheduleService from "./academic-schedule.service.js";

// Programa las competencias secuencialmente y calcula sus fechas y duración total.
const schedule = (competencies, startDate) => {
  const scheduled = [];

  let currentDate = new Date(startDate);

  for (const competency of competencies) {
    const range = academicScheduleService.calculateRange(
      currentDate,
      competency.estimatedWeeks,
    );

    const totalDays = Math.ceil(competency.estimatedWeeks * 7);

    scheduled.push({
      ...competency,

      startDate: range.startDate,

      endDate: range.endDate,

      totalDays,
    });

    currentDate = new Date(range.endDate);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return scheduled;
};

export default {
  schedule,
};
