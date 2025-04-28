const express = require('express');
const {getInterviews,getInterview,createInterview,updateInterview,deleteInterview} = require('../controllers/interviews');

const router = express.Router({mergeParams:true});

const {protect,authorize} = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Interviews
 *   description: Interview management
 */

/**
 * @swagger
 * /api/v1/interviews:
 *   get:
 *     summary: Get all interviews
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of interviews
 *   post:
 *     summary: Create a new interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *               - date
 *             properties:
 *               position:
 *                 type: string
 *                 description: Position ID
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 description: Interview date
 *     responses:
 *       201:
 *         description: Successfully created an interview
 */

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   get:
 *     summary: Get a single interview by ID
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single interview
 *       404:
 *         description: Interview not found
 *   put:
 *     summary: Update an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Successfully updated interview
 *       404:
 *         description: Interview not found
 *   delete:
 *     summary: Delete an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted interview
 *       404:
 *         description: Interview not found
 */




router.route('/')
    .get(protect,getInterviews)
    .post(protect,authorize('admin','user'),createInterview);
router.route('/:id')
    .get(protect,getInterview)
    .put(protect,authorize('admin','user'),updateInterview)
    .delete(protect,authorize('admin','user'),deleteInterview);

module.exports = router;