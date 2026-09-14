import academicScheduleService from "./academic-schedule.service.js";

// Programa las actividades secuencialmente y calcula sus fechas y duración total.
const schedule = (learningActivities, startDate) => {
  const scheduled = [];

  let currentDate = new Date(startDate);

  for (const activity of learningActivities) {
    const range = academicScheduleService.calculateRange(
      currentDate,
      activity.estimatedWeeks,
    );

    const totalDays = activity.estimatedWeeks * 7;

    scheduled.push({
      ...activity,
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
