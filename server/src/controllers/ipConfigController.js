const IPConfig = require('../models/IPConfig');

/**
 * Get all IP configurations
 */
const getAllIPConfigs = async (req, res) => {
  try {
    const configs = await IPConfig.find().sort({ createdAt: -1 });
    res.status(200).json({ ipConfigs: configs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch IP configurations';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Create new IP configuration
 */
const createIPConfig = async (req, res) => {
  try {
    const { name, ipAddress, subnet, description, isActive } = req.body;

    if (!name || !ipAddress) {
      return res.status(400).json({ error: 'Name and IP address are required' });
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      return res.status(400).json({ error: 'Invalid IP address format' });
    }

    const config = await IPConfig.create({
      name,
      ipAddress,
      subnet,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: 'IP configuration created successfully',
      ipConfig: config,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create IP configuration';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Update IP configuration
 */
const updateIPConfig = async (req, res) => {
  try {
    const { configId } = req.params;
    const { name, ipAddress, subnet, description, isActive } = req.body;

    const config = await IPConfig.findById(configId);

    if (!config) {
      return res.status(404).json({ error: 'IP configuration not found' });
    }

    if (ipAddress) {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(ipAddress)) {
        return res.status(400).json({ error: 'Invalid IP address format' });
      }
      config.ipAddress = ipAddress;
    }

    if (name) config.name = name;
    if (subnet !== undefined) config.subnet = subnet;
    if (description !== undefined) config.description = description;
    if (isActive !== undefined) config.isActive = isActive;

    await config.save();

    res.status(200).json({
      message: 'IP configuration updated successfully',
      ipConfig: config,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update IP configuration';
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * Delete IP configuration
 */
const deleteIPConfig = async (req, res) => {
  try {
    const { configId } = req.params;

    const config = await IPConfig.findByIdAndDelete(configId);

    if (!config) {
      return res.status(404).json({ error: 'IP configuration not found' });
    }

    res.status(200).json({
      message: 'IP configuration deleted successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete IP configuration';
    res.status(500).json({ error: errorMessage });
  }
};

module.exports = {
  getAllIPConfigs,
  createIPConfig,
  updateIPConfig,
  deleteIPConfig,
};

