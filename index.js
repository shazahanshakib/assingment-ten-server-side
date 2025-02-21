require('dotenv').config()
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.x6gg2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    const database = client.db("allvisaDB");
    const visaCollection = database.collection("allvisa");
    const visaApplyCollection = database.collection("allapply")

    app.get('/allvisa', async(req, res)=>{
        const {searchParams}= req.query;
        // console.log(searchParams)
        let option= {};
        if (searchParams) {
          option={visaType: {$regex: searchParams, $options: "i"}};
        }
        const cursor = visaCollection.find(option);
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/latestvisa', async(req, res)=>{
      const cursor = visaCollection.find().sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray()
      res.send(result)
  })
    app.get("/allvisa/:id", async(req, res)=>{
      const id =req.params.id
      // console.log(id)
      const query = {_id: new ObjectId(id)}
      const result = await visaCollection.findOne(query);
      res.send(result)
  })
  app.get("/visaapply", async(req, res)=>{
    const searchParams = req.query.searchParams;
        // console.log(searchParams)
        let option= {};
        if (searchParams) {
          option={countryName: {$regex: searchParams, $options: "i"}};
        }
    const cursor= visaApplyCollection.find(option)
    const result= await cursor.toArray()
    res.send(result)
  })

    app.post('/allvisa', async(req, res)=>{
        const newVisa= req.body
        const result = await visaCollection.insertOne(newVisa);
        res.send(result)
        // console.log(newVisa)

    })

    app.post('/visaapply', async(req, res)=>{
      const newApply = req.body
      const result = await visaApplyCollection.insertOne(newApply)
      res.send(result)
      // console.log(newApply)
    })

    app.put('/allvisa/:id', async(req, res)=>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updateVisa= req.body
      const upVisa={
        $set: {
          countryName: updateVisa.countryName,
          countryImage: updateVisa.countryImage,
          visaType: updateVisa.visaType,
          age: updateVisa.age,
          fee: updateVisa.fee,
          description: updateVisa.description,
          Validity: updateVisa.Validity,
          appMethod: updateVisa.appMethod,
          processingTime: updateVisa.processingTime
        }
      }
      const result = await visaCollection.updateOne(filter, upVisa, options);
      res.send(result)
    })
    // const newVisa= {countryName, countryImage, visaType, age, fee, description, Validity, appMethod, processingTime, requiredDocuments, userEmail}

    app.delete('/visaapply/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await visaApplyCollection.deleteOne(query)
      res.send(result)
    })
    app.delete('/allvisa/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await visaCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })