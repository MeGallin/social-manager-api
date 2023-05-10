const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      sparse: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      required: true,
      default: false,
    },
    profileImage: {
      type: String,
    },
    cloudinaryId: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    loginCounter: {
      type: Number,
      default: 0,
    },
    registeredWithGoogle: {
      type: Boolean,
      required: true,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  },
);

// This the pre-save middleware
UserSchema.pre('save', async function (next) {
  //This will execute only if PW is modified
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
