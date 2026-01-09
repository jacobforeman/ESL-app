const { TRIAGE_LEVELS } = require("../src/logic/TriageEngine");
const { ROUTES, getResultRoute } = require("../src/navigation/triageNavigation");

describe("triage navigation safety", () => {
  test("emergency results route to emergency screen", () => {
    const route = getResultRoute(TRIAGE_LEVELS.EMERGENCY);

    expect(route).toBe(ROUTES.EMERGENCY_RESULT);
    expect(route).not.toBe(ROUTES.STANDARD_RESULT);
  });
});
