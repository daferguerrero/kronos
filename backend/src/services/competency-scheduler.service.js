import learningActivitySchedulerService from "./learning-activity-scheduler.service.js";

// Programa las actividades de la competencia y establece sus fechas de inicio y fin.
const schedule = (competency, startDate) => {
  const scheduledActivities = learningActivitySchedulerService.schedule(
    competency.learningActivities,
    startDate,
  );

  const totalLearningActivities = scheduledActivities.length;

  const totalWeeks = scheduledActivities.reduce(
    (total, activity) => total + activity.estimatedWeeks,
    0,
  );

  return {
    ...competency,
    startDate: scheduledActivities[0]?.startDate,
    endDate: scheduledActivities[scheduledActivities.length - 1]?.endDate,
    totalLearningActivities,
    totalWeeks,
    learningActivities: scheduledActivities,
  };
};

export default {
  schedule,
};
