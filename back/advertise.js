const express = require('express');
const app = express();

const {MongoClient, ObjectId} = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let port = 8003;
app.use(express.json());


const cookieParser = require('cookie-parser');
app.use((cookieParser()));

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:8080/',
    credentials: true,
}));



app.listen(port, () => console.log('`listening on port ${port}'));


app.get('/ad', async (request, response) => {
    try{
        await client.connect();
        const ads = client.db('bugle').collection('ads');
        ads_list = await ads.find({}).toArray();

        const random_ad = ads_list[Math.floor(Math.random() * ads_list.length)];
        response.send(random_ad);
        //console.log(ads_list);
    }
    catch(error){
        console.log(error);
    }
    finally{
        client.close();
    }
});



app.post('/ad', async (request, response) => {
    try {
        let user_id='';
        
        const session_id = request.cookies.session_id;
        if (session_id == null){
            user_id = 'anon'
        }
        else{
            let user_info = await findUser(session_id);
            user_id = user_info._id;
        }
        

        await client.connect();
        const events = client.db('bugle').collection('ad-events');

        new_event = {
            ad_id: new ObjectId(request.body.ad_id),
            user_id: user_id,
            article_id: new ObjectId(request.body.ad_id),
            user_ip: request.body.ip,
            user_agent: request.body.user_agent
        };
        const result = await events.insertOne(new_event);
        response.send(result);
    }
    catch(error) {
        console.log("error: " + error);
    }
    finally{
        client.close();
    }
});






async function findUser(session_id){
    try{
        console.log(session_id);

        const body = {'session_id': session_id};
        const options = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }
        
        const response = await fetch("http://localhost:8001/finduser", options);
        result = await response.json();
        return result;          

    }
    catch (error) {
        console.log(error);
    }
}
