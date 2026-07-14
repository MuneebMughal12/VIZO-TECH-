const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const auth = require('../middleware/auth');

// Helper to generate slug for package
const generateSlug = async (name, currentId = null) => {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  let uniqueSlug = slug;
  let count = 1;
  while (true) {
    const query = { slug: uniqueSlug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existing = await Package.findOne(query);
    if (!existing) {
      break;
    }
    uniqueSlug = `${slug}-${count}`;
    count++;
  }
  return uniqueSlug;
};

// GET /api/packages - Get packages with query filters (Public & Admin)
router.get('/', async (req, res) => {
  const { serviceId, isPinned, isActive } = req.query;
  const filter = {};

  if (serviceId) {
    filter.serviceId = serviceId;
  }
  if (isPinned !== undefined) {
    filter.isPinned = isPinned === 'true';
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  try {
    let query = Package.find(filter);
    
    // Sort logic
    if (isPinned === 'true') {
      query = query.sort({ pinOrder: 1, displayOrder: 1 });
    } else {
      query = query.sort({ displayOrder: 1, createdAt: -1 });
    }

    const packages = await query;
    res.json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/packages - Create a new package (Protected)
router.post('/', auth, async (req, res) => {
  const {
    serviceId,
    name,
    price,
    priceType,
    priceSuffix,
    description,
    offerLine,
    displayOrder,
    isActive,
    isPinned,
    pinOrder,
    discountPercent,
    discountLabel,
    discountActive,
    features,
    suitableFor
  } = req.body;

  if (!serviceId || !name || price === undefined || !priceType || !description) {
    return res.status(400).json({ msg: 'Please provide serviceId, name, price, priceType, and description' });
  }

  try {
    const slug = await generateSlug(name);
    const newPackage = new Package({
      serviceId,
      name,
      slug,
      price,
      priceType,
      priceSuffix: priceSuffix || '',
      description,
      offerLine: offerLine || '',
      displayOrder: displayOrder !== undefined ? displayOrder : 0,
      isActive: isActive !== undefined ? isActive : true,
      isPinned: isPinned !== undefined ? isPinned : false,
      pinOrder: pinOrder !== undefined ? pinOrder : 0,
      discountPercent: discountPercent !== undefined ? discountPercent : 0,
      discountLabel: discountLabel || '',
      discountActive: discountActive !== undefined ? discountActive : false,
      features: features || [],
      suitableFor: suitableFor || []
    });

    const pkg = await newPackage.save();
    res.json(pkg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/packages/:id/duplicate - Duplicate an existing package (Protected)
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalPkg = await Package.findById(req.params.id);
    if (!originalPkg) {
      return res.status(404).json({ msg: 'Package not found' });
    }

    const duplicatedName = `${originalPkg.name} Copy`;
    const slug = await generateSlug(duplicatedName);

    // Deep copy features and suitableFor, mapping features/tags to new objects (so they get new MongoDB _ids)
    const duplicatedFeatures = originalPkg.features.map(f => ({
      text: f.text,
      isIncluded: f.isIncluded,
      order: f.order
    }));

    const duplicatedSuitableFor = originalPkg.suitableFor.map(s => ({
      text: s.text,
      order: s.order
    }));

    const duplicatedPkg = new Package({
      serviceId: originalPkg.serviceId,
      name: duplicatedName,
      slug,
      price: originalPkg.price,
      priceType: originalPkg.priceType,
      priceSuffix: originalPkg.priceSuffix,
      description: originalPkg.description,
      offerLine: originalPkg.offerLine,
      displayOrder: originalPkg.displayOrder + 1, // put it right after
      isActive: originalPkg.isActive,
      isPinned: originalPkg.isPinned,
      pinOrder: originalPkg.pinOrder,
      discountPercent: originalPkg.discountPercent,
      discountLabel: originalPkg.discountLabel,
      discountActive: originalPkg.discountActive,
      features: duplicatedFeatures,
      suitableFor: duplicatedSuitableFor
    });

    const savedPkg = await duplicatedPkg.save();
    res.json(savedPkg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/packages/:id - Update package (Protected)
router.put('/:id', auth, async (req, res) => {
  const { name } = req.body;

  try {
    let pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ msg: 'Package not found' });
    }

    const updates = { ...req.body };
    if (name !== undefined && name !== pkg.name) {
      updates.slug = await generateSlug(name, req.params.id);
    }

    pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    res.json(pkg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/packages/:id - Delete package (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ msg: 'Package not found' });
    }

    await Package.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: 'Package removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
