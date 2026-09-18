import assert from "node:assert/strict";
import { describe, it } from "node:test";

import generalScheduleService from "../src/services/general-schedule.service.js";

describe("general-schedule", () => {
  it("construye un cronograma general", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      programStartDate: new Date(2026, 1, 2),
      programEndDate: new Date(2026, 5, 30),
      competencies: [{}, {}],
      phases: [{}, {}],
    });

    assert.equal(result.totalCompetencies, 2);
    assert.equal(result.totalPhases, 2);
  });

  it("mantiene las fechas generales del programa", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      programStartDate: new Date(2026, 1, 2),
      programEndDate: new Date(2026, 5, 30),
    });

    assert.ok(result.programStartDate);
    assert.ok(result.programEndDate);
  });

  it("calcula métricas globales del cronograma", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      programStartDate: new Date(2026, 1, 2),
      programEndDate: new Date(2026, 5, 30),
      competencies: [
        {
          totalLearningActivities: 2,
          totalWeeks: 3,
          totalEvidences: 5,
        },

        {
          totalLearningActivities: 1,
          totalWeeks: 2,
          totalEvidences: 2,
        },
      ],
      phases: [{}, {}],
    });

    assert.equal(result.totalLearningActivities, 3);
    assert.equal(result.totalWeeks, 5);
    assert.equal(result.totalEvidences, 7);
  });

  it("mantiene competencias y fases en el cronograma", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [{}, {}],
      phases: [{}],
    });

    assert.equal(result.competencies.length, 2);
    assert.equal(result.phases.length, 1);
  });

  it("cuenta competencias técnicas y transversales", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [
        { competencyType: "TECHNICAL" },
        { competencyType: "TECHNICAL" },
        { competencyType: "TRANSVERSAL" },
      ],
    });

    assert.equal(result.totalTechnicalCompetencies, 2);
    assert.equal(result.totalTransversalCompetencies, 1);
  });

  it("calcula la duración del programa en días", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      programStartDate: new Date(2026, 1, 2),
      programEndDate: new Date(2026, 1, 16),
    });

    assert.equal(result.programDurationDays, 14);
  });

  it("calcula la duración del programa en semanas", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      programStartDate: new Date(2026, 1, 2),
      programEndDate: new Date(2026, 1, 16),
    });

    assert.equal(result.programDurationWeeks, 2);
  });

  it("calcula el inicio real del cronograma", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      programStartDate: new Date(2026, 1, 2),

      phases: [
        {
          startDate: new Date(2026, 1, 10),
        },
      ],
    });

    assert.equal(
      result.scheduleStartDate.toISOString().substring(0, 10),
      "2026-02-10",
    );
  });

  it("calcula el fin real del cronograma", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      programEndDate: new Date(2026, 5, 30),

      phases: [
        {
          endDate: new Date(2026, 4, 30),
        },
      ],
    });

    assert.equal(
      result.scheduleEndDate.toISOString().substring(0, 10),
      "2026-05-30",
    );
  });

  it("genera un resumen ejecutivo del cronograma", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [
        {
          competencyType: "TECHNICAL",
          totalLearningActivities: 2,
          totalWeeks: 3,
          totalEvidences: 5,
        },
      ],

      phases: [{}],
    });

    assert.ok(result.summary);
    assert.equal(result.summary.totalCompetencies, 1);
    assert.equal(result.summary.totalTechnicalCompetencies, 1);
  });

  it("mantiene sincronizadas las métricas del resumen", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [
        {
          competencyType: "TECHNICAL",
          totalLearningActivities: 2,
          totalWeeks: 3,
          totalEvidences: 5,
        },
      ],

      phases: [{}],
    });

    assert.equal(result.summary.totalWeeks, result.totalWeeks);
    assert.equal(result.summary.totalEvidences, result.totalEvidences);
  });

  it("calcula el porcentaje de competencias técnicas", () => {
    const result = generalScheduleService.buildGeneralSchedule({
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
      result.summary.technicalCompetencyPercentage, 67,
    );
  });

  it("calcula el porcentaje de competencias transversales", () => {
    const result = generalScheduleService.buildGeneralSchedule({
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
      result.summary.transversalCompetencyPercentage, 33,
    );
  });

  it("calcula actividades de aprendizaje por competencia", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [
        {
          totalLearningActivities: 4,
          totalEvidences: 8,
        },

        {
          totalLearningActivities: 2,
          totalEvidences: 4,
        },
      ],
    });

    assert.equal(
      result.summary.learningActivitiesPerCompetency, 3,
    );
  });

  it("calcula evidencias por actividad de aprendizaje", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [
        {
          totalLearningActivities: 3,
          totalEvidences: 6,
        },
      ],
    });

    assert.equal(
      result.summary.evidencesPerLearningActivity, 2,
    );
  });

  it("calcula el promedio de semanas por competencia", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [
        {
          totalWeeks: 4,
        },

        {
          totalWeeks: 2,
        },
      ],
    });

    assert.equal(
      result.summary.averageWeeksPerCompetency, 3,
    );
  });

  it("calcula el promedio de evidencias por competencia", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [
        {
          totalEvidences: 6,
        },

        {
          totalEvidences: 2,
        },
      ],
    });

    assert.equal(
      result.summary.averageEvidencesPerCompetency, 4,
    );
  });

  it("calcula actividades de aprendizaje por semana", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [
        {
          totalLearningActivities: 6,
          totalWeeks: 3,
        },
      ],
    });

    assert.equal(
      result.summary.learningActivitiesPerWeek, 2,
    );
  });

  it("calcula evidencias por semana", () => {
    const result = generalScheduleService.buildGeneralSchedule({
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

  it("calcula el porcentaje de cobertura del cronograma", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      programStartDate: new Date(2026, 1, 2),
      programEndDate: new Date(2026, 2, 2),

      competencies: [
        {
          totalWeeks: 2,
        },
      ],
    });

    assert.ok(result.summary.scheduleCoveragePercentage > 0);
  });

  it("calcula semanas sin planificar", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      programStartDate: new Date(2026, 1, 2),
      programEndDate: new Date(2026, 2, 2),
      competencies: [
        {
          totalWeeks: 2,
        },
      ],
    });

    assert.ok(result.summary.unplannedWeeks >= 0);
  });

  it("calcula competencias por semana", () => {
    const result = generalScheduleService.buildGeneralSchedule({
      competencies: [{}, {}, {}, {}],
      phases: [{}],
      programStartDate: new Date(2026, 1, 2),
      programEndDate: new Date(2026, 2, 2),
      competencies: [{ totalWeeks: 2 }, { totalWeeks: 2 }],
    });

    assert.equal(
      result.summary.competenciesPerWeek, 0.5,
    );
  });
});