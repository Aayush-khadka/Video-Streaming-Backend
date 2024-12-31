const asynchandler = (requesthandler) => {
  (req, res, next) => {
    Promise.resolve(requesthandler(req, res, next)).catch((err) => next(err));
  };
};

export { asynchandler };
