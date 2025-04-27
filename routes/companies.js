const express = require('express');
const {getCompanies,getCompany,createCompany,updateCompany,deleteCompany,getAllTags} = require('../controllers/companies');

//Include other resource routers
const interviewRouter = require('./interviews');

const router = express.Router();

const {protect,authorize} = require('../middleware/auth');



/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management
 */

/**
 * @swagger
 * /api/v1/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of companies
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - website
 *               - address
 *               - description
 *               - companySize
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               address:
 *                 type: string
 *               tel:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               logo:
 *                 type: string
 *                 description: Company logo URL
 *               companySize:
 *                 type: string
 *                 description: Size of the company (e.g., "11-50 employees")
 *               overview:
 *                 type: string
 *                 description: Short company overview
 *               foundedYear:
 *                 type: integer
 *                 description: Year company was founded
 *     responses:
 *       201:
 *         description: Successfully created a company
 */


/**
 * @swagger
 * /api/v1/companies/{id}:
 *   get:
 *     summary: Get a single company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Company ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single company
 *       404:
 *         description: Company not found
 *   put:
 *     summary: Update a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Company ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               address:
 *                 type: string
 *               tel:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successfully updated company
 *       404:
 *         description: Company not found
 *   delete:
 *     summary: Delete a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Company ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted company
 *       404:
 *         description: Company not found
 */

/**
 * @swagger
 * /api/v1/companies/tags:
 *   get:
 *     summary: Get all company tags
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of tags
 */


//Re-route into other resource routers
router.use('/:companyId/interviews/',interviewRouter);

router.get('/tags', getAllTags); 
router.route('/').get(getCompanies).post(protect,authorize('admin'),createCompany);
router.route('/:id').get(getCompany).put(protect,authorize('admin'),updateCompany).delete(protect,authorize('admin'),deleteCompany);

module.exports = router;


