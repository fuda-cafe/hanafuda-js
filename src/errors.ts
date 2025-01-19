export class InvalidCardError extends Error {
  constructor(index: number) {
    super(`Invalid card index: ${index}`)
    this.name = "InvalidCardError"
  }
}

export class DuplicateCardError extends Error {
  constructor(index: number) {
    super(`Card ${index} already exists in collection`)
    this.name = "DuplicateCardError"
  }
}

export class InvalidStateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidStateError"
  }
}
