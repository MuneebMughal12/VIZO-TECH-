const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isIncluded: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

const SuitableForSchema = new mongoose.Schema({
  text: { type: String, required: true },
  order: { type: Number, default: 0 }
});

const PackageSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  price: { type: Number, required: true },
  priceType: { type: String, enum: ['one_time', 'monthly'], required: true },
  priceSuffix: { type: String, default: '' },
  description: { type: String, required: true },
  offerLine: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  pinOrder: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  discountLabel: { type: String, default: '' },
  discountActive: { type: Boolean, default: false },
  features: [FeatureSchema],
  suitableFor: [SuitableForSchema]
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);
