const { loginUser, createEmployee, getAllEmployees } = require('../services/userService');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ error: errorMessage });
  }
};

const createEmployeeAccount = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const employee = await createEmployee({ email, password, name });
    res.status(201).json({
      message: 'Employee account created successfully',
      user: employee,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create employee';
    res.status(400).json({ error: errorMessage });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await getAllEmployees();
    res.status(200).json({ employees });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
    res.status(500).json({ error: errorMessage });
  }
};

module.exports = {
  login,
  createEmployeeAccount,
  getEmployees,
};

