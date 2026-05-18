const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb'); 

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
let rentalCollection;

async function connectDB() {
  try {
    await client.connect();
    
    db = client.db("CarRental");
    rentalCollection = db.collection('CarRentalCollection');
    
    await db.command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

connectDB();


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/cars', async (req, res) => {
  try {
    
    const cars = await rentalCollection.find().toArray();
    res.send(cars);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch cars", error });
  }
});


// -------------------- port status ------------
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});