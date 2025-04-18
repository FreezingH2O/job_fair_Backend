// models/Interview.js
const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true, 'Please add the company']
    },
    position: {
        type: mongoose.Schema.ObjectId,
        ref: 'Position',
        required: [true, 'Please add the position']
    },
    interviewDate: {
        type: Date,
        required: [true, 'Please add Interview Date']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interview', InterviewSchema);
