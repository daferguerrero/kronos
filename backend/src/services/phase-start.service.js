const isValidDateValue = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  const date = value instanceof Date ? value : new Date(value);

  return !Number.isNaN(date.getTime());
};

// Calcula la fecha de inicio de una fase a partir del fin de la fase previa y del número de días de transición entre ambas.
const calculatePhaseStartDate = ({
  previousPhaseEndDate,
  transitionDays = 0,
}) => {
  if (!isValidDateValue(previousPhaseEndDate)) {
    return null;
  }

  const startDate = new Date(previousPhaseEndDate);

  startDate.setDate(startDate.getDate() + transitionDays);

  return startDate;
};

// Calcula el inicio de cada fase dentro de una secuencia, usando la fecha final de la fase previa para determinar el punto de inicio de la siguiente.
const calculatePhaseSequenceStarts = (phases) => {
  return phases.map((phase, index) => {
    if (index === 0) {
      return {
        ...phase,
        calculatedStartDate: phase.phaseStartDate ?? null,
      };
    }

    return {
      ...phase,
      calculatedStartDate: calculatePhaseStartDate({
        previousPhaseEndDate: phases[index - 1].phaseEndDate,
        transitionDays: phase.transitionDays ?? 0,
      }),
    };
  });
};

// Calcula la fecha de finalización de una fase a partir de su fecha de inicio y su duración en días.
const calculatePhaseEndDate = ({ phaseStartDate, phaseDurationDays = 0 }) => {
  if (!isValidDateValue(phaseStartDate)) {
    return null;
  }

  const normalizedDurationDays =
    phaseDurationDays === null || phaseDurationDays === undefined
      ? 0
      : Number(phaseDurationDays);

  if (!Number.isFinite(normalizedDurationDays)) {
    throw new Error("La duración de la fase no es válida.");
  }

  if (normalizedDurationDays < 0) {
    throw new Error("La duración de la fase no puede ser negativa.");
  }

  const endDate = new Date(phaseStartDate);

  endDate.setDate(endDate.getDate() + normalizedDurationDays);

  return endDate;
};

// Calcula el cronograma completo de una secuencia de fases, determinando el inicio y fin de cada fase en base a la transición y duración de la anterior.
const calculatePhaseTimeline = (phases) => {
  if (!Array.isArray(phases)) {
    return [];
  }

  return phases.reduce((timeline, phase, index) => {
    const previousPhase = timeline[index - 1];
    const previousPhaseEndDate = previousPhase?.calculatedEndDate ?? null;

    const calculatedStartDate =
      index === 0
        ? phase.phaseStartDate ?? null
        : calculatePhaseStartDate({
            previousPhaseEndDate: previousPhaseEndDate,
            transitionDays: phase.transitionDays ?? 0,
          });

    const calculatedEndDate =
      !calculatedStartDate
        ? null
        : calculatePhaseEndDate({
            phaseStartDate: calculatedStartDate,
            phaseDurationDays: phase.phaseDurationDays ?? 0,
          });

    timeline.push({
      ...phase,
      calculatedStartDate,
      calculatedEndDate,
    });

    return timeline;
  }, []);
};

/// Construye un resumen ejecutivo del cronograma a partir de la secuencia calculada de fases.
// Calcula la cantidad total de etapas, la fecha inicial y final del programa, y la duración total en días, validando que la línea de tiempo tenga datos coherentes antes de devolver el resultado.
const buildTimelineSummary = (timeline) => {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return {
      totalPhases: 0,
      startDate: null,
      endDate: null,
      durationDays: 0,
      timelineIntegrity: true,
    };
  }

  const timelineIntegrity = timeline.every((phase) => {
    if (!phase.calculatedStartDate || !phase.calculatedEndDate) {
      return true;
    }

    return (
      isValidDateValue(phase.calculatedStartDate) &&
      isValidDateValue(phase.calculatedEndDate) &&
      new Date(phase.calculatedStartDate).getTime() <=
        new Date(phase.calculatedEndDate).getTime()
    );
  });

  const startDate = isValidDateValue(timeline[0].calculatedStartDate)
    ? new Date(timeline[0].calculatedStartDate)
    : null;

  const endDate = isValidDateValue(timeline[timeline.length - 1].calculatedEndDate)
    ? new Date(timeline[timeline.length - 1].calculatedEndDate)
    : null;

  const durationDays =
    startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      : 0;

  return {
    totalPhases: timeline.length,
    startDate,
    endDate,
    durationDays,
    timelineIntegrity,
  };
};

/// Genera el cronograma completo de un programa de fases y devuelve tanto la línea de tiempo detallada como el resumen global del mismo.
// Primero calcula la fecha de inicio y fin de cada fase según sus transiciones y duraciones, y luego consolida los datos en una estructura útil para la vista o la lógica de negocio.
const buildProgramTimeline = (phases) => {
  const timeline = calculatePhaseTimeline(phases);

  const summary = buildTimelineSummary(timeline);

  const phasesWithGap = timeline.filter(
    (phase) => phase.transitionDays > 0,
  ).length;

  const continuousPhases = timeline.filter(
    (phase) => phase.transitionDays === 0,
  ).length;

  const totalTransitionDays = timeline.reduce(
    (total, phase) => total + (phase.transitionDays || 0),
    0,
  );

  const totalExecutionDays = timeline.reduce(
    (total, phase) => total + (phase.phaseDurationDays || 0),
    0,
  );

  const executionEfficiencyPercentage =
    totalExecutionDays + totalTransitionDays > 0
      ? Number(
          (
            (totalExecutionDays / (totalExecutionDays + totalTransitionDays)) *
            100
          ).toFixed(2),
        )
      : 0;

  const interruptionPercentage =
    totalExecutionDays + totalTransitionDays > 0
      ? Number(
          (
            (totalTransitionDays / (totalExecutionDays + totalTransitionDays)) *
            100
          ).toFixed(2),
        )
      : 0;

  const phasesPerMonth =
    summary.durationDays > 0
      ? Number(((timeline.length * 30) / summary.durationDays).toFixed(2))
      : 0;



  return {
    timeline,
    summary: {
      ...summary,
      phasesWithGap,
      continuousPhases,
      totalTransitionDays,
      totalExecutionDays,
      executionEfficiencyPercentage,
      interruptionPercentage,
      phasesPerMonth
    },
  };
};

export default {
  calculatePhaseStartDate,
  calculatePhaseSequenceStarts,
  calculatePhaseEndDate,
  calculatePhaseTimeline,
  buildTimelineSummary,
  buildProgramTimeline
};
