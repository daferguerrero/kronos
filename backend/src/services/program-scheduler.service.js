import competencySchedulerService from "./competency-scheduler.service.js";

// Programa las competencias secuencialmente y evita solapamientos entre ellas.
const schedule = (competencies, startDate) => {
  const scheduled = [];

  let currentDate = new Date(startDate);

  for (const competency of competencies) {
    const scheduledCompetency = competencySchedulerService.schedule(
      competency,
      currentDate,
    );

    scheduled.push(scheduledCompetency);
    currentDate = new Date(scheduledCompetency.endDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalCompetencies = scheduled.length;

  const totalLearningActivities = scheduled.reduce(
    (total, competency) => total + competency.totalLearningActivities,
    0,
  );

  const totalWeeks = scheduled.reduce(
    (total, competency) => total + competency.totalWeeks,
    0,
  );

  const totalDays = totalWeeks * 7;

  const totalEvidences = scheduled.reduce(
    (total, competency) => total + (competency.totalEvidences || 0),
    0,
  );

  return {
    startDate: scheduled[0]?.startDate,
    endDate: scheduled[scheduled.length - 1]?.endDate,
    totalCompetencies,
    totalLearningActivities,
    totalWeeks,
    totalDays,
    totalEvidences,
    competencies: scheduled,
  };
};

export default {
  schedule,
};
