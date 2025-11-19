import User from '../models/User.js';

const createDemoUsers = async () => {
  try {
    // Check if demo users already exist
    const existingUsers = await User.find({ 
      email: { $in: ['user1@demo.com', 'user2@demo.com', 'user3@demo.com'] } 
    });
    
    if (existingUsers.length > 0) {
      console.log('Demo users already exist, skipping creation');
      return;
    }

    const demoUsers = [
      {
        username: 'demo_user_1',
        email: 'user1@demo.com',
        password: '123456',
        role: 'user',
        isActive: true
      },
      {
        username: 'demo_user_2',
        email: 'user2@demo.com',
        password: '123456',
        role: 'user',
        isActive: true
      },
      {
        username: 'demo_user_3',
        email: 'user3@demo.com',
        password: '123456',
        role: 'user',
        isActive: false
      },
      {
        username: 'demo_user_4',
        email: 'user4@demo.com',
        password: '123456',
        role: 'user',
        isActive: true
      },
      {
        username: 'demo_user_5',
        email: 'user5@demo.com',
        password: '123456',
        role: 'user',
        isActive: false
      }
    ];

    await User.insertMany(demoUsers);
    console.log('Demo users created successfully');
    console.log('Created 5 demo users (3 active, 2 inactive)');
  } catch (error) {
    console.error('Error creating demo users:', error.message);
  }
};

export default createDemoUsers;
