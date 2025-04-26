const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ],
        required: [true, 'Please add a website']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    tel: {
        type: String
    },
    tags: {
        type: [String],
        default: []
    },
    logo: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
            'Please use a valid URL for the logo image'
        ]
    },
    companySize: {
        type: String,
        enum: [
            '1-10 employees',
            '11-50 employees',
            '51-200 employees',
            '201-500 employees',
            '501-1000 employees',
            '1000+ employees'
        ]
    },
    overview: {
        type: String,
        maxlength: [2000, 'Overview cannot be more than 2000 characters']
    },
    foundedYear: {
        type: Number,
        min: [1800, 'Year must be later than 1800'],
        max: [new Date().getFullYear(), 'Year cannot be in the future']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Reverse populate with virtuals
CompanySchema.virtual('interviews', {
    ref: 'Interview',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

module.exports = mongoose.model('Company', CompanySchema);
