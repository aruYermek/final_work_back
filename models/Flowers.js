const mongoose = require('mongoose');

const FlowerSchema = new mongoose.Schema({
    flowerName: {
      type: String,
      required: true
    },
    flowerPrice: {
      type: Number,
      required: true
    },
    flowerImage: {
      type: String,
      required: true
    },
    createdDate: {
      type: Date,
      default: Date.now
    }
  });
  

const Flower = mongoose.model('Flower', FlowerSchema);

module.exports = Flower;
