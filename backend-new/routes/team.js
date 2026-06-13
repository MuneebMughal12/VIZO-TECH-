const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const auth = require('../middleware/auth');

// GET /api/team
router.get('/', async (req, res) => {
  try {
    const team = await TeamMember.find();
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/team (Protected)
router.post('/', auth, async (req, res) => {
  const { imageUrl, name, role, bio, isPinnedHome, experience, isTopMember, status, techStack } = req.body;

  try {
    const newMember = new TeamMember({
      imageUrl,
      name,
      role,
      bio,
      isPinnedHome,
      experience,
      isTopMember,
      status,
      techStack
    });

    const member = await newMember.save();

    // If this new member is set as top member, set all other members to false
    if (isTopMember) {
      await TeamMember.updateMany({ _id: { $ne: member._id } }, { isTopMember: false });
    }

    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/team/:id (Protected)
router.put('/:id', auth, async (req, res) => {
  try {
    let member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ msg: 'Team member not found' });
    }

    member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // If this member was set to top member, set all other members to false
    if (req.body.isTopMember === true) {
      await TeamMember.updateMany({ _id: { $ne: req.params.id } }, { isTopMember: false });
    }

    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/team/:id (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ msg: 'Team member not found' });
    }

    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Team member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
