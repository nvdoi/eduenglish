import User from '../models/User.js';

const cleanupDemoUsers = async () => {
  try {
    // Xóa tất cả demo users (email có đuôi @demo.com)
    const result = await User.deleteMany({ 
      email: { $regex: /demo\.com$/ } 
    });
    
    
    // Hiển thị số lượng users thật còn lại
    const realUsersCount = await User.countDocuments({ 
      role: 'user',
      email: { $not: /demo\.com$/ }
    });
    
  
  } catch (error) {
    console.error('❌ Lỗi khi xóa demo users:', error.message);
  }
};

export default cleanupDemoUsers;
