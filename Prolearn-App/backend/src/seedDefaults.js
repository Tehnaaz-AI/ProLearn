import bcrypt from "bcryptjs";
import User from "./models/User.js";

export async function seedDefaults() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping default admin creation.");
    return;
  }

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
