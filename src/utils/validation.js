const CustomError = require('./Error');

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    throw CustomError.badRequest({
      message: 'Validation failed',
      errors,
      hints: 'Please check the provided data',
    });
  }
  return result.data;
};

module.exports = { validate };
