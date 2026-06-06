import { body, validationResult } from 'express-validator';

// Validation handler middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Common validators
export const validators = {
  // Email validation
  email: () => body('email').isEmail().normalizeEmail(),

  // Password validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
  password: () =>
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and numbers'),

  // Name validation
  name: (fieldName = 'name') =>
    body(fieldName)
      .trim()
      .notEmpty()
      .withMessage(`${fieldName} is required`)
      .isLength({ min: 2, max: 100 })
      .withMessage(`${fieldName} must be between 2 and 100 characters`),

  // Phone validation
  phone: () =>
    body('phone')
      .trim()
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
      .withMessage('Invalid phone number format'),

  // URL validation
  url: (fieldName = 'url') => body(fieldName).isURL().withMessage('Invalid URL format'),

  // Number validation
  number: (fieldName = 'number', min = 0, max = null) => {
    let validator = body(fieldName).isNumeric();
    if (min !== null) validator = validator.custom(v => v >= min);
    if (max !== null) validator = validator.custom(v => v <= max);
    return validator;
  },

  // UUID validation
  uuid: (fieldName = 'id') =>
    body(fieldName)
      .isUUID()
      .withMessage(`${fieldName} must be a valid UUID`),

  // Boolean validation
  boolean: (fieldName) =>
    body(fieldName).isBoolean().withMessage(`${fieldName} must be a boolean`),

  // Date validation
  date: (fieldName = 'date') =>
    body(fieldName)
      .isISO8601()
      .withMessage(`${fieldName} must be a valid date (ISO 8601)`),

  // Enum validation
  enum: (fieldName, enumValues) =>
    body(fieldName)
      .isIn(enumValues)
      .withMessage(`${fieldName} must be one of: ${enumValues.join(', ')}`),
};

// Rule builders for common scenarios
export const authValidationRules = () => [
  validators.email(),
  validators.password(),
];

export const userValidationRules = () => [
  validators.email(),
  validators.name('firstName'),
  validators.name('lastName'),
  validators.phone(),
];

export const vendorValidationRules = () => [
  validators.name('companyName'),
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  validators.email(),
  validators.phone(),
  body('contactPersonName').notEmpty().withMessage('Contact person name is required'),
  body('street').notEmpty().withMessage('Street address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('postalCode').notEmpty().withMessage('Postal code is required'),
];

export const productValidationRules = () => [
  body('sku').notEmpty().withMessage('SKU is required'),
  validators.name('name'),
  validators.number('unitPrice', 0),
  validators.number('quantity', 0),
  validators.name('category'),
];

export const purchaseOrderValidationRules = () => [
  body('vendorId').notEmpty().withMessage('Vendor ID is required'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
];
