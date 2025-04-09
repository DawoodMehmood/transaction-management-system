const pool = require('../models/db');


// Get all states
exports.getStates = async (req, res) => {
    try {
      const query = `
        SELECT 
          state, 
          state_name
        FROM 
          tkg.state
        ORDER BY state_name;
      `;
  
      const result = await pool.query(query);
  
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'No states found.',
        });
      }
      
      let states = result.rows;
      
      // If the user is not superadmin, get their allowed states.
      if (req.user && req.user.role !== 'superadmin' && req.user.allowedStates && req.user.allowedStates.length > 0) {
        states = states.filter(stateObj => req.user.allowedStates.includes(stateObj.state));
      }
    
      res.status(200).json({
        message: 'States retrieved successfully.',
        states: states,
      });
  
    } catch (error) {
      console.error('Error fetching states:', error);
      res.status(500).json({
        message: 'Error fetching states.',
        error: error.message,
      });
    }
  };
  