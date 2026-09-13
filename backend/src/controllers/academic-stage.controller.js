import academicStageService from "../services/academic-stage.service.js";

// Calcula las etapas académicas con los datos recibidos y devuelve el resultado en JSON.
export const calculate = async (req, res) => {
  const result = academicStageService.calculate(req.body);

  res.json(result);
};
