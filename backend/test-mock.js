const User = require('./models/User.mock');

async function testMockUser() {
  try {
    console.log('Testing mock user creation...');

    const userData = {
      email: 'test@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const user = await User.create(userData);
    console.log('User created successfully:', user);

    const foundUser = await User.findByEmail('test@test.com');
    console.log('User found:', foundUser);

    const isValid = await User.verifyPassword('password123', foundUser.password_hash);
    console.log('Password verification:', isValid);

  } catch (error) {
    console.error('Test error:', error);
  }
}

testMockUser();