import bcrypt from "bcryptjs";
import User from "./models/User.js";

export async function seedDefaults() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ProLearn.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    await User.create({
      firstName: "Platform",
      lastName: "Admin",
      username: "Platform Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    });
  }
}
