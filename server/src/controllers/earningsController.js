import Earnings from "../models/Earnings.js";
import User from "../models/User.js";

export const createEarnings = async (req, res, io) => {
  const { userId, amount } = req.body;

  if (amount <= 1000) {
    return res
      .status(400)
      .json({ message: "Purchase amount must be greater than 1000 Rs" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let totalDirectEarnings = 0;
    let totalIndirectEarnings = 0;

    let referrer = null;
    if (user.referrer) {
      referrer = await User.findById(user.referrer);
      if (referrer) {
        const directProfit = amount * 0.05;
        totalDirectEarnings = directProfit;

        let referrerEarnings = await Earnings.findOne({ user: referrer._id });
        if (!referrerEarnings) {
          referrerEarnings = new Earnings({
            user: referrer._id,
            transactions: [],
          });
        }
        referrerEarnings.transactions.push({
          amount,
          directEarnings: directProfit,
          indirectEarnings: 0,
          transactionDate: new Date(),
        });

        await referrerEarnings.save();

        referrer.totalDirectEarnings += directProfit;
        await referrer.save();

        io.to(referrer._id.toString()).emit("earningsUpdate", {
          userId: referrer._id,
          totalDirectEarnings: referrer.totalDirectEarnings,
          totalIndirectEarnings: referrer.totalIndirectEarnings,
          message: "You have new earnings from a level 1 referral!",
        });
      }
    }

    if (referrer && referrer.referrer) {
      const grandReferrer = await User.findById(referrer.referrer);
      if (grandReferrer) {
        const indirectProfit = amount * 0.01;
        totalIndirectEarnings = indirectProfit;

        let grandReferrerEarnings = await Earnings.findOne({
          user: grandReferrer._id,
        });
        if (!grandReferrerEarnings) {
          grandReferrerEarnings = new Earnings({
            user: grandReferrer._id,
            transactions: [],
          });
        }
        grandReferrerEarnings.transactions.push({
          amount,
          directEarnings: 0,
          indirectEarnings: indirectProfit,
          transactionDate: new Date(),
        });
        await grandReferrerEarnings.save();

        grandReferrer.totalIndirectEarnings += indirectProfit;
        await grandReferrer.save();

        io.to(grandReferrer._id.toString()).emit("earningsUpdate", {
          userId: grandReferrer._id,
          totalIndirectEarnings: grandReferrer.totalIndirectEarnings,
          message: "You have new earnings from level 2 referral!",
        });
      }
    }

    return res.status(201).json({
      message: "Earnings recorded successfully and profit distributed!",
    });
  } catch (error) {
    console.error("Error in creating earnings:", error);
    return res.status(500).json({ message: "Error creating earnings record" });
  }
};
