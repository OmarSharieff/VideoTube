class ApiResponse {
  constructor(
    message = "Success",
    statusCode,
    data
  ) {
    this.data = data,
    this.statusCode = statusCode < 400,
    this.message = message,
    this.success = true
  }
}