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

const router = express.Router({ mergeParams: true });

router.get('/skills', getAllSkill); 
router.route('/').get(getPositions).post(protect,authorize('admin'),createPosition);
router.route('/:id')
    .get(getPosition)
    .put(protect,authorize('admin'),updatePosition)
    .delete(protect,authorize('admin'),deletePosition);

module.exports = router;
