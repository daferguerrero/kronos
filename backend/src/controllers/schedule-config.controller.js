import scheduleConfigService from "../services/schedule-config.service.js";
import validator from "../services/schedule-config-validator.service.js";

// Valida la solicitud, crea la configuración y devuelve el resultado al cliente.
export const create = async (req, res) => {

  const errors = validator.validate(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      errors,
    });
  }

  const config = scheduleConfigService.create(req.body);

  res.status(201).json(config);
};
