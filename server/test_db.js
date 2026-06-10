import mongoose from "mongoose"

const uri = "mongodb://playtubesindia_db_user:Pfu5IEDiUscVPmZz@ac-zxdbdsx-shard-00-00.gxr0ptr.mongodb.net:27017,ac-zxdbdsx-shard-00-01.gxr0ptr.mongodb.net:27017,ac-zxdbdsx-shard-00-02.gxr0ptr.mongodb.net:27017/?ssl=true&replicaSet=atlas-eqkjfl-shard-0&authSource=admin&retryWrites=true&w=majority"

mongoose.connect(uri)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection error:", err.message);
    process.exit(1);
  });
