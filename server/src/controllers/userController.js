const { loginUser, createEmployee, getAllEmployees, resetEmployeePassword, updateEmployee, deleteEmployee } = require('../services/userService');

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

/**
 * Reset employee password (Admin only)
 */
const resetEmployeePasswordHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ error: 'New password is required' });
      return;
    }

    const result = await resetEmployeePassword(userId, newPassword);
    
    res.status(200).json({
      message: 'Password reset successfully',
      ...result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Update employee (Admin only)
 */
const updateEmployeeAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, name, password } = req.body;

    if (!email && !name && !password) {
      res.status(400).json({ error: 'At least one field (email, name, or password) is required' });
      return;
    }

    // Email validation if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }
    }

    // Password validation if provided
    if (password && password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const employee = await updateEmployee(userId, { email, name, password });
    
    res.status(200).json({
      message: 'Employee updated successfully',
      user: employee,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update employee';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Delete employee (Admin only)
 */
const deleteEmployeeAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await deleteEmployee(userId);
    
    res.status(200).json({
      message: 'Employee deleted successfully',
      user: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete employee';
    res.status(400).json({ error: errorMessage });
  }
};

module.exports = {
  login,
  createEmployeeAccount,
  getEmployees,
  resetEmployeePasswordHandler,
  updateEmployeeAccount,
  deleteEmployeeAccount,
};

