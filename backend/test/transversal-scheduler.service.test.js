import assert from "node:assert/strict";
import { describe, it } from "node:test";

import programSchedulerService from "../src/services/program-scheduler.service.js";

describe("transversal-scheduler", () => {
  it("programa competencias transversales", () => {
    const competencies = [
      {
        competencyCode: "240201526",
        competencyType: "TRANSVERSAL",
        learningActivities: [
          {
            learningActivityCode: "GA1-240201526-AA1",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    assert.equal(result.totalCompetencies, 1);

    assert.equal(result.competencies[0].competencyType,

      "TRANSVERSAL",
    );
  });

  it("conserva el tipo de competencia durante la programación", () => {
      const competencies = [
        {
          competencyCode: "240201526",
          competencyType: "TRANSVERSAL",
          learningActivities: [
            {
              learningActivityCode: "GA1-240201526-AA1",
              estimatedWeeks: 2,
            },
          ],
        },
      ];

      const result = programSchedulerService.schedule(
        competencies,
        new Date(2026, 1, 2),
      );

      assert.equal(result
        .competencies[0]
        .competencyType,

        "TRANSVERSAL",
      );
    },
  );
});
