const bcrypt = require('bcryptjs');

let users = [];
let nextId = 1;

class MockUser {
  static async create(userData) {
    try {
      const { email, password, firstName, lastName, company, jobTitle } = userData;

      // Check for existing user
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = {
        id: nextId++,
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        company: company || '',
        job_title: jobTitle || '',
        bio: null,
        profile_image_url: null,
        linkedin_url: null,
        created_at: new Date().toISOString()
      };

      users.push(user);

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        company: user.company,
        job_title: user.job_title,
        created_at: user.created_at
      };
    } catch (error) {
      console.error('Mock User create error:', error.message);
      throw error;
    }
  }

  static async findByEmail(email) {
    return users.find(u => u.email === email);
  }

  static async findById(id) {
    const user = users.find(u => u.id === parseInt(id));
    if (user) {
      const { password_hash, ...userResponse } = user;
      return userResponse;
    }
    return null;
  }

  static async update(id, updateData) {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        users[userIndex][key] = updateData[key];
      }
    });

    users[userIndex].updated_at = new Date().toISOString();

    const { password_hash, ...userResponse } = users[userIndex];
    return userResponse;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static getAllUsers() {
    return users.map(({ password_hash, ...user }) => user);
  }

  static clearAll() {
    users = [];
    nextId = 1;
  }
}

module.exports = MockUser;