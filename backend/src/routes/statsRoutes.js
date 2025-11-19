import express from 'express';
import {
  getOverviewStats,
  getUserLearningStats,
  getUserDetailStats,
  getCourseStats,
  getRecentActivities,
  getTimeSeriesStats
} from '../controllers/statsController.js';

const router = express.Router();

// Thống kê tổng quan cho dashboard
router.get('/overview', getOverviewStats);

// Thống kê người học
router.get('/users', getUserLearningStats);

// Thống kê chi tiết một người dùng
router.get('/users/:userId', getUserDetailStats);

// Thống kê theo khóa học
router.get('/courses', getCourseStats);

// Hoạt động gần đây
router.get('/activities', getRecentActivities);

// Thống kê theo thời gian (time series)
router.get('/timeseries', getTimeSeriesStats);

export default router;
