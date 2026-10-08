import { z } from 'zod'

/**
 * Valida únicamente los mínimos de seguridad mediante lookaheads:
 *  - Al menos una letra mayúscula
 *  - Al menos un dígito
 *  - Al menos un carácter que no sea letra ni dígito (cualquier símbolo)
 *
 * No restringe el conjunto de caracteres restante, por lo que contraseñas
 * generadas por gestores de contraseñas (con puntos, guiones, espacios,
 * corchetes, etc.) son aceptadas sin problema.
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(128, 'Máximo 128 caracteres')
  .regex(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/,
    'Debe contener al menos una mayúscula, un número y un símbolo'
  )
