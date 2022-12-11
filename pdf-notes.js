const express = require("express");
const app = express();
const mongoose = require("mongoose");

// Replace the URL below with the connection string for your MongoDB Atlas cluster
const url =
  "mongodb+srv://<username>:<password>@cluster0.mongodb.net/test?retryWrites=true&w=majority";

// Connect to your MongoDB Atlas cluster using Mongoose
mongoose.connect(url, { useNewUrlParser: true });

// Define a new Mongoose schema for PDF files
const PdfSchema = new mongoose.Schema({
  data: Buffer,
  name: String,
});

// Create a new Mongoose model for PDF files
const Pdf = mongoose.model("Pdf", PdfSchema);

app.post("/upload", async (req, res) => {
  // Read the PDF file from the request
  const pdf = req.body;

  // Create a new document for the PDF file
  const pdfDoc = new Pdf({ data: pdf.data, name: pdf.name });

  // Save the PDF file to your MongoDB Atlas cluster
  await pdfDoc.save();

  // Return the ObjectId of the uploaded PDF
  res.send({ id: pdfDoc._id });
});

//////////////////////////////////////////////

// Connect to your MongoDB Atlas cluster
const client = await MongoClient.connect(url, { useNewUrlParser: true });

// Create a new GridFSBucket instance
const bucket = new mongodb.GridFSBucket(client.db("test"));

// Define an Express route that returns a PDF file from the GridFS bucket
app.get("/pdf/:id", (req, res) => {
  // Get the ObjectId of the PDF file
  const id = new mongodb.ObjectId(req.params.id);

  // Get a readable stream for the PDF file
  const pdfStream = bucket.openDownloadStreamById(id);

  // Pipe the PDF stream to the response
  pdfStream.pipe(res);
});
// NOTE: bucket is implemented in server

///////////////////////////////////////////////

app.get("/pdf/:id", async (req, res) => {
  // Connect to your MongoDB Atlas cluster
  const client = await MongoClient.connect(url, { useNewUrlParser: true });

  // Create a new GridFSBucket instance
  const bucket = new mongodb.GridFSBucket(client.db("test"));

  // Retrieve the PDF file from the GridFS bucket
  const pdf = await bucket.find({ _id: req.params.id }).toArray();

  // Create a readable stream for the PDF file
  const readStream = bucket.openDownloadStream(pdf._id);

  // Send the PDF file as the response
  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", `attachment; filename=${pdf.filename}`);
  readStream.pipe(res);
});

// PDF can be accessed by the localhost:4000/pdf/:id
// BELOW: Can access URL by name via createDownloadStreamByName
//         --> PDF can be accessed by the localhost:4000/pdf/name.pdf

///////////////////////////////////////////////

app.get("/pdf/:filename", async (req, res) => {
  // Connect to your MongoDB Atlas cluster
  const client = await MongoClient.connect(url, { useNewUrlParser: true });

  // Create a new GridFSBucket instance
  const bucket = new mongodb.GridFSBucket(client.db("test"));

  // Retrieve the PDF file from the GridFS bucket
  const pdf = await bucket.find({ filename: req.params.filename }).toArray();

  // Create a readable stream for the PDF file
  const readStream = bucket.createDownloadStreamByName(pdf.filename);

  // Send the PDF file as the response
  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", `attachment; filename=${pdf.filename}`);
  readStream.pipe(res);
});

///////////////////////////////////////////////

app.delete("/pdf/:id", async (req, res) => {
  // Get the ObjectId of the PDF file
  const id = new mongodb.ObjectId(req.params.id);

  // Delete the PDF file from the GridFS bucket
  await bucket.delete(id);

  // Return a success response
  res.send({ success: true });
});

///////////////////////////////////////////////

const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();

// Set up multer to process the file uploads
const upload = multer({
  storage: multer.memoryStorage(),
});

// Connect to the MongoDB database
mongoose.connect("mongodb://localhost:27017/my-database", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a new mongoose model for the PDF files
const Pdf = mongoose.model(
  "Pdf",
  new mongoose.Schema({
    name: String,
    data: Buffer,
  })
);

// Create the file upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Create a new Pdf document with the uploaded file's data
    const pdf = new Pdf({
      name: req.file.originalname,
      data: req.file.buffer,
    });

    // Save the PDF to the database
    await pdf.save();

    // Send a success response to the client
    res.send("File uploaded successfully");
  } catch (error) {
    // Handle any errors that occurred during the request
    res.status(500).send(error);
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
