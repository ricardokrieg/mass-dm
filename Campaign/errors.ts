export class NotFoundError extends Error {
  constructor() {
    super("Campaign not found")
  }
}

export class MissingParamError extends Error {
  constructor(message: string) {
    super(message)
  }
}
