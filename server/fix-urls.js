import mongoose from "mongoose";
import dotenv from "dotenv";
import Website from "./models/website.model.js";

dotenv.config();

const fixUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB");

    const websites = await Website.find({ deployed: true });
    let count = 0;

    for (const site of websites) {
      if (site.deployUrl && site.deployUrl.includes("http://localhost:5173")) {
        // We won't know the exact new port, but we can change it to empty so it can be re-deployed, or we just leave it for now.
        // Actually, if we just remove deployUrl, the frontend might break if it expects it.
        // Let's change `deployed` back to false so the user can re-deploy them!
        site.deployed = false;
        site.deployUrl = "";
        await site.save();
        count++;
      }
    }
    console.log(`Reset deployment status for ${count} websites. You can now deploy them again with the correct URL.`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixUrls();
