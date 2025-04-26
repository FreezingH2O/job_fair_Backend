const Interview = require('../models/Interview');
const Company = require('../models/Company');
const Position = require('../models/Position');
//@desc      Get all interviews
//@route     GET /api/v1/interviews
//@access    Public
exports.getInterviews = async (req, res, next) => {
    let query;

    // General users can only see their own interviews
    if (req.user.role !== 'admin') {
        query = Interview.find({ user: req.user.id })
            .populate({
                path: 'company',
                select: 'name province tel'
            })
            .populate({
                path: 'position',
                select: 'title description interviewStart interviewEnd'
            })
            .populate({
                path: 'user',
                select: 'email name'
            });
    } else {
        // Admins can see interviews by company or all
        if (req.params.companyId) {
            query = Interview.find({ company: req.params.companyId })
                .populate({
                    path: 'company',
                    select: 'name province tel'
                })
                .populate({
                    path: 'position',
                select: 'title description interviewStart interviewEnd'
                })
                .populate({
                    path: 'user',
                    select: 'email name'
                });
        } else {
            query = Interview.find()
                .populate({
                    path: 'company',
                    select: 'name province tel'
                })
                .populate({
                    path: 'position',
                select: 'title description interviewStart interviewEnd'
                })
                .populate({
                    path: 'user',
                    select: 'email name'
                });
        }
    }

    try {
        const interviews = await query.sort({ interviewDate: 1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            data: interviews
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error
        });
    }
};


//@desc      Get single interview
//@route     GET /api/v1/interviews/:id
//@access    Public
exports.getInterview = async(req,res,next)=>{
    try{
        const interview = await Interview.findById(req.params.id)
        .populate({
            path: 'company',
            select: 'name description tel'
        })
        .populate({
            path: 'position',
                select: 'title description interviewStart interviewEnd'
        })
        .populate({
            path: 'user',
            select: 'email name'
        });

        if(!interview){
            return res.status(400).json({
                success: false,
                message: `No interview with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success:true,
            data: interview
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error
        });
    }
};
//@desc      create interview
//@route     POST /api/v1/companies/:companyId/interviews/
//@route     POST /api/v1/interviews/
//@access    Private
exports.createInterview = async (req, res, next) => {
    try {
        const companyId = req.params.companyId;
        const { position: positionId, interviewDate } = req.body;

        req.body.company = companyId;

        // Validate company
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: `No company with the id of ${companyId}`
            });
        }

        // Validate position
        const position = await Position.findById(positionId);
        if (!position || position.company.toString() !== companyId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid position or it does not belong to the company'
            });
        }

        // ✅ Check if interviewDate is within allowed booking window
        const date = new Date(interviewDate);
        if (date < position.interviewStart || date > position.interviewEnd) {
            return res.status(400).json({
                success: false,
                message: `Interview date must be between ${position.interviewStart.toISOString()} and ${position.interviewEnd.toISOString()}`
            });
        }

        // Add user ID
        req.body.user = req.user.id;

        // Check limit
        const existing = await Interview.find({ user: req.user.id });
        if (existing.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `User ${req.user.email} has already made 3 interviews`
            });
        }

        // Create interview
        const interview = await Interview.create(req.body);

        res.status(201).json({
            success: true,
            data: interview
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error
        });
    }
};


//@desc      Update interview
//@route     PUT /api/v1/interviews/:id
//@access    Private
exports.updateInterview = async(req,res,next)=>{
    try{
        let interview = await Interview.findById(req.params.id);

        if(!interview){
            return res.status(404).json({
                success: false,
                message: `No interview with the id of ${req.params.id}`
            });
        }

        //Make sure user is the appointment owner
        if(interview.user.toString()!==req.user.id&&req.user.role!=='admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this interview`
            });
        }

        interview = await Interview.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: interview
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error
        });
    }
};

//@desc      Delete interview
//@route     DELETE /api/v1/interviews/:id
//@access    Private
exports.deleteInterview = async(req,res,next)=>{
    try{
        const interview = await Interview.findById(req.params.id);

        if(!interview){
            return res.status(404).json({
                success: false,
                message: `No interview with the id of ${req.params.id}`
            });
        }

        //Make sure user is the interview owner
        if(interview.user.toString()!==req.user.id&&req.user.role!=='admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this interview`
            });
        }

        await interview.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error
        });
    }
};