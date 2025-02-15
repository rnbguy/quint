/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Special constraint cases for Quint types, including record and tuple related operators
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { Error, buildErrorLeaf } from '../errorTree'
import { expressionToString } from '../IRprinting'
import { QuintEx } from '../quintIr'
import { QuintType, QuintVarType } from '../quintTypes'
import { Constraint } from './base'
import { chunk, times } from 'lodash'

/*
 * Generate constraints for operators for which signatures cannot be expressed as normal signatures
 *
 * @param opcode The name of the operator
 * @param id The id of the component for which constraints are being generated
 * @param args The arguments to the operator and their respective types
 * @param resultTypeVar A fresh type variable for the result type
 *
 * @returns Either an error or a list of constraints
 */
export function specialConstraints(
  opcode: string,
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  switch (opcode) {
    // Record operators
    case 'Rec':
      return recordConstructorConstraints(id, args, resultTypeVar)
    case 'field':
      return fieldConstraints(id, args, resultTypeVar)
    case 'fieldNames':
      return fieldNamesConstraints(id, args, resultTypeVar)
    case 'with':
      return withConstraints(id, args, resultTypeVar)
    // Tuple operators
    case 'Tup':
      return tupleConstructorConstraints(id, args, resultTypeVar)
    case 'item':
      return itemConstraints(id, args, resultTypeVar)
    default:
      return right([])
  }
}

function recordConstructorConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  const constraints: Constraint[] = []
  // A record constructor has the normal form Rec('field1', value1, 'field2', value2, ...)
  // So we iterate over the arguments in pairs (chunks of size 2)
  //
  // - We can ignore the _keyType because we are verifying here that every key is a string litteral
  // - We can ignore the _value because we are only doing type checking
  const fields = chunk(args, 2).map(([[key, _keyType], [_value, valueType]]) => {
    if (key.kind !== 'str') {
      return left(
        buildErrorLeaf(
          `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
          `Record field name must be a name expression but is ${key.kind}: ${expressionToString(key)}`
        )
      )
    }

    return right({ fieldName: key.value, fieldType: valueType })
  })

  return mergeInMany(fields).map(fs => {
    const t: QuintType = { kind: 'rec', fields: { kind: 'row', fields: fs, other: { kind: 'empty' } } }
    const c: Constraint = { kind: 'eq', types: [t, resultTypeVar], sourceId: id }
    constraints.push(c)
    return constraints
  })
}

function fieldConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // We can ignore the _fieldNameType because we are verifying here that every key is a string litteral
  const [[_rec, recType], [fieldName, _fieldNameType]] = args

  if (fieldName.kind !== 'str') {
    return left(
      buildErrorLeaf(
        `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
        `Record field name must be a string expression but is ${fieldName.kind}: ${expressionToString(fieldName)}`
      )
    )
  }

  const generalRecType: QuintType = {
    kind: 'rec',
    fields: {
      kind: 'row',
      fields: [{ fieldName: fieldName.value, fieldType: resultTypeVar }],
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }

  const constraint: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }

  return right([constraint])
}

function fieldNamesConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  const [[_rec, recType]] = args

  const generalRecType: QuintType = { kind: 'rec', fields: { kind: 'var', name: `rec_${resultTypeVar.name}` } }

  const c1: Constraint = { kind: 'eq', types: [resultTypeVar, { kind: 'set', elem: { kind: 'str' } }], sourceId: id }
  const c2: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }

  return right([c1, c2])
}

function withConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // We can ignore the _fieldNameType because we are verifying here that every key is a string litteral
  const [[_rec, recType], [fieldName, _fieldNameType], [_value, valueType]] = args

  if (fieldName.kind !== 'str') {
    return left(
      buildErrorLeaf(
        `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
        `Record field name must be a string expression but is ${fieldName.kind}: ${expressionToString(fieldName)}`
      )
    )
  }

  const generalRecType: QuintType = {
    kind: 'rec',
    fields: {
      kind: 'row',
      fields: [{ fieldName: fieldName.value, fieldType: valueType }],
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }

  const c1: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }
  const c2: Constraint = { kind: 'eq', types: [resultTypeVar, generalRecType], sourceId: id }

  return right([c1, c2])
}

function tupleConstructorConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  const fields = args.map(([_, type], i) => {
    return { fieldName: `${i}`, fieldType: type }
  })

  const t2: QuintType = { kind: 'tup', fields: { kind: 'row', fields: fields, other: { kind: 'empty' } } }
  const c: Constraint = { kind: 'eq', types: [t2, resultTypeVar], sourceId: id }
  return right([c])
}

function itemConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // We can ignore the _itemNameType because we are verifying here that every key is a string litteral
  const [[_tup, tupType], [itemName, _itemNameType]] = args

  if (itemName.kind !== 'int') {
    return left(
      buildErrorLeaf(
        `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
        `Tup field index must be an int expression but is ${itemName.kind}: ${expressionToString(itemName)}`
      )
    )
  }

  // A tuple with item acess of N should have at least N fields
  // Fill previous fileds with type variables
  const fields: { fieldName: string; fieldType: QuintType }[] = times(Number(itemName.value - 1n)).map(i => {
    return { fieldName: `${i}`, fieldType: { kind: 'var', name: `tup_${resultTypeVar.name}_${i}` } }
  })
  fields.push({ fieldName: `${itemName.value - 1n}`, fieldType: resultTypeVar })

  const generalTupType: QuintType = {
    kind: 'tup',
    fields: {
      kind: 'row',
      fields: fields,
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }
  const constraint: Constraint = { kind: 'eq', types: [tupType, generalTupType], sourceId: id }

  return right([constraint])
}
