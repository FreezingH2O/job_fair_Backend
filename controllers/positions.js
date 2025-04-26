const Position = require('../models/Position');
const Company = require('../models/Company');
const Interview = require('../models/Interview');

// @desc    Get all positions
// @route   GET /api/v1/positions
// @route   GET /api/v1/companies/:companyId/positions
// @access  Public
exports.getPositions = async (req, res, next) => {
    try {
        let query;

        if (req.params.companyId) {
            query = Position.find({ company: req.params.companyId }).populate({
                path: 'company',
                select: 'name province tel'
            });
        } else {
            query = Position.find().populate({
                path: 'company',
                select: 'name province tel'
            });
        }

        const positions = await query.sort({title:1});

        res.status(200).json({
            success: true,
            count: positions.length,
            data: positions
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot get positions'
        });
    }
};

// @desc    Get single position
// @route   GET /api/v1/positions/:id
// @access  Public
exports.getPosition = async (req, res, next) => {
    try {
        const position = await Position.findById(req.params.id).populate({
            path: 'company',
            select: 'name province tel'
        });

        if (!position) {
            return res.status(404).json({
                success: false,
                message: `No position with the ID of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: position
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot get position'
        });
    }
};

// @desc    Create a position
// @route   POST /api/v1/companies/:companyId/positions
// @access  Private
exports.createPosition = async (req, res, next) => {
    
    try {

        const company = await Company.findById(req.params.companyId);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: `No company with the ID of ${req.params.companyId}`
            });
        }

        req.body.company = req.params.companyId;

        const position = await Position.create(req.body);
       

        res.status(201).json({
            success: true,
            data: position
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot create position'
        });
    }
};

// @desc    Update a position
// @route   PUT /api/v1/positions/:id
// @access  Private
exports.updatePosition = async (req, res, next) => {
    try {
        let position = await Position.findById(req.params.id);

        if (!position) {
            return res.status(404).json({
                success: false,
                message: `No position with the ID of ${req.params.id}`
            });
        }

        position = await Position.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: position
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot update position'
        });
    }
};


// @desc    Delete a position
// @route   DELETE /api/v1/positions/:id
// @access  Private
exports.deletePosition = async (req, res, next) => {
    try {
        const position = await Position.findById(req.params.id);

        if (!position) {
            return res.status(404).json({
                success: false,
                message: `No position with the ID of ${req.params.id}`
            });
        }

        await Interview.deleteMany({ position: req.params.id });

    
        await position.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot delete position'
        });
    }
};

///get all skill
// GET /api/v1/positions/skill
exports.getAllSkill = async (req, res, next) => {
    try {
        const result = await Position.aggregate([
            { $unwind: "$skill" },
            {
              $group: {
                _id: { $toLower: "$skill" },
                originalTag: { $first: "$skill" } // Keep original casing
              }
            },
            {
              $group: {
                _id: null,
                skill: { $addToSet: "$originalTag" }
              }
            },
            { $project: { _id: 0, skill: 1 } }
          ]);
          
          let skill = result[0]?.skill || []; // <-- use let instead of const
          skill = skill.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
          

        res.status(200).json({
            success: true,
            count: skill.length,
            data: skill
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch skill'
        });
    }
};