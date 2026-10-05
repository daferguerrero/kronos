import assert from "node:assert/strict";
import { describe, it } from "node:test";

import phaseStartService from "../src/services/phase-start.service.js";
import phaseScheduleService from "../src/services/phase-schedule.service.js";

describe("cálculo del inicio de la fase", () => {
  it("calcula el inicio de una fase a partir del fin de la fase anterior", () => {
    const result = phaseStartService.calculatePhaseStartDate({
      previousPhaseEndDate: new Date(2026, 1, 10),

      transitionDays: 5,
    });

    assert.equal(
      result.toISOString().substring(0, 10),

      "2026-02-15",
    );
  });

  it("retorna null cuando no existe una fase previa", () => {
    const result = phaseStartService.calculatePhaseStartDate({
      previousPhaseEndDate: null,
    });

    assert.equal(result, null);
  });

  it("calcula el inicio de las fases de una secuencia", () => {
    const result = phaseStartService.calculatePhaseSequenceStarts([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseEndDate: new Date(2026, 1, 10),
      },

      {
        phase: "DISEÑO",
        transitionDays: 5,
      },
    ]);

    assert.equal(
      result[1].calculatedStartDate.toISOString().substring(0, 10), "2026-02-15",
    );
  });

  it("mantiene el inicio de la primera fase", () => {
    const result = phaseStartService.calculatePhaseSequenceStarts([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
      },
    ]);

    assert.equal(
      result[0].calculatedStartDate.toISOString().substring(0, 10), "2026-02-01",
    );
  });

  it("maneja una secuencia vacía de fases", () => {
    const result = phaseStartService.calculatePhaseSequenceStarts([]);
    assert.deepEqual(result, []);
  });

  it("mantiene el inicio de una secuencia con una sola fase", () => {
    const result = phaseStartService.calculatePhaseSequenceStarts([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseEndDate: new Date(2026, 1, 10),
      },
    ]);

    assert.equal(result.length, 1);
    assert.equal(
      result[0].calculatedStartDate.toISOString().substring(0, 10), "2026-02-01",
    );
  });

  it("calcula el inicio de una segunda fase encadenada", () => {
    const result = phaseStartService.calculatePhaseSequenceStarts([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseEndDate: new Date(2026, 1, 10),
      },

      {
        phase: "DISEÑO",
        transitionDays: 5,
      },
    ]);

    assert.equal(result.length, 2);
    assert.equal(
      result[0].calculatedStartDate.toISOString().substring(0, 10), "2026-02-01",
    );

    assert.equal(
      result[1].calculatedStartDate.toISOString().substring(0, 10), "2026-02-15",
    );
  });

  it("calcula el inicio de tres fases encadenadas", () => {
    const result = phaseStartService.calculatePhaseSequenceStarts([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseEndDate: new Date(2026, 1, 10),
      },

      {
        phase: "DISEÑO",
        phaseEndDate: new Date(2026, 1, 20),
        transitionDays: 5,
      },

      {
        phase: "DESARROLLO",
        transitionDays: 3,
      },
    ]);

    assert.equal(result.length, 3);
    assert.equal(
      result[0].calculatedStartDate.toISOString().substring(0, 10), "2026-02-01",
    );

    assert.equal(
      result[1].calculatedStartDate.toISOString().substring(0, 10), "2026-02-15",
    );

    assert.equal(
      result[2].calculatedStartDate.toISOString().substring(0, 10), "2026-02-23",
    );
  });

  it("calcula el fin de una fase", () => {
    const result = phaseStartService.calculatePhaseEndDate({
      phaseStartDate: new Date(2026, 1, 1),
      phaseDurationDays: 10,
    });

    assert.equal(
      result.toISOString().substring(0, 10), "2026-02-11",
    );
  });

  it("retorna null cuando no existe fecha de inicio", () => {
    const result = phaseStartService.calculatePhaseEndDate({
      phaseStartDate: null,
      phaseDurationDays: 10,
    });

    assert.equal(result, null);
  });



  it("calcula el fin de una fase con duración cero", () => {
    const result = phaseStartService.calculatePhaseEndDate({
      phaseStartDate: new Date(2026, 1, 1),
      phaseDurationDays: 0,
    });

    assert.equal(
      result.toISOString().substring(0, 10), "2026-02-01",
    );
  });

  it("rechaza una duración negativa", () => {
    assert.throws(
      () =>
        phaseStartService.calculatePhaseEndDate({
          phaseStartDate: new Date(2026, 1, 1),
          phaseDurationDays: -1,
        }),

      {
        message: "La duración de la fase no puede ser negativa.",
      },
    );
  });

  it("rechaza una duración no numérica", () => {
    assert.throws(
      () =>
        phaseStartService.calculatePhaseEndDate({
          phaseStartDate: new Date(2026, 1, 1),
          phaseDurationDays: Number.NaN,
        }),
      {
        message: "La duración de la fase no es válida.",
      },
    );
  });

  it("rechaza una duración infinita", () => {
    assert.throws(
      () =>
        phaseStartService.calculatePhaseEndDate({
          phaseStartDate: new Date(2026, 1, 1),
          phaseDurationDays: Number.POSITIVE_INFINITY,
        }),
      {
        message: "La duración de la fase no es válida.",
      },
    );
  });

  it("retorna null cuando la fecha de inicio es inválida", () => {
    const result = phaseStartService.calculatePhaseEndDate({
      phaseStartDate: new Date("fecha inválida"),
      phaseDurationDays: 10,
    });

    assert.equal(result, null);
  });

  it("calcula correctamente el fin de una fase en un año bisiesto", () => {
    const result = phaseStartService.calculatePhaseEndDate({
      phaseStartDate: new Date(2024, 1, 29),
      phaseDurationDays: 2,
    });

    assert.equal(
      result.toISOString().substring(0, 10), "2024-03-02",
    );
  });

  it("calcula correctamente el inicio de una fase después del 29 de febrero en un año bisiesto", () => {
    const result = phaseStartService.calculatePhaseStartDate({
      previousPhaseEndDate: new Date(2024, 1, 29),
      transitionDays: 1,
    });

    assert.equal(
      result.toISOString().substring(0, 10), "2024-03-01",
    );
  });

  it("mantiene el mismo día cuando la duración es cero en un año bisiesto", () => {
    const result = phaseStartService.calculatePhaseEndDate({
      phaseStartDate: new Date(2024, 1, 29),
      phaseDurationDays: 0,
    });

    assert.equal(result.toISOString().substring(0, 10), "2024-02-29");
  });

  it("calcula una línea temporal completa de fases", () => {
    const result = phaseStartService.calculatePhaseTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },

      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 5,
      },
    ]);

    assert.equal(
      result[0].calculatedEndDate.toISOString().substring(0, 10), "2026-02-11",
    );

    assert.equal(
      result[1].calculatedStartDate.toISOString().substring(0, 10), "2026-02-16",
    );
  });

  it("maneja una línea temporal vacía", () => {
    const result = phaseStartService.calculatePhaseTimeline([]);

    assert.deepEqual(result, []);
  });

  it("calcula una línea temporal completa con tres fases", () => {
    const result = phaseStartService.calculatePhaseTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },
      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 5,
      },
      {
        phase: "DESARROLLO",
        transitionDays: 2,
        phaseDurationDays: 7,
      },
    ]);

    assert.equal(
      result[0].calculatedEndDate.toISOString().substring(0, 10), "2026-02-11",
    );
    assert.equal(
      result[1].calculatedStartDate.toISOString().substring(0, 10), "2026-02-16",
    );
    assert.equal(
      result[2].calculatedStartDate.toISOString().substring(0, 10), "2026-02-23",
    );
  });

  it("retorna una línea temporal vacía cuando la entrada no es válida", () => {
    const result = phaseStartService.calculatePhaseTimeline(null);

    assert.deepEqual(result, []);
  });

  it("valida una línea temporal consistente", () => {
    const timeline = [
      {
        calculatedStartDate: new Date(2026, 1, 1),
        calculatedEndDate: new Date(2026, 1, 11),
      },

      {
        calculatedStartDate: new Date(2026, 1, 16),
        calculatedEndDate: new Date(2026, 1, 21),
      },
    ];

    const result = phaseStartService.buildTimelineSummary(timeline);

    assert.equal(result.totalPhases, 2);
    assert.equal(
      result.startDate.toISOString().substring(0, 10), "2026-02-01",
    );

    assert.equal(
      result.endDate.toISOString().substring(0, 10), "2026-02-21",
    );
    assert.equal(result.timelineIntegrity, true);
    assert.equal(result.invalidPhases, 0);
    assert.equal(result.validPhases, 2);
    assert.equal(result.phaseValidityPercentage, 100);
  });

  it("detecta una línea temporal inconsistente", () => {
    const result = phaseStartService.buildTimelineSummary([
      {
        calculatedStartDate: new Date(2026, 1, 11),
        calculatedEndDate: new Date(2026, 1, 10),
      },
    ]);

    assert.equal(result.timelineIntegrity, false);
    assert.equal(result.invalidPhases, 1);
    assert.equal(result.validPhases, 0);
    assert.equal(result.phaseValidityPercentage, 0);
  });

  it("genera un resumen vacío para una línea temporal vacía", () => {
    const result = phaseStartService.buildTimelineSummary([]);

    assert.equal(result.totalPhases, 0);
    assert.equal(result.startDate, null);
    assert.equal(result.endDate, null);
    assert.equal(result.durationDays, 0);
    assert.equal(result.timelineIntegrity, true);
    assert.equal(result.invalidPhases, 0);
    assert.equal(result.validPhases, 0);
    assert.equal(result.phaseValidityPercentage, 0);
  });

  it("calcula la duración total de la línea temporal", () => {
    const timeline = [
      {
        calculatedStartDate: new Date(2026, 1, 1),
        calculatedEndDate: new Date(2026, 1, 11),
      },
      {
        calculatedStartDate: new Date(2026, 1, 16),
        calculatedEndDate: new Date(2026, 1, 21),
      },
    ];

    const result = phaseStartService.buildTimelineSummary(timeline);

    assert.equal(result.totalPhases, 2);
    assert.equal(result.durationDays, 20);
  });

  it("valida fechas nulas en el resumen de la línea temporal", () => {
    const timeline = [
      {
        calculatedStartDate: null,
        calculatedEndDate: null,
      },
      {
        calculatedStartDate: null,
        calculatedEndDate: null,
      },
    ];

    const result = phaseStartService.buildTimelineSummary(timeline);

    assert.equal(result.totalPhases, 2);
    assert.equal(result.startDate, null);
    assert.equal(result.endDate, null);
    assert.equal(result.durationDays, 0);
  });

  it("valida fechas inválidas en el resumen de la línea temporal", () => {
    const timeline = [
      {
        calculatedStartDate: new Date("fecha inválida"),
        calculatedEndDate: new Date("fecha inválida"),
      },
      {
        calculatedStartDate: new Date("fecha inválida"),
        calculatedEndDate: new Date("fecha inválida"),
      },
    ];

    const result = phaseStartService.buildTimelineSummary(timeline);

    assert.equal(result.totalPhases, 2);
    assert.equal(Number.isNaN(timeline[0].calculatedStartDate.getTime()), true);
    assert.equal(Number.isNaN(timeline[0].calculatedEndDate.getTime()), true);
    assert.equal(result.startDate, null);
    assert.equal(result.endDate, null);
    assert.equal(result.durationDays, 0);
  });

  it("calcula una línea temporal con fases de distinta duración", () => {
    const result = phaseStartService.calculatePhaseTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },
      {
        phase: "DISEÑO",
        transitionDays: 3,
        phaseDurationDays: 15,
      },
      {
        phase: "DESARROLLO",
        transitionDays: 2,
        phaseDurationDays: 7,
      },
    ]);

    assert.equal(
      result[0].calculatedEndDate.toISOString().substring(0, 10), "2026-02-11",
    );
    assert.equal(
      result[1].calculatedStartDate.toISOString().substring(0, 10), "2026-02-14",
    );
    assert.equal(
      result[1].calculatedEndDate.toISOString().substring(0, 10), "2026-03-01",
    );
    assert.equal(
      result[2].calculatedStartDate.toISOString().substring(0, 10), "2026-03-03",
    );
  });

  it("valida fechas mixtas con inicio válido y fin nulo", () => {
    const mixedTimeline = [
      {
        calculatedStartDate: new Date(2026, 1, 1),
        calculatedEndDate: new Date(2026, 1, 11),
      },

      {
        calculatedStartDate: null,
        calculatedEndDate: null,
      },
    ];

    const result = phaseStartService.buildTimelineSummary(mixedTimeline);

    assert.equal(result.totalPhases, 2);
    assert.equal(
      result.startDate.toISOString().substring(0, 10), "2026-02-01",
    );

    assert.equal(result.endDate, null);
    assert.equal(result.durationDays, 0);
  });

  it("retorna una línea temporal vacía cuando no existen fases", () => {
    const timeline = phaseStartService.calculatePhaseTimeline([]);
    const result = phaseStartService.buildTimelineSummary(timeline);

    assert.deepEqual(timeline, []);
    assert.equal(result.totalPhases, 0);
    assert.equal(result.startDate, null);
    assert.equal(result.endDate, null);
    assert.equal(result.durationDays, 0);
  });

  it("valida fechas mixtas con un fin válido en el resumen", () => {
    const timeline = [
      {
        calculatedStartDate: null,
        calculatedEndDate: null,
      },
      {
        calculatedStartDate: new Date(2026, 1, 16),
        calculatedEndDate: new Date(2026, 1, 21),
      },
    ];

    const result = phaseStartService.buildTimelineSummary(timeline);

    assert.equal(result.totalPhases, 2);
    assert.equal(result.startDate, null);
    assert.equal(
      result.endDate.toISOString().substring(0, 10), "2026-02-21",
    );
    assert.equal(result.durationDays, 0);
  });

  it("valida fechas inválidas sin mutar la línea temporal original", () => {
    const invalidStartDate = new Date("fecha inválida");
    const validStartDate = new Date(2026, 1, 16);
    const phases = [
      {
        phase: "ANÁLISIS",
        phaseStartDate: invalidStartDate,
        phaseDurationDays: 10,
      },
      {
        phase: "DISEÑO",
        phaseStartDate: validStartDate,
        phaseDurationDays: 5,
      },
    ];
    const originalInvalidTime = invalidStartDate.getTime();
    const originalValidTime = validStartDate.getTime();

    const result = phaseStartService.calculatePhaseTimeline(phases);

    assert.equal(result.length, 2);
    assert.equal(Number.isNaN(result[0].calculatedStartDate.getTime()), true);
    assert.equal(result[0].calculatedEndDate, null);
    assert.equal(result[1].calculatedStartDate, null);
    assert.equal(phases[0].phaseStartDate.getTime(), originalInvalidTime);
    assert.equal(phases[1].phaseStartDate.getTime(), originalValidTime);
  });

  it("valida una fecha final inválida en el resumen", () => {
    const timeline = [
      {
        calculatedStartDate: new Date(2026, 1, 1),
        calculatedEndDate: new Date("fecha inválida"),
      },
      {
        calculatedStartDate: new Date(2026, 1, 2),
        calculatedEndDate: new Date("fecha inválida"),
      },
    ];

    const result = phaseStartService.buildTimelineSummary(timeline);

    assert.equal(result.totalPhases, 2);
    assert.equal(
      result.startDate.toISOString().substring(0, 10), "2026-02-01",
    );
    assert.equal(result.endDate, null);
    assert.equal(result.durationDays, 0);
  });

  it("construye una línea temporal completa del programa", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },

      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 5,
      },
    ]);

    assert.equal(result.timeline.length, 2);
    assert.equal(result.summary.totalPhases, 2);
  });

  it("valida la alineación del fin de fase con el cronograma calculado", () => {
    const scheduledPhase = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          startDate: new Date(2026, 1, 1),
          endDate: new Date(2026, 1, 11),
        },
      ],
    });
    const result = phaseStartService.buildProgramTimeline([scheduledPhase]);

    assert.equal(
      result.timeline[0].phaseEndDate.getTime(),
      result.timeline[0].calculatedEndDate.getTime(),
    );
    assert.equal(result.summary.timelineIntegrity, true);
    assert.equal(result.summary.alignedPhaseEndDates, 1);
    assert.equal(result.summary.misalignedPhaseEndDates, 0);
    assert.equal(result.summary.phaseEndDateAlignmentPercentage, 100);
    assert.equal(result.summary.overallTimelineQualityScore, 100);
  });

  it("detecta cuando el fin de fase difiere del fin calculado", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 9,
        phaseEndDate: new Date(2026, 1, 11),
      },
    ]);

    assert.equal(
      result.timeline[0].phaseEndDate.getTime() ===
        result.timeline[0].calculatedEndDate.getTime(),
      false,
    );
    assert.equal(result.summary.timelineIntegrity, false);
    assert.equal(result.summary.alignedPhaseEndDates, 0);
    assert.equal(result.summary.misalignedPhaseEndDates, 1);
    assert.equal(result.summary.phaseEndDateAlignmentPercentage, 0);
    assert.equal(result.summary.invalidPhases, 1);
    assert.equal(result.summary.overallTimelineQualityScore, 0);
  });

  it("resume las fechas de fin alineadas e inconsistentes", () => {
    const phases = Array.from({ length: 5 }, (_, index) => ({
      phase: `FASE ${index + 1}`,
      phaseStartDate: new Date(2026, 1, 1),
      phaseDurationDays: 10,
      phaseEndDate: new Date(2026, 1, 11 + index * 10 + (index === 4 ? 1 : 0)),
    }));
    const result = phaseStartService.buildProgramTimeline(phases);

    assert.equal(result.summary.alignedPhaseEndDates, 4);
    assert.equal(result.summary.misalignedPhaseEndDates, 1);
    assert.equal(result.summary.phaseEndDateAlignmentPercentage, 80);
  });

  it("calcula la cantidad y el porcentaje de fases válidas", () => {
    const phases = Array.from({ length: 10 }, (_, index) => ({
      phase: `FASE ${index + 1}`,
      phaseStartDate: new Date(2026, 1, 1),
      phaseDurationDays: 10,
      phaseEndDate: new Date(2026, 1, 11 + index * 10 + (index >= 8 ? 1 : 0)),
    }));
    const result = phaseStartService.buildProgramTimeline(phases);

    assert.equal(result.summary.totalPhases, 10);
    assert.equal(result.summary.validPhases, 8);
    assert.equal(result.summary.invalidPhases, 2);
    assert.equal(result.summary.phaseValidityPercentage, 80);
  });

  it("calcula y redondea la puntuación global de calidad temporal", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "FASE 1",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 1,
        phaseEndDate: new Date(2026, 1, 2),
      },
      {
        phase: "FASE 2",
        phaseDurationDays: 1,
        phaseEndDate: new Date(2026, 1, 4),
      },
      {
        phase: "FASE 3",
        phaseDurationDays: 1,
      },
    ]);

    assert.equal(result.summary.phaseValidityPercentage, 66.67);
    assert.equal(result.summary.phaseEndDateAlignmentPercentage, 50);
    assert.equal(result.summary.overallTimelineQualityScore, 61.67);
  });

  it("construye un programa vacío cuando no existen fases", () => {
    const result = phaseStartService.buildProgramTimeline([]);

    assert.deepEqual(result.timeline, []);
    assert.equal(result.summary.totalPhases, 0);
    assert.equal(result.summary.alignedPhaseEndDates, 0);
    assert.equal(result.summary.misalignedPhaseEndDates, 0);
    assert.equal(result.summary.phaseEndDateAlignmentPercentage, 0);
    assert.equal(result.summary.validPhases, 0);
    assert.equal(result.summary.phaseValidityPercentage, 0);
    assert.equal(result.summary.overallTimelineQualityScore, 0);
  });

  it("mantiene sincronizada la línea temporal con el resumen", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },
    ]);

    assert.equal(result.summary.totalPhases, result.timeline.length);
  });

  it("calcula fases con transición", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },
      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 5,
      },
      {
        phase: "DESARROLLO",
        transitionDays: 0,
        phaseDurationDays: 5,
      },
    ]);

    assert.equal(
      result.summary.phasesWithGap,
      1,
    );
  });

  it("calcula fases continuas", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },
      {
        phase: "DISEÑO",
        transitionDays: 0,
        phaseDurationDays: 5,
      },
    ]);

    assert.equal(
      result.summary.continuousPhases,
      1,
    );
  });

  it("calcula los días totales de transición", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },
      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 5,
      },
      {
        phase: "DESARROLLO",
        transitionDays: 3,
        phaseDurationDays: 5,
      },
    ]);

    assert.equal(
      result.summary.totalTransitionDays,
      8,
    );
  });

  it("calcula cero días de transición cuando no existen pausas", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },
      {
        phase: "DISEÑO",
        transitionDays: 0,
        phaseDurationDays: 5,
      },
    ]);

    assert.equal(
      result.summary.totalTransitionDays,
      0,
    );
  });

  it("calcula los días totales de ejecución", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 10,
      },
      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 15,
      },
    ]);

    assert.equal(
      result.summary.totalExecutionDays,

      25,
    );
  });

  it("calcula cero días de ejecución para una línea temporal vacía", () => {
    const result = phaseStartService.buildProgramTimeline([]);

    assert.equal(
      result.summary.totalExecutionDays,

      0,
    );
  });

  it("calcula la eficiencia de ejecución del programa", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 20,
      },
      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 5,
      },
    ]);

    assert.equal(
      result.summary.executionEfficiencyPercentage,
      83.33,
    );
  });

  it("calcula eficiencia cero para una línea temporal vacía", () => {
    const result = phaseStartService.buildProgramTimeline([]);

    assert.equal(
      result.summary.executionEfficiencyPercentage,
      0,
    );
  });

  it("calcula el porcentaje de interrupción del programa", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 20,
      },
      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 5,
      },
    ]);

    assert.equal(
      result.summary.interruptionPercentage,
      16.67,
    );
  });

  it("calcula porcentaje de interrupción cero para una línea temporal vacía", () => {
    const result = phaseStartService.buildProgramTimeline([]);

    assert.equal(
      result.summary.interruptionPercentage,
      0,
    );
  });

  it("la eficiencia y la interrupción suman 100%", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 20,
      },
      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 5,
      },
    ]);

    assert.equal(
      result.summary.executionEfficiencyPercentage +
        result.summary.interruptionPercentage,
      100,
    );
  });


  it("calcula la densidad de fases por mes", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),

        phaseDurationDays: 10,
      },

      {
        phase: "DISEÑO",
        transitionDays: 5,
        phaseDurationDays: 10,
      },
    ]);

    assert.ok(result.summary.phasesPerMonth > 0);
  });

  it("calcula densidad cero para una línea temporal vacía", () => {
    const result = phaseStartService.buildProgramTimeline([]);

    assert.equal(result.summary.phasesPerMonth, 0);
  });

  it("redondea los porcentajes de eficiencia e interrupción a dos decimales", () => {
    const result = phaseStartService.buildProgramTimeline([
      {
        phase: "ANÁLISIS",
        phaseStartDate: new Date(2026, 1, 1),
        phaseDurationDays: 1,
      },
      {
        phase: "DISEÑO",
        transitionDays: 2,
      },
    ]);

    assert.equal(result.summary.executionEfficiencyPercentage, 33.33);
    assert.equal(result.summary.interruptionPercentage, 66.67);
  });


})