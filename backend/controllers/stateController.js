const pool = require('../models/db');


// Get all states
exports.getStates = async (req, res) => {
    try {
      const query = `
        SELECT 
          state, 
          state_name, 
          created_date, 
          created_by, 
          updated_date, 
          updated_by 
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
  
      res.status(200).json({
        message: 'States retrieved successfully.',
        states: result.rows,
      });
  
    } catch (error) {
      console.error('Error fetching states:', error);
      res.status(500).json({
        message: 'Error fetching states.',
        error: error.message,
      });
    }
  };
  