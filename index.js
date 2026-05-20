const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

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
let bookingCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("CarRental");
    rentalCollection = db.collection('CarRentalCollection');
    bookingCollection = db.collection('MyBookingCollection');
    await db.command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/cars', async (req, res) => {
  try {
    const newCar = req.body;
    const result = await rentalCollection.insertOne(newCar);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to add car", error });
  }
});

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

app.get('/cars', async (req, res) => {
  try {
    const cars = await rentalCollection.find().toArray();
    res.send(cars);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch cars", error });
  }
});

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

app.get('/cars/search/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const query = { name: { $regex: name, $options: "i" } };
    const cars = await rentalCollection.find(query).toArray();
    res.send(cars);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch cars", error });
  }
});

app.post('/bookings', async (req, res) => {
  try {
    const {
      userId, userName, userEmail, carId, carName,
      carPricePerDay, startDate, endDate, totalDays, totalPrice
    } = req.body;

    if (!userId || !carId || !startDate || !endDate) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    const carObjectId = new ObjectId(carId);
    const car = await rentalCollection.findOne({ _id: carObjectId });
    if (!car || !car.availability) {
      return res.status(400).send({ message: "Car is not available for booking" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const overlappingBooking = await bookingCollection.findOne({
      carId: carObjectId,
      status: "confirmed",
      $or: [
        { startDate: { $lte: end, $gte: start } },
        { endDate: { $lte: end, $gte: start } },
        { startDate: { $lte: start }, endDate: { $gte: end } }
      ]
    });
    if (overlappingBooking) {
      return res.status(409).send({ message: "Car already booked for selected dates" });
    }

    const booking = {
      userId,
      userName,
      userEmail,
      carId: carObjectId,
      carName,
      carPricePerDay,
      startDate: start,
      endDate: end,
      totalDays,
      totalPrice,
      bookingDate: new Date(),
      status: "confirmed"
    };

    const result = await bookingCollection.insertOne(booking);
    await rentalCollection.updateOne(
      { _id: carObjectId },
      { $set: { availability: false } }
    );

    res.status(201).send({
      message: "Booking created successfully",
      bookingId: result.insertedId
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to create booking", error: error.message });
  }
});

app.get('/bookings/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookings = await bookingCollection.find({ userId }).toArray();
    res.send(bookings);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch bookings", error });
  }
});

app.get('/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const booking = await bookingCollection.findOne(query);
    res.send(booking);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch booking", error });
  }
});

app.patch('/bookings/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const query = { _id: new ObjectId(id) };
    const booking = await bookingCollection.findOne(query);
    if (!booking) {
      return res.status(404).send({ message: "Booking not found" });
    }

    const result = await bookingCollection.updateOne(query, {
      $set: { status, updatedAt: new Date() }
    });

    if (status === "cancelled") {
      await rentalCollection.updateOne(
        { _id: booking.carId },
        { $set: { availability: true } }
      );
    }

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update booking", error });
  }
});

app.delete('/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const booking = await bookingCollection.findOne(query);
    if (!booking) {
      return res.status(404).send({ message: "Booking not found" });
    }

    const result = await bookingCollection.deleteOne(query);

    await rentalCollection.updateOne(
      { _id: booking.carId },
      { $set: { availability: true } }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to cancel booking", error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});