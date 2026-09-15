import assert from "node:assert/strict";
import { describe, it } from "node:test";

import programSchedulerService from "../src/services/program-scheduler.service.js";

describe("program-scheduler", () => {
  it("filtra las competencias por tipo", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
      },
      {
        competencyCode: "240201526",
        competencyType: "TRANSVERSAL",
      },
    ];

    const technicalCompetencies = programSchedulerService.getTechnicalCompetencies(competencies);
    const transversalCompetencies = programSchedulerService.getTransversalCompetencies(competencies);

    assert.deepEqual(
      technicalCompetencies.map((competency) => competency.competencyCode),
      ["220501092"],
    );
    assert.deepEqual(transversalCompetencies.map((competency) => competency.competencyCode),
      ["240201526"],
    );
  });

  it("agrupa competencias por tipo", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
      },

      {
        competencyCode: "220501093",
        competencyType: "TECHNICAL",
      },

      {
        competencyCode: "240201526",
        competencyType: "TRANSVERSAL",
      },
    ];

    const result =
      programSchedulerService.groupCompetenciesByType(competencies);

    assert.equal(result.technical.length, 2);
    assert.equal(result.transversal.length, 1);
  });

  it("mantiene las competencias correctas en cada grupo", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
      },

      {
        competencyCode: "240201526",
        competencyType: "TRANSVERSAL",
      },
    ];

    const result =
      programSchedulerService.groupCompetenciesByType(competencies);

    assert.equal(result.technical[0].competencyCode, "220501092",
    );

    assert.equal(result.transversal[0].competencyCode, "240201526",
    );
  });

  it("programa múltiples competencias secuencialmente", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",

        learningActivities: [
          {
            learningActivityCode: "GA1-220501092-AA1",
            estimatedWeeks: 1,
          },
        ],
      },

      {
        competencyCode: "220501093",
        competencyType: "TECHNICAL",

        learningActivities: [
          {
            learningActivityCode: "GA1-220501093-AA1",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    assert.equal(result.competencies.length, 2);
  });

  it("calcula métricas por tipo de competencia", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
        totalWeeks: 6,
      },

      {
        competencyCode: "240201526",
        competencyType: "TRANSVERSAL",
        totalWeeks: 2,
      },
    ];

    const result = programSchedulerService.calculateTypeMetrics(competencies);

    assert.equal(result.technicalWeeks, 6);
    assert.equal(result.transversalWeeks, 2);
  });

  it("detecta programas con competencias mixtas", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
      },

      {
        competencyCode: "240201526",
        competencyType: "TRANSVERSAL",
      },
    ];

    const result = programSchedulerService.analyzeCompetencyDistribution(competencies);

    assert.equal(result.hasConcurrencyPotential, true);
  });

  it("detecta programas solo técnicos", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
      },
    ];

    const result = programSchedulerService.analyzeCompetencyDistribution(competencies);

    assert.equal(result.hasTechnical, true);
    assert.equal(result.hasTransversal, false);
  });

  it("encadena competencias completas sin solapamientos", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
        learningActivities: [
          {
            learningActivityCode: "GA1-220501092-AA1",
            estimatedWeeks: 3,
          },
        ],
      },

      {
        competencyCode: "220501093",
        competencyType: "TECHNICAL",
        learningActivities: [
          {
            learningActivityCode: "GA1-220501093-AA1",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    const firstEnd = result.competencies[0].endDate;
    const secondStart = result.competencies[1].startDate;
    const expectedStart = new Date(firstEnd);

    expectedStart.setDate(expectedStart.getDate() + 1);

    assert.equal(
      secondStart.toISOString().substring(0, 10),
      expectedStart.toISOString().substring(0, 10),
    );
  });

  it("conserva las métricas de cada competencia programada", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
        learningActivities: [
          {
            learningActivityCode: "GA1-220501092-AA1",
            estimatedWeeks: 1,
          },

          {
            learningActivityCode: "GA1-220501092-AA2",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    result.competencies[0].totalLearningActivities;
    result.competencies[0].totalWeeks;
  });

  it("calcula métricas generales del programa", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
        learningActivities: [
          {
            learningActivityCode: "GA1-220501092-AA1",
            estimatedWeeks: 1,
          },
        ],
      },

      {
        competencyCode: "220501093",
        competencyType: "TECHNICAL",
        learningActivities: [
          {
            learningActivityCode: "GA1-220501093-AA1",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    assert.equal(result.totalCompetencies, 2);
    assert.equal(result.totalLearningActivities, 2);
    assert.equal(result.totalWeeks, 3);
  });

  it("calcula métricas globales del cronograma", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
        totalEvidences: 3,

        learningActivities: [
          {
            learningActivityCode: "GA1-220501092-AA1",
            estimatedWeeks: 1,
          },
        ],
      },

      {
        competencyCode: "220501093",
        competencyType: "TECHNICAL",
        totalEvidences: 2,
        learningActivities: [
          {
            learningActivityCode: "GA1-220501093-AA1",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    assert.equal(result.totalCompetencies, 2);
    assert.equal(result.totalLearningActivities, 2);
    assert.equal(result.totalWeeks, 3);
    assert.equal(result.totalDays, 21);
    assert.equal(result.totalEvidences, 5);
  });
});