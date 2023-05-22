const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

//PW encryption this function will only run if the PW was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  //Hash the PW is cost 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//Instance method
userSchema.methods.correctPassword = async function (candidatePW, userPW) {
  return await bcrypt.compare(candidatePW, userPW);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
