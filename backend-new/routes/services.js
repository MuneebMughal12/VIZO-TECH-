const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Package = require('../models/Package');
const auth = require('../middleware/auth');

// Helper to generate slug
const generateSlug = async (name, currentId = null) => {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  // Ensure uniqueness
  let uniqueSlug = slug;
  let count = 1;
  while (true) {
    const query = { slug: uniqueSlug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existing = await Service.findOne(query);
    if (!existing) {
      break;
    }
    uniqueSlug = `${slug}-${count}`;
    count++;
  }
  return uniqueSlug;
};

// GET /api/services - Get all services with package counts (Public & Admin)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ display_order: 1 });
    const servicesWithCount = await Promise.all(services.map(async (service) => {
      const packageCount = await Package.countDocuments({ serviceId: service._id });
      return {
        ...service.toObject(),
        packageCount
      };
    }));
    res.json(servicesWithCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/services - Create new service (Protected)
router.post('/', auth, async (req, res) => {
  const { name, emoji, description, display_order, is_active } = req.body;

  if (!name || !emoji || !description) {
    return res.status(400).json({ msg: 'Please provide name, emoji, and description' });
  }

  try {
    const slug = await generateSlug(name);
    const newService = new Service({
      name,
      slug,
      emoji,
      description,
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true
    });

    const service = await newService.save();
    
    // Add packageCount helper
    const serviceObj = service.toObject();
    serviceObj.packageCount = 0;

    res.json(serviceObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/services/reorder - Reorder services (Protected)
router.put('/reorder', auth, async (req, res) => {
  const { serviceIds } = req.body;
  if (!serviceIds || !Array.isArray(serviceIds)) {
    return res.status(400).json({ msg: 'Please provide an array of service IDs' });
  }

  try {
    const promises = serviceIds.map((id, index) => 
      Service.findByIdAndUpdate(id, { display_order: index }, { new: true })
    );
    await Promise.all(promises);
    res.json({ success: true, msg: 'Services reordered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/services/:id - Update service (Protected)
router.put('/:id', auth, async (req, res) => {
  const { name, emoji, description, display_order, is_active } = req.body;

  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    const updates = {};
    if (name !== undefined) {
      updates.name = name;
      updates.slug = await generateSlug(name, req.params.id);
    }
    if (emoji !== undefined) updates.emoji = emoji;
    if (description !== undefined) updates.description = description;
    if (display_order !== undefined) updates.display_order = display_order;
    if (is_active !== undefined) updates.is_active = is_active;

    service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    const packageCount = await Package.countDocuments({ serviceId: service._id });
    const serviceObj = service.toObject();
    serviceObj.packageCount = packageCount;

    res.json(serviceObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/services/:id - Delete service and cascade delete packages (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    // Cascade delete packages
    await Package.deleteMany({ serviceId: req.params.id });
    
    // Delete service
    await Service.findByIdAndDelete(req.params.id);

    res.json({ success: true, msg: 'Service and associated packages deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
