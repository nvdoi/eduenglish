import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseByIdFresh,
  getCourseByIdRaw,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.get('/:id/fresh', getCourseByIdFresh);
router.get('/:id/raw', getCourseByIdRaw);

// Admin only routes
router.post('/', protect, admin, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);


export default router;
