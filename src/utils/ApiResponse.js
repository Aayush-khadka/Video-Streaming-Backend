class ApiResponse {
  constructor(stauscode, data, message = "Success") {
    this.stauscode = statuscode;
    this.data = data;
    this.message = message;
    this.stauscode = statuscode < 400;
  }
}
