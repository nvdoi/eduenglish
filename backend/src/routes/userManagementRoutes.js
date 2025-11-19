import express from 'express';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users - Lấy danh sách tất cả người dùng (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    
    // Build filter query
    let filter = { role: { $ne: 'admin' } }; // Exclude admin accounts
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('username email role isActive createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Calculate stats
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const inactiveUsers = await User.countDocuments({ role: 'user', isActive: false });
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng'
    });
  }
});

// PUT /api/users/:id/toggle-status - Khóa/Mở khóa tài khoản người dùng
router.put('/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Không cho phép khóa tài khoản admin
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không thể khóa tài khoản admin'
      });
    }
    
    // Toggle status
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      success: true,
      message: user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái người dùng'
    });
  }
});

// GET /api/users/:id - Lấy thông tin chi tiết một người dùng
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('username email role isActive createdAt updatedAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng'
    });
  }
});

// DELETE /api/users/:id - Xóa người dùng (Soft delete - chỉ set isActive = false)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Không cho phép xóa tài khoản admin
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa tài khoản admin'
      });
    }
    
    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();
    
    res.json({
      success: true,
      message: 'Đã vô hiệu hóa tài khoản người dùng'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa người dùng'
    });
  }
});

export default router;
