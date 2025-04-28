const express = require('express');
const {
    getPositions,
    getPosition,
    createPosition,
    updatePosition,
    deletePosition,
    getAllSkill
} = require('../controllers/positions');

const {protect,authorize} = require('../middleware/auth');


/**
 * @swagger
 * tags:
 *   name: Positions
 *   description: Job position management
 */

/**
 * @swagger
 * /api/v1/positions:
 *   get:
 *     summary: Get all positions
 *     tags: [Positions]
 *     responses:
 *       200:
 *         description: List of job positions
 *   post:
 *     summary: Create a new job position
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - salary
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               salary:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *               skill:
 *                 type: array
 *                 items:
 *                   type: string
 *               openingPosition:
 *                 type: integer
 *                 description: Number of open positions
 *               workArrangement:
 *                 type: string
 *                 description: e.g., "Remote", "On-site", "Hybrid"
 *               location:
 *                 type: string
 *               interviewStart:
 *                 type: string
 *                 format: date-time
 *               interviewEnd:
 *                 type: string
 *                 format: date-time
 *               company:
 *                 type: string
 *                 description: ID of the company
 *     responses:
 *       201:
 *         description: Successfully created a position
 */

/**
 * @swagger
 * /api/v1/positions/{id}:
 *   get:
 *     summary: Get a single position by ID
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Position ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single job position
 *       404:
 *         description: Position not found
 *   put:
 *     summary: Update a job position
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Position ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               salary:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *               skill:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successfully updated position
 *       404:
 *         description: Position not found
 *   delete:
 *     summary: Delete a job position
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Position ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted position
 *       404:
 *         description: Position not found
 */

/**
 * @swagger
 * /api/v1/positions/skills:
 *   get:
 *     summary: Get all skills from positions
 *     tags: [Positions]
 *     responses:
 *       200:
 *         description: List of skills
 */


const router = express.Router({ mergeParams: true });

router.get('/skills', getAllSkill); 
router.route('/').get(getPositions).post(protect,authorize('admin'),createPosition);
router.route('/:id')
    .get(getPosition)
    .put(protect,authorize('admin'),updatePosition)
    .delete(protect,authorize('admin'),deletePosition);

module.exports = router;
