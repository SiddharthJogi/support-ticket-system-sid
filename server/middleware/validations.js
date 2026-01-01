/* server/middleware/validations.js */
const { body, validationResult } = require('express-validator');

// 1. Validation Rules for Creating a Ticket
const validateTicket = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10 }).withMessage('Description must be detailed (10+ chars)'),
    
    body('priority')
        .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level'),
    
    body('category')
        .isIn(['Policy', 'Payment', 'Technical', 'Billing']).withMessage('Invalid category'),

    // Middleware to check for errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateTicket };