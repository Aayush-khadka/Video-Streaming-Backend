class ApiResponse {
  constructor(statuscode, data, message = "Success") {
    this.stauscode = statuscode;
    this.data = data;
    this.message = message;
    this.stauscode = statuscode < 400;
  }
}

export { ApiResponse };
