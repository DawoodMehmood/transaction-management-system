// controllers/authController.js
const pool = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { username, email, password, confirmPassword, states } = req.body;
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
  
    // Ensure that states is provided as an array
    if (!Array.isArray(states) || states.length === 0) {
      return res.status(400).json({ error: "Please provide at least one state for access" });
    }
  
    try {
      // Start a transaction
      await pool.query('BEGIN');
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const result = await pool.query(
        'INSERT INTO tkg.users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
      );
      const newUser = result.rows[0];
  
      // Insert access records into tkg.user_states
      for (const state of states) {
        await pool.query(
          'INSERT INTO tkg.user_states (user_id, state) VALUES ($1, $2)',
          [newUser.user_id, state]
        );
      }
  
      // Commit transaction
      await pool.query('COMMIT');
  
      res.status(201).json({ message: "Signup successful"});
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(err.message);
      res.status(500).json({ error: "Error signing up" });
    }
  };

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM tkg.users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return res.status(400).json({ error: "Invalid credentials" });
        }
        
        const statesResult = await pool.query(
          'SELECT state FROM tkg.user_states WHERE user_id = $1',
          [user.user_id]
        );
        const allowedStates = statesResult.rows.map(row => row.state);
        const token = jwt.sign(
          { userId: user.user_id, allowedStates }, 
          process.env.JWT_SECRET, 
          { expiresIn: '30d' }
        );
        res.status(200).json({ message: "Login successful", user: {username: user.username, role: user.role, token: token} });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error logging in" });
    }
};


exports.getUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        COALESCE(array_agg(us.state) FILTER (WHERE us.state IS NOT NULL), '{}') AS states
      FROM tkg.users u
      LEFT JOIN tkg.user_states us ON u.user_id = us.user_id
      WHERE u.role != 'superadmin'
      GROUP BY u.user_id, u.username, u.email;
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'No users found.',
      });
    }

    res.status(200).json({
      message: 'Users retrieved successfully.',
      users: result.rows,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Error fetching users.',
      error: error.message,
    });
  }
};



exports.deleteUser = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'User id is required' });
  }

  try {
    const deleteUserQuery = `
      DELETE FROM tkg.users
      WHERE user_id = $1;
    `;
    await pool.query(deleteUserQuery, [user_id]);

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user.', error: error.message });
  }
};


exports.editUser = async (req, res) => {
  const { user_id, username, email, password, states } = req.body;
  try {
    await pool.query('BEGIN');

    // If a new password is provided, update it; otherwise, update only username and email.
    let updateQuery, params;
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `
        UPDATE tkg.users
        SET username = $1, email = $2, password = $3
        WHERE user_id = $4
        RETURNING *
      `;
      params = [username, email, hashedPassword, user_id];
    } else {
      updateQuery = `
        UPDATE tkg.users
        SET username = $1, email = $2
        WHERE user_id = $3
        RETURNING *
      `;
      params = [username, email, user_id];
    }

    const userResult = await pool.query(updateQuery, params);
    if (userResult.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update user_states: remove existing and insert the new states.
    await pool.query('DELETE FROM tkg.user_states WHERE user_id = $1', [user_id]);
    for (const state of states) {
      await pool.query(
        'INSERT INTO tkg.user_states (user_id, state) VALUES ($1, $2)',
        [user_id, state]
      );
    }

    await pool.query('COMMIT');
    res.status(200).json({
      message: 'User updated successfully.',
      user: userResult.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating user:', error);
    res.status(500).json({
      message: 'Error updating user.',
      error: error.message
    });
  }
};
