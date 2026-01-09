const { TRIAGE_LEVELS } = require("../logic/TriageEngine");

const ROUTES = {
  EMERGENCY_RESULT: "EmergencyResultScreen",
  STANDARD_RESULT: "TriageResultScreen",
};

const getResultRoute = (triageLevel) => {
  if (triageLevel === TRIAGE_LEVELS.EMERGENCY) {
    return ROUTES.EMERGENCY_RESULT;
  }

  return ROUTES.STANDARD_RESULT;
};

module.exports = {
  ROUTES,
  getResultRoute,
};
