const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// GET /api/reviews - returns approved reviews for public site
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/reviews/all (Protected) - returns all reviews for moderation panel
router.get('/all', auth, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/reviews - public submission
router.post('/', async (req, res) => {
  const { name, companyWebsite, rating, feedback } = req.body;

  try {
    if (!name || !rating || !feedback) {
      return res.status(400).json({ msg: 'Please enter name, rating, and feedback' });
    }

    const newReview = new Review({
      name,
      companyWebsite,
      rating,
      feedback,
      isApproved: false // Requires moderation
    });

    const review = await newReview.save();
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/reviews/:id (Protected) - update approval status or fields
router.put('/:id', auth, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/reviews/:id (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Review removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
