// Construye el resumen del cronograma de una fase y sus competencias.
const buildPhaseSchedule = ({ phase, competencies = [] }) => {
  const totalLearningActivities = competencies.reduce(
    (total, competency) => total + (competency.totalLearningActivities || 0), 0,
  );

  const totalWeeks = competencies.reduce(
    (total, competency) => total + (competency.totalWeeks || 0), 0,
  );

  const totalEvidences = competencies.reduce(
    (total, competency) => total + (competency.totalEvidences || 0), 0,
  );

  const phaseStartDate = competencies[0]?.startDate;

  const phaseEndDate = competencies[competencies.length - 1]?.endDate;

  const phaseDurationDays =
    phaseStartDate && phaseEndDate
      ? Math.ceil((phaseEndDate - phaseStartDate) / (1000 * 60 * 60 * 24)) : 0;

  const phaseDurationWeeks = Math.ceil(phaseDurationDays / 7);

  const phaseCoveragePercentage =
    phaseDurationWeeks > 0
      ? Number(((totalWeeks / phaseDurationWeeks) * 100).toFixed(2)) : 0;

  const unplannedWeeks = Math.max(0, phaseDurationWeeks - totalWeeks);

  const learningActivitiesPerCompetency =
    competencies.length > 0
      ? Number((totalLearningActivities / competencies.length).toFixed(2)) : 0;

  const evidencesPerCompetency =
    competencies.length > 0
      ? Number((totalEvidences / competencies.length).toFixed(2)) : 0;

  const learningActivitiesPerWeek =
    totalWeeks > 0
      ? Number((totalLearningActivities / totalWeeks).toFixed(2))
      : 0;

  const evidencesPerWeek =
    totalWeeks > 0 ? Number((totalEvidences / totalWeeks).toFixed(2)) : 0;

  const technicalCompetencies = competencies.filter(
    (competency) => competency.competencyType === "TECHNICAL",
  ).length;

  const transversalCompetencies = competencies.filter(
    (competency) => competency.competencyType === "TRANSVERSAL",
  ).length;

  const phaseType =
    technicalCompetencies > 0 && transversalCompetencies > 0
      ? "MIXED"
      : technicalCompetencies > 0
        ? "TECHNICAL"
        : transversalCompetencies > 0
          ? "TRANSVERSAL"
          : "UNDEFINED";

  const technicalCompetencyPercentage =
    competencies.length > 0
      ? Number(((technicalCompetencies / competencies.length) * 100).toFixed(2)) : 0;

  const transversalCompetencyPercentage =
    competencies.length > 0
      ? Number(
          ((transversalCompetencies / competencies.length) * 100).toFixed(2),
        )
      : 0;

  const summary = {
    totalCompetencies: competencies.length,
    totalLearningActivities,
    totalWeeks,
    totalEvidences,
    phaseDurationDays,
    phaseDurationWeeks,
    learningActivitiesPerCompetency,
    evidencesPerCompetency,
    phaseCoveragePercentage,
    unplannedWeeks,
    learningActivitiesPerWeek,
    evidencesPerWeek,
    technicalCompetencyPercentage,
    transversalCompetencyPercentage,
  };

  return {
    phase,
    totalCompetencies: competencies.length,
    competencies,
    totalLearningActivities,
    totalWeeks,
    totalEvidences,
    phaseStartDate,
    phaseEndDate,
    phaseDurationDays,
    phaseDurationWeeks,
    technicalCompetencies,
    transversalCompetencies,
    phaseType,
    summary
  };
};

const linkPhaseSequence = (phases) => {
  return phases.map((phase, index) => ({
    ...phase,

    phaseOrder: index + 1,
    totalPhases: phases.length,
    previousPhase: index > 0 ? phases[index - 1].phase : null,
    nextPhase: index < phases.length - 1 ? phases[index + 1].phase : null,
  }));
};

const calculatePhaseTransitions = (phases) => {
  return phases.map((phase, index) => {
    const nextPhase = phases[index + 1];

    const transitionDays =
      nextPhase && phase.phaseEndDate && nextPhase.phaseStartDate
        ? Math.ceil(
            (nextPhase.phaseStartDate - phase.phaseEndDate) /
              (1000 * 60 * 60 * 24),
          )
        : null;

    const hasGap = transitionDays !== null && transitionDays > 0;

    return {
      ...phase,

      transitionDays,
      hasGap
    };
  });
};

const buildPhaseRoadmap = (phases) => {
  return phases.map((phase) => ({
    phase: phase.phase,
    phaseOrder: phase.phaseOrder,
    previousPhase: phase.previousPhase,
    nextPhase: phase.nextPhase,
  }));
};

const buildPhaseProgram = (phases) => {
  const linkedPhases = linkPhaseSequence(phases);

  const phasesWithTransitions = calculatePhaseTransitions(linkedPhases);

  const roadmap = buildPhaseRoadmap(phasesWithTransitions);

  return {
    totalPhases: phases.length,
    phases: phasesWithTransitions,
    roadmap,
  };
};

export default {
  buildPhaseSchedule,
  linkPhaseSequence,
  calculatePhaseTransitions,
  buildPhaseRoadmap,
  buildPhaseProgram
};

