import type { OperationKind, OperationPayload, OutboxOperation } from '../domain/models'

type NewOperation = {
  id: string
  kind: OperationKind
  recipientWebId?: string
  inbox?: string
  payload: OperationPayload
}

export function enqueueOperation(operations: OutboxOperation[], input: NewOperation): OutboxOperation[] {
  if (operations.some((operation) => operation.id === input.id)) return operations
  return [...operations, { ...input, status: 'PENDING', attempts: 0, createdAt: new Date().toISOString() }]
}

export function markOperationFailed(operation: OutboxOperation, cause: unknown): OutboxOperation {
  return {
    ...operation,
    status: 'FAILED',
    attempts: operation.attempts + 1,
    error: cause instanceof Error ? cause.message : 'The remote operation failed.',
  }
}

export function markOperationSucceeded(operation: OutboxOperation): OutboxOperation {
  return { ...operation, status: 'SUCCEEDED', attempts: operation.attempts + 1, error: undefined }
}
