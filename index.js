const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());

// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.crdo9tm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const toyCollection = client.db('roboKingdom').collection('toys');

    // const indexKeys = { toy_name: 1 };
    // const indexOptions = { name: "toysName" };
    // const result = await jobsCollection.createIndex(indexKeys, indexOptions);

    app.get('/toySearchByName/:text', async(req, res) =>{
      const searchText = req.params.text;

      const result = await toyCollection.find({
        $or: [
          {toy_name: {$regex: searchText, $options: "i"}}
        ],
      }).toArray();
      res.send(result);

    });


    app.post('/addToys', async(req, res) =>{
        const body = req.body;

        const result = await toyCollection.insertOne(body);
        console.log(result);
        res.send(result);
    });

    app.get('/toys', async(req, res) => {
        const cursor = toyCollection.find().limit(20);
        const result = await cursor.toArray();
        res.send(result);
    });



    app.get('/toys/:category', async(req, res) => {

        if(req.params.category =="Car Robots" || req.params.category =="Fighter Robots" || req.params.category =="Robo Animal") {
          const result = await toyCollection.find({ category: req.params.category}).toArray();
          return res.send(result);
        }
        const cursor = toyCollection.find().limit(3);
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get('/singleToys/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query);
      res.send(result)
  });


  app.get('/myToys/:email', async (req, res) => {
      const result = await toyCollection.find({sellerEmail: req.params.email}).toArray();
      res.send(result);
  });

    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Robot is running on server');
});

app.listen(port, () =>{
    console.log(`Robot is running in port ${port}`);
});
