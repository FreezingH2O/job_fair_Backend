const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title']
    },
    description: {
        type: String
    },
    responsibilities: {
        type: [String],
        default: [],
        maxlength: [50, 'Too many responsibilities']
    },
    requirements: {
        type: [String],
        default: [],
        maxlength: [50, 'Too many requirements']
    },
    skill: {
        type: [String],
        default: []
    },
    openingPosition: {
        type: Number,
        required: true,
        min: [1, 'There must be at least 1 position open']
    },
    salary: {
        type: {
          min: {
            type: Number,
            required: true,
            min: [0, 'Minimum salary must be a positive number'],
          },
          max: {
            type: Number,
            required: true,
            min: [0, 'Maximum salary must be a positive number'],
          },
        },
        required: true,
        validate: {
          validator: function (value) {
            return value.max >= value.min;
          },
          message: 'Maximum salary must be greater than or equal to minimum salary',
        },
      }
      
      
,       
    workArrangement: {
        type: String,
        enum: ['On-site', 'Remote', 'Hybrid'],
        default: 'On-site'
    },
    location: {
        type: String,
        required: [true, 'Please specify the work location']
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true, 'Position must belong to a company']
    },
    interviewStart: {
        type: Date,
        required: [true, 'Please add the start date for interview booking']
    },
    interviewEnd: {
        type: Date,
        required: [true, 'Please add the end date for interview booking'],
        validate: {
            validator: function (value) {
                return !this.interviewStart || value > this.interviewStart;
            },
            message: 'Interview end date must be after the start date'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Position', PositionSchema);
