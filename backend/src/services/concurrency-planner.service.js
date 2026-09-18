import academicScheduleService from "./academic-schedule.service.js";

// Construye el plan de concurrencia a partir de las semanas técnicas y transversales disponibles.
const buildConcurrencyPlan = ({ technicalWeeks, transversalWeeks }) => {
  const technicalRemainingWeeks =
    technicalWeeks - Math.min(technicalWeeks, transversalWeeks);

  const transversalRemainingWeeks =
    transversalWeeks - Math.min(technicalWeeks, transversalWeeks);

  const executionMode =
    technicalWeeks > 0 && transversalWeeks > 0 ? "CONCURRENT" : "SEQUENTIAL";

  return {
    canRunConcurrently: technicalWeeks > 0 && transversalWeeks > 0,
    concurrencyWeeks: Math.min(technicalWeeks, transversalWeeks),
    technicalRemainingWeeks,
    transversalRemainingWeeks,
    executionMode,
  };
};

// Construye las fases de ejecución en orden, omitiendo aquellas que no tienen semanas asignadas.
const buildExecutionPhases = ({ technicalWeeks, transversalWeeks }) => {
  const concurrencyWeeks = Math.min(technicalWeeks, transversalWeeks);

  const technicalRemainingWeeks = technicalWeeks - concurrencyWeeks;

  const transversalRemainingWeeks = transversalWeeks - concurrencyWeeks;

  const phases = [];

  if (concurrencyWeeks > 0) {
    phases.push({
      phase: "CONCURRENT",
      weeks: concurrencyWeeks,
    });
  }

  if (technicalRemainingWeeks > 0) {
    phases.push({
      phase: "TECHNICAL_ONLY",
      weeks: technicalRemainingWeeks,
    });
  }

  if (transversalRemainingWeeks > 0) {
    phases.push({
      phase: "TRANSVERSAL_ONLY",
      weeks: transversalRemainingWeeks,
    });
  }

  return phases;
};

// Asigna fechas consecutivas a cada fase a partir de una fecha inicial.
const scheduleExecutionPhases = (phases, startDate) => {
  const scheduled = [];

  let currentDate = new Date(startDate);

  for (const phase of phases) {
    const range = academicScheduleService.calculateRange(
      currentDate,
      phase.weeks,
    );

    scheduled.push({
      ...phase,
      startDate: range.startDate,
      endDate: range.endDate,
    });

    currentDate = new Date(range.endDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return scheduled;
};

// Construye el plan de concurrencia con sus fases y fechas programadas.
const buildScheduledConcurrencyPlan = (
  { technicalWeeks, transversalWeeks },
  startDate,
) => {
  const plan = buildConcurrencyPlan({
    technicalWeeks,
    transversalWeeks,
  });

  const phases = buildExecutionPhases({
    technicalWeeks,
    transversalWeeks,
  });

  const scheduledPhases = scheduleExecutionPhases(phases, startDate);

  const totalWeeks = scheduledPhases.reduce(
    (total, phase) => total + phase.weeks,
    0,
  );

  const startPlanDate = scheduledPhases[0]?.startDate;

  const endPlanDate = scheduledPhases[scheduledPhases.length - 1]?.endDate;

  return {
    ...plan,
    totalWeeks,
    startPlanDate,
    endPlanDate,
    phases: scheduledPhases,
  };
};

// Añade al plan las competencias técnicas y transversales clasificadas por tipo.
const attachCompetenciesToPlan = (plan, competencies) => {
  const technical = competencies.filter(
    (competency) => competency.competencyType === "TECHNICAL",
  );

  const transversal = competencies.filter(
    (competency) => competency.competencyType === "TRANSVERSAL",
  );

  return {
    ...plan,
    technicalCompetencies: technical,
    transversalCompetencies: transversal,
  };
};

// Resume el modo, las fases, las competencias y las fechas principales del plan.
const buildConcurrencySummary = (plan) => {
  return {
    executionMode: plan.executionMode,
    totalPhases: plan.phases.length,
    totalTechnicalCompetencies: plan.technicalCompetencies.length,
    totalTransversalCompetencies: plan.transversalCompetencies.length,
    startPlanDate: plan.startPlanDate,
    endPlanDate: plan.endPlanDate,
  };
};

// Construye el cronograma concurrente con fases, competencias y un resumen final.
const createConcurrentSchedule = (
  { technicalWeeks, transversalWeeks, competencies },
  startDate,
) => {
  const scheduledPlan = buildScheduledConcurrencyPlan(
    {
      technicalWeeks,
      transversalWeeks,
    },
    startDate,
  );

  const planWithCompetencies = attachCompetenciesToPlan(
    scheduledPlan,
    competencies,
  );

  const summary = buildConcurrencySummary(planWithCompetencies);

  return {
    ...planWithCompetencies,
    summary,
  };
};

export default {
  buildConcurrencyPlan,
  buildExecutionPhases,
  scheduleExecutionPhases,
  buildScheduledConcurrencyPlan,
  attachCompetenciesToPlan,
  buildConcurrencySummary,
  createConcurrentSchedule,
};
