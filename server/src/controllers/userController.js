import User from "../models/User.js";

const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const registerUser = async (req, res) => {
  const { name, email, password, referrerCode } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.json({ message: "user already exists" });
  }

  let referrer = null;
  if (referrerCode) {
    referrer = await User.findOne({ referralCode: referrerCode });
    if (!referrer) {
      return res.json({ message: "invalid referral code" });
    }

    if (referrer.directReferrals.length >= 8) {
      return res
        .status(400)
        .json({ message: "Referrer has reached the referral limit (8)" });
    }
  }

  const referralCode = generateReferralCode();

  const newUser = new User({
    name,
    email,
    password,
    referralCode,
    referrer: referrer ? referrer._id : null,
    directReferrals: [],
  });

  if (referrer) {
    referrer.directReferrals.push(newUser._id);
    await referrer.save();
  }

  await newUser.save();

  return res.json({ message: "user created successfully" });
};
