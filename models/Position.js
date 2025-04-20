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
    openingPosition: {
        type: Number,
        required: true,
        min: [1, 'There must be at least 1 position open']
    },    
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
