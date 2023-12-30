const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.hgznyse.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const menuCollection = client.db("restaurantDB").collection('menu');
        const reviewCollection = client.db("restaurantDB").collection('reviews');
        const cartCollection = client.db("restaurantDB").collection('cart');
        const userCollection = client.db("restaurantDB").collection('user');


        // get method for menu
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result)
        })

        // get method for review
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result)
        })

        // get method for cart
        app.get('/cart', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result)
        })

        // get method for user
        app.get('/user', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })

        // post data to database
        app.post('/cart', async (req, res) => {
            const cartItem = req.body;
            const result = await cartCollection.insertOne(cartItem);
            res.send(result);
        })

        // delete method for cart
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })

        // post method for user
        app.post('/user', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exist', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result)
        })

        // // delete method for user
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // patch method for user to make admin
        app.patch('/user/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })

        // jwt
        // app.post('/jwt', async (req, res) => {
        //     const user = req.body;
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        //     // console.log(token);
        //     res.send({ token });
        // })

        // const verifyToken = (req, res, next) => {
        //     // console.log('inside verify token', req.headers.authorization);
        //     if (!req.headers.authorization) {
        //         return res.status(401).send({ message: 'unauthorized access' });
        //     }
        //     const token = req.headers.authorization.split(' ')[1];
        //     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        //         if (err) {
        //             return res.status(401).send({ message: 'unauthorized access' });
        //         }
        //         req.decoded = decoded;
        //         next();
        //     })
        // }

        // const verifyAdmin = async (req, res, next) => {
        //     const email = req.decoded.email;
        //     const query = { email: email }
        //     const user = await userCollection.findOne(query);
        //     const isAdmin = user?.role === 'admin';
        //     if (!isAdmin) {
        //         return res.status(403).send({ message: 'forbidden access' })
        //     }
        //     next();
        // }

        // get method for user
        // app.get('/user', verifyToken, verifyAdmin, async (req, res) => {
        //     // console.log(req.headers);
        //     const result = await userCollection.find().toArray();
        //     res.send(result)
        // })

        // app.get('/user/admin/:email', verifyToken, async (req, res) => {
        //     const email = req.params.email;
        //     if (email !== req.decoded.email) {
        //         return res.status(403).send({ message: 'forbidden access' })
        //     }
        //     const query = { email: email };
        //     const user = await userCollection.findOne(query);
        //     let admin = false;
        //     if (user) {
        //         admin = user?.role === 'admin';
        //     }
        //     res.send({ admin });
        // })

        // post data to database
        // app.post('/cart', async (req, res) => {
        //     const item = req.body;
        //     const result = await cartCollection.insertOne(item);
        //     res.send(result);
        // })

        // post method for user
        // app.post('/user', async (req, res) => {
        //     const user = req.body;
        //     const query = { email: user.email }
        //     const existingUser = await userCollection.findOne(query);
        //     if (existingUser) {
        //         return res.send({ message: 'user already exist', insertedId: null })
        //     }
        //     const result = await userCollection.insertOne(user);
        //     res.send(result)
        // })

        // delete method for cart
        // app.delete('/cart/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await cartCollection.deleteOne(query);
        //     res.send(result);
        // })

        // // delete method for user
        // app.delete('/user/:id', verifyToken, verifyAdmin, async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await userCollection.deleteOne(query);
        //     res.send(result);
        // })

        // patch method for user to make admin
        // app.patch('/user/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const updatedDoc = {
        //         $set: {
        //             role: 'admin'
        //         }
        //     }
        //     const result = await userCollection.updateOne(filter, updatedDoc)
        //     res.send(result)
        // })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Restaurant server is ready !')
})

app.listen(port, () => {
    console.log(`Restaurant server is running on port ${port}`)
})