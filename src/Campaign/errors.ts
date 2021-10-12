export class NotFoundError extends Error {
  constructor() {
    super("Campaign not found")
  }
}
