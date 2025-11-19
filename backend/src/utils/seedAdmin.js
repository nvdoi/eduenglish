import User from '../models/User.js';

// Tạo tài khoản admin mặc định
const createAdminUser = async () => {
  try {
    // Kiểm tra xem admin đã tồn tại chưa
    const adminExists = await User.findOne({ email: 'nvdoi2402@gmail.com' });
    
    if (!adminExists) {
      const adminUser = await User.create({
        username: 'admin',
        email: 'nvdoi2402@gmail.com',
        password: '123456',
        role: 'admin'
      });
      
      console.log('Tài khoản admin đã được tạo thành công:', adminUser.email);
    } else {
     // console.log('', adminExists.email);
    }
  } catch (error) {
    console.error('Lỗi khi tạo tài khoản admin:', error.message);
  }
};

export default createAdminUser;
