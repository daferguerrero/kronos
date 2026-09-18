// Construye el resumen general del cronograma a partir de las fechas, competencias y fases del programa.
const buildGeneralSchedule = ({
  programStartDate,
  programEndDate,
  competencies = [],
  phases = [],
}) => {
  const totalLearningActivities = competencies.reduce(
    (total, competency) => total + (competency.totalLearningActivities || 0), 0,
  );

  const totalWeeks = competencies.reduce(
    (total, competency) => total + (competency.totalWeeks || 0), 0,
  );

  const totalEvidences = competencies.reduce(
    (total, competency) => total + (competency.totalEvidences || 0), 0,
  );

  const totalTechnicalCompetencies = competencies.filter(
    (competency) => competency.competencyType === "TECHNICAL",
  ).length;

  const totalTransversalCompetencies = competencies.filter(
    (competency) => competency.competencyType === "TRANSVERSAL",
  ).length;

  const programDurationDays =
    programStartDate && programEndDate
      ? Math.ceil((programEndDate - programStartDate) / (1000 * 60 * 60 * 24)) : 0;

  const programDurationWeeks = Math.ceil(programDurationDays / 7);

  const scheduleStartDate = phases[0]?.startDate ?? programStartDate;

  const scheduleEndDate = phases[phases.length - 1]?.endDate ?? programEndDate;

  const technicalCompetencyPercentage =
    competencies.length > 0
      ? Math.round((totalTechnicalCompetencies / competencies.length) * 100) : 0;

  const transversalCompetencyPercentage =
    competencies.length > 0
      ? Math.round((totalTransversalCompetencies / competencies.length) * 100) : 0;

  const learningActivitiesPerCompetency =
    competencies.length > 0
      ? Number((totalLearningActivities / competencies.length).toFixed(2)) : 0;

  const evidencesPerCompetency =
    competencies.length > 0
      ? Number((totalEvidences / competencies.length).toFixed(2)) : 0;

  const evidencesPerLearningActivity =
    totalLearningActivities > 0
      ? Number((totalEvidences / totalLearningActivities).toFixed(2)) : 0;

  const averageWeeksPerCompetency =
    competencies.length > 0
      ? Number((totalWeeks / competencies.length).toFixed(2)) : 0;

  const averageEvidencesPerCompetency =
    competencies.length > 0
      ? Number((totalEvidences / competencies.length).toFixed(2)) : 0;

  const learningActivitiesPerWeek =
    totalWeeks > 0
      ? Number((totalLearningActivities / totalWeeks).toFixed(2)) : 0;

  const evidencesPerWeek =
    totalWeeks > 0 ? Number((totalEvidences / totalWeeks).toFixed(2)) : 0;

  const scheduleCoveragePercentage =
    programDurationWeeks > 0
      ? Number(((totalWeeks / programDurationWeeks) * 100).toFixed(2)) : 0;

  const unplannedWeeks = Math.max(0, programDurationWeeks - totalWeeks);

  const competenciesPerWeek =
    totalWeeks > 0 ? Number((competencies.length / totalWeeks).toFixed(2)) : 0;

  const summary = {
    totalCompetencies: competencies.length,
    totalTechnicalCompetencies,
    totalTransversalCompetencies,
    totalLearningActivities,
    totalWeeks,
    totalEvidences,
    totalPhases: phases.length,
    programDurationDays,
    programDurationWeeks,
    technicalCompetencyPercentage,
    transversalCompetencyPercentage,
    learningActivitiesPerCompetency,
    evidencesPerCompetency,
    evidencesPerLearningActivity,
    averageWeeksPerCompetency,
    averageEvidencesPerCompetency,
    learningActivitiesPerWeek,
    evidencesPerWeek,
    scheduleCoveragePercentage,
    unplannedWeeks,
    competenciesPerWeek,
  };

  return {
    programStartDate,
    programEndDate,
    totalCompetencies: competencies.length,
    totalPhases: phases.length,
    totalLearningActivities,
    totalWeeks,
    totalEvidences,
    competencies,
    phases,
    totalTechnicalCompetencies,
    totalTransversalCompetencies,
    programDurationDays,
    programDurationWeeks,
    scheduleStartDate,
    scheduleEndDate,
    summary
  };
};

export default {
  buildGeneralSchedule,
};
