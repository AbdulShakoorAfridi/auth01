import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revoked: {
      type: Boolean,
      default: false,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    // replacedByToken: {
    //   type: String,
    //   default: null,
    //   select: false,
    // },
    replacedByToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RefreshToken",
      default: null,
    },

    device: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Automatically delete expired refresh tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Find active sessions efficiently
refreshTokenSchema.index({
  userId: 1,
  revoked: 1,
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
