const express  = require('express')
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y387w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json())

async function run(){
    try{
        await client.connect();

        const database = client.db('cycling');
        const productCollections = database.collection("products");
        const userCollections = database.collection("users");
        const orderCollections = database.collection("orders");
        const reviewCollections = database.collection("reviews");

        // post user 
        app.post('/users',async(req,res)=>{
            const user = req.body;
            const result = await userCollections.insertOne(user);
            // console.log(result);
            res.json(result)  
        });

        // make admin 
        app.put('/users/admin',async(req,res)=>{
            const user = req.body;
            const filter = {email:user.email};
            const updateDoc = { $set: {role:'admin'} };
            const result = await userCollections.updateOne(filter, updateDoc);
            res.json(result);
        })

        // update status 
        app.put('/orders',async(req,res)=>{
            const id = req.body.id;
            const status = req.body.status;
            // console.log('update data :',id,status);
            const filter = { _id:ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = { $set: {status: status} };
            const result = await orderCollections.updateOne(filter, updateDoc,options);
            res.json(result);
        })

        // verify admin
        app.get('/users/:email',async(req,res)=>{
            const email = req.params.email;
            const query = { email:email };
            const user = await userCollections.findOne(query);
            let isAdmin = false;

            if(user?.role === 'admin'){
                isAdmin = true;
            }

            res.send({admin:isAdmin})
        })

        // post order 
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await orderCollections.insertOne(order)
            res.json(result)  
        })

        // post products 
        app.post('/products',async(req,res)=>{
            const product = req.body;
            const result = await productCollections.insertOne(product)
            res.json(result)  
        })

        // get all orders 
        app.get('/orders',async(req,res)=>{
            const cursor = orderCollections.find({});
            const products = await cursor.toArray();
            res.json(products);
        })

        // get my orders 
        app.get('/orders/:email',async(req,res)=>{
            const email = req.params.email;
            const query = { email:email };
            const cursor =  orderCollections.find(query);
            const myOrders = await cursor.toArray();
            res.send(myOrders)
        })

        // get products 
        app.get('/products',async(req,res)=>{
            const cursor = productCollections.find({});
            const products = await cursor.toArray();
            res.json(products);
        })

        // get single product 
        app.get('/products/:id',async(req,res)=>{
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const product = await productCollections.findOne(query);
            res.send(product)
        })

        // delete order 
        app.delete('/orders/:id',async(req,res)=>{
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const result = await orderCollections.deleteOne(query)
            res.json(result)
        })

        // post review 
        app.post('/reviews',async(req,res)=>{
            const review = req.body;
            const result = await reviewCollections.insertOne(review);
            // console.log(review);
            res.json(result)  
        });

        // get reviews 
        app.get('/reviews',async(req,res)=>{
            const cursor = reviewCollections.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        })

        


    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir)

 app.get('/',(req,res)=>{
     res.send('Hello cycling hub')
 })
 app.listen(port,()=>{
     console.log('cycling listening to ',port);
 })