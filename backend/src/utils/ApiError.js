class ApiError extends Error {
  constructor(
    message = "Something went wrong",
    status,
    stack = "",
    errors = [] 
  ) {
    super(message)
    this.status = status,
    this.errors = errors,
    this.data = null,
    this.success = false
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export {ApiError} 