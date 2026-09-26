import assert from "node:assert/strict";
import { describe, it } from "node:test";

import phaseScheduleService from "../src/services/phase-schedule.service.js";

describe("cronograma de fases", () => {
  it("construye un cronograma por fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [{}, {}],
    });

    assert.equal(result.phase, "ANÁLISIS");
    assert.equal(result.totalCompetencies, 2);
  });

  it("mantiene las competencias asociadas a la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [{ competencyCode: "220501092" }],
    });

    assert.equal(result.competencies.length, 1);
    assert.equal(result.competencies[0].competencyCode,
      "220501092",
    );
  });

  it("calcula métricas de la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          totalWeeks: 3,
          totalEvidences: 2,
          totalLearningActivities: 4,
        },
        {
          totalWeeks: 2,
          totalEvidences: 1,
          totalLearningActivities: 3,
        },
      ],
    });

    assert.equal(result.totalWeeks, 5);
    assert.equal(result.totalEvidences, 3);
    assert.equal(result.totalLearningActivities, 7);
  });

  it("calcula el inicio de la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          startDate: new Date(2026, 1, 2),
        },

        {
          startDate: new Date(2026, 1, 10),
        },
      ],
    });

    assert.equal(result.phaseStartDate.toISOString().substring(0, 10),
      "2026-02-02",
    );
  });

  it("calcula el fin de la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          endDate: new Date(2026, 1, 20),
        },

        {
          endDate: new Date(2026, 2, 10),
        },
      ],
    });

    assert.equal(result.phaseEndDate.toISOString().substring(0, 10),
      "2026-03-10",
    );
  });

  it("mantiene las fechas indefinidas cuando no existen competencias", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [],
    });

    assert.equal(result.phaseStartDate, undefined);
    assert.equal(result.phaseEndDate, undefined);
  });

  it("calcula la duración de la fase en días", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          startDate: new Date(2026, 1, 2),
          endDate: new Date(2026, 1, 16),
        },
      ],
    });

    assert.equal(result.phaseDurationDays, 14);
  });

  it("calcula la duración de la fase en semanas", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          startDate: new Date(2026, 1, 2),
          endDate: new Date(2026, 1, 16),
        },
      ],
    });

    assert.equal(result.phaseDurationWeeks, 2);
  });

  it("genera un resumen ejecutivo de la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          totalWeeks: 3,
          totalEvidences: 6,
          totalLearningActivities: 4,
        },

        {
          totalWeeks: 2,
          totalEvidences: 2,
          totalLearningActivities: 2,
        },
      ],
    });

    assert.ok(result.summary);
    assert.equal(result.summary.totalCompetencies, 2);
    assert.equal(result.summary.totalLearningActivities, 6);
  });

  it("calcula indicadores del resumen de fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",

      competencies: [
        {
          totalWeeks: 3,
          totalEvidences: 6,
          totalLearningActivities: 4,
        },

        {
          totalWeeks: 2,
          totalEvidences: 2,
          totalLearningActivities: 2,
        },
      ],
    });

    assert.equal(
      result.summary.learningActivitiesPerCompetency, 3,
    );

    assert.equal(
      result.summary.evidencesPerCompetency, 4,
    );
  });

  it("calcula el porcentaje de cobertura de la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          startDate: new Date(2026, 1, 2),
          endDate: new Date(2026, 1, 16),
          totalWeeks: 2,
        },
      ],
    });

    assert.ok(result.summary.phaseCoveragePercentage > 0);
  });

  it("calcula semanas sin planificar en la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",

      competencies: [
        {
          startDate: new Date(2026, 1, 2),
          endDate: new Date(2026, 1, 16),
          totalWeeks: 1,
        },
      ],
    });

    assert.ok(result.summary.unplannedWeeks >= 0);
  });

  it("calcula actividades de aprendizaje por semana en la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          totalLearningActivities: 6,
          totalWeeks: 3,
        },
      ],
    });

    assert.equal(result.summary.learningActivitiesPerWeek, 2,
    );
  });

  it("calcula evidencias por semana en la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          totalLearningActivities: 6,
          totalWeeks: 3,
          totalEvidences: 9,
        },
      ],
    });

    assert.equal(
      result.summary.evidencesPerWeek, 3,
    );
  });

  it("clasifica una fase técnica", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          competencyType: "TECHNICAL",
        },
      ],
    });

    assert.equal(result.phaseType, "TECHNICAL");
  });

  it("clasifica una fase transversal", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          competencyType: "TRANSVERSAL",
        },
      ],
    });

    assert.equal(result.phaseType, "TRANSVERSAL");
  });

  it("clasifica una fase mixta", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          competencyType: "TECHNICAL",
        },

        {
          competencyType: "TRANSVERSAL",
        },
      ],
    });

    assert.equal(result.phaseType, "MIXED");
  });

  it("calcula el porcentaje de competencias técnicas en la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          competencyType: "TECHNICAL",
        },

        {
          competencyType: "TECHNICAL",
        },

        {
          competencyType: "TRANSVERSAL",
        },
      ],
    });

    assert.equal(
      result.summary.technicalCompetencyPercentage, 66.67,
    );
  });

  it("calcula el porcentaje de competencias transversales en la fase", () => {
    const result = phaseScheduleService.buildPhaseSchedule({
      phase: "ANÁLISIS",
      competencies: [
        {
          competencyType: "TECHNICAL",
        },

        {
          competencyType: "TECHNICAL",
        },

        {
          competencyType: "TRANSVERSAL",
        },
      ],
    });

    assert.equal(
      result.summary.transversalCompetencyPercentage, 33.33,
    );
  });

  it("relaciona fases consecutivas", () => {
    const result = phaseScheduleService.linkPhaseSequence([
      {
        phase: "ANÁLISIS",
      },
      {
        phase: "DISEÑO",
      },
      {
        phase: "DESARROLLO",
      },
    ]);

    assert.equal(result[0].nextPhase, "DISEÑO");
    assert.equal(result[1].previousPhase, "ANÁLISIS");
    assert.equal(result[1].nextPhase, "DESARROLLO");
  });

  it("identifica los extremos de la secuencia", () => {
    const result = phaseScheduleService.linkPhaseSequence([
      {
        phase: "ANÁLISIS",
      },
      {
        phase: "DISEÑO",
      },
    ]);

    assert.equal(result[0].previousPhase, null);
    assert.equal(result[1].nextPhase, null);
  });

  it("calcula la transición entre fases", () => {
    const result = phaseScheduleService.calculatePhaseTransitions([
      {
        phase: "ANÁLISIS",
        phaseEndDate: new Date(2026, 1, 10),
      },
      {
        phase: "DISEÑO",
        phaseStartDate: new Date(2026, 1, 15),
      },
    ]);

    assert.equal(result[0].transitionDays, 5);
    assert.equal(result[1].transitionDays, null);
  });

  it("mantiene transición nula para la última fase", () => {
    const result = phaseScheduleService.calculatePhaseTransitions([
      {
        phase: "ANÁLISIS",
      },
    ]);

    assert.equal(
      result[0].transitionDays, null,
    );
  });

  it("detecta pausas entre fases", () => {
    const result = phaseScheduleService.calculatePhaseTransitions([
      {
        phase: "ANÁLISIS",
        phaseEndDate: new Date(2026, 1, 10),
      },
      {
        phase: "DISEÑO",
        phaseStartDate: new Date(2026, 1, 15),
      },
    ]);

    assert.equal(result[0].hasGap, true);
  });

  it("detecta continuidad entre fases", () => {
    const result = phaseScheduleService.calculatePhaseTransitions([
      {
        phase: "ANÁLISIS",
        phaseEndDate: new Date(2026, 1, 10),
      },
      {
        phase: "DISEÑO",
        phaseStartDate: new Date(2026, 1, 10),
      },
    ]);

    assert.equal(result[0].hasGap, false);
  });

  it("asigna el orden de cada fase", () => {
    const result = phaseScheduleService.linkPhaseSequence([
      {
        phase: "ANÁLISIS",
      },
      {
        phase: "DISEÑO",
      },
      {
        phase: "DESARROLLO",
      },
    ]);

    assert.equal(result[0].phaseOrder, 1);
    assert.equal(result[1].phaseOrder, 2);
    assert.equal(result[2].phaseOrder, 3);
  });

  it("informa el total de fases de la secuencia", () => {
    const result = phaseScheduleService.linkPhaseSequence([
      {
        phase: "ANÁLISIS",
      },
      {
        phase: "DISEÑO",
      },
      {
        phase: "DESARROLLO",
      },
    ]);

    assert.equal(result[0].totalPhases, 3);
    assert.equal(result[1].totalPhases, 3);
    assert.equal(result[2].totalPhases, 3);
  });

  it("construye la ruta de fases del programa", () => {
    const result = phaseScheduleService.buildPhaseRoadmap([
      {
        phase: "ANÁLISIS",
        phaseOrder: 1,
        nextPhase: "DISEÑO",
      },

      {
        phase: "DISEÑO",
        phaseOrder: 2,
        previousPhase: "ANÁLISIS",
        nextPhase: "DESARROLLO",
      },

      {
        phase: "DESARROLLO",
        phaseOrder: 3,
        previousPhase: "DISEÑO",
      },
    ]);

    assert.equal(result.length, 3);
  });

  it("mantiene el orden de la ruta de fases", () => {
    const result = phaseScheduleService.buildPhaseRoadmap([
      {
        phase: "ANÁLISIS",
        phaseOrder: 1,
      },

      {
        phase: "DISEÑO",
        phaseOrder: 2,
      },
    ]);

    assert.equal(result[0].phaseOrder, 1);
    assert.equal(result[1].phaseOrder, 2);
  });

  it("construye un programa de fases", () => {
    const result = phaseScheduleService.buildPhaseProgram([
      {
        phase: "ANÁLISIS",
      },
      {
        phase: "DISEÑO",
      },
    ]);

    assert.equal(result.totalPhases, 2);
    assert.equal(result.phases.length, 2);
  });

  it("incluye la ruta del programa de fases", () => {
    const result = phaseScheduleService.buildPhaseProgram([
      {
        phase: "ANÁLISIS",
      },
      {
        phase: "DISEÑO",
      },
    ]);

    assert.equal(result.roadmap.length, 2);
  });
});
