import mongoose from "mongoose";

const earningsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user who made the purchase
  transactions: [
    {
      amount: { type: Number, required: true }, // The amount of the transaction
      directEarnings: { type: Number, default: 0 }, // Earnings from direct referrals (Level 1)
      indirectEarnings: { type: Number, default: 0 }, // Earnings from indirect referrals (Level 2)
      transactionDate: { type: Date, default: Date.now }, // Date of the transaction
    },
  ],
});

export default mongoose.model("Earnings", earningsSchema);
