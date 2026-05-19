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

// --------------------- add new car ------------
app.post('/cars', async (req, res) => {
  try {
    const newCar = req.body;
    const result = await rentalCollection.insertOne(newCar);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to add car", error });
  }
});

// ------------------------- update car with patch method ------------
app.patch('/cars/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCar = req.body;
    const query = { _id: new ObjectId(id) };
    const result = await rentalCollection.updateOne(query, { $set: updatedCar });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update car", error });
  }
});
// app.patch('/cars/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
//     const updatedCar = req.body;
//     const query = { _id: new ObjectId(id) };
//     const options = { upsert: true };
//     const updatedDoc = {
//       $set: {
//         name: updatedCar.name,
//         price: updatedCar.price,
//         quantity: updatedCar.quantity,
//       },
//     };
//     const result = await rentalCollection.updateOne(query, updatedDoc, options);
//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ message: "Failed to update car", error });
//   }
// });
// app.put('/cars/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
//     const updatedCar = req.body;
//     const query = { _id: new ObjectId(id) };
//     const result = await rentalCollection.updateOne(query, { $set: updatedCar });
//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ message: "Failed to update car", error });
//   }
// });


// ---------------------- delete car ------------
app.delete('/cars/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await rentalCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete car", error });
  }
});

// -------------------- get all cars ------------
app.get('/cars', async (req, res) => {
  try {
    
    const cars = await rentalCollection.find().toArray();
    res.send(cars);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch cars", error });
  }
});

// -------------------------- get car by id ------------
app.get('/cars/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const car = await rentalCollection.findOne(query);
    res.send(car);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch car", error });
  }
});

// ------------------------- search car by it's name using $regex ------------
app.get('/cars/search/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const query = { name: { $regex: name, $options: "i" } };
    const cars = await rentalCollection.find(query).toArray();
    res.send(cars);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch cars", error });
  }
})



// -------------------- port status ------------
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});