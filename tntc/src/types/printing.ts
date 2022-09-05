import { typeToString } from '../IRprinting'
import { Constraint, TypeScheme } from './base'
import { Substitutions } from './substitutions'

/**
 * Formats the string representation of a constraint
 *
 * @param c the Constraint to be formatted
 *
 * @returns a string with the formatted constraint
 */
export function constraintToString (c: Constraint): String {
  switch (c.kind) {
    case 'eq': return `${typeToString(c.types[0])} ~ ${typeToString(c.types[1])}`
    case 'conjunction': return c.constraints.map(constraintToString).join(' /\\ ')
    case 'empty': return 'true'
  }
}

/**
 * Formats the string representation of a type scheme
 *
 * @param t the type scheme to be formatted
 *
 * @returns a string with the formatted type scheme
 */
export function typeSchemeToString (t: TypeScheme): String {
  const vars = Array.from(t.variables)
  const varsString = vars.length > 0 ? `∀${vars.join(', ')}.` : ''
  return `${varsString}${typeToString(t.type)}`
}

/**
 * Formats the string representation of substitutions
 *
 * @param s the Substitution to be formatted
 *
 * @returns a string with the pretty printed substitution
 */
export function substitutionsToString (subs: Substitutions): string {
  const subsString = subs.map(s => {
    return `${s.name} |-> ${typeToString(s.value)}`
  })

  return `[ ${subsString.join(', ')} ]`
}