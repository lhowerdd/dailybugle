const express = require('express');
const app = express();

const {MongoClient, ObjectId} = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let port = 8001;
app.use(express.json());


const cookieParser = require('cookie-parser');
app.use((cookieParser()));

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8080/',
  credentials: true,
}));


app.listen(port, () => console.log('`listening on port ${port}'));


app.post('/login', async (request, response) => {
    try {
      await client.connect();
      const users = await client.db('bugle').collection('users');
      const login = {username: request.body.username, password: request.body.password};
      //console.log(login)
      const correctLogin = await users.findOne(login);
      //console.log(correctLogin);
      if (correctLogin != null ){
        //console.log("success");
        const sessions = await client.db('bugle').collection('sessions');
        await sessions.deleteOne({_id: correctLogin._id});
        const session_id = generateSessionId();
        const new_session = {_id: correctLogin._id, session_id: session_id, role: correctLogin.role}
        await sessions.insertOne(new_session);
        response.cookie('session_id', session_id, {httpOnly: true, secure: false, sameSite: 'Strict', path:'/' });
        result = {code: "success", role: correctLogin.role};
        response.send(result);
      }       
      else {
        console.log("login not found");
        result = {code: "login-not-found"};
        response.send(result);
      } 
        
    }
    catch(error){
      console.log(error);
    }
    finally{
      client.close();
    }
  });


  app.post('/create-account', async(request, response) => {
    try {
      await client.connect()
      const users = client.db('bugle').collection('users');
      const doesUserAlreadyExist = await users.findOne({username: request.body.username});
      if (doesUserAlreadyExist == null ) {
        result = {code: "success"};
        const user = {"username": request.body.username, 
                      "password": request.body.password, 
                      "role": "reader"};
        const code = await users.insertOne(user);
      }
      else {
        result = {code: "name-taken"};
      }
      response.send(result);
    }
    catch(error) {
      console.log(errror);
    }
    finally{
      client.close();
    }
  });


  app.get('/logout', async(request, response) => {
    console.log("cookies");
    console.log(request.cookies);
    console.log(request.cookies.session_id);

    try{
      await client.connect();
      const sessions = client.db('bugle').collection('sessions');
      result = await sessions.deleteOne({session_id: request.cookies.session_id});
      response.cookie('session_id', '', { maxAge: 0, httpOnly: true, path: '/' });
      response.send(result);
    }
    catch(error){
      console.log(error);
    }
    finally {
      client.close();
    }
  }); 


  app.get('/check-cookie', async(request, response) => {
    const session_id = request.cookies.session_id;
    try{
      await client.connect();
      const sessions = client.db('bugle').collection('sessions');
      let isValidSession = await sessions.findOne({session_id: session_id});
      if(isValidSession == null){
        code = {role: "anon"};
      }
      else{
        const users = client.db('bugle').collection('users');
        const user = await users.findOne({_id: isValidSession._id});
        code = {role: user.role, username: user.username};
      }
      response.send(code);
    }
    catch(error){
      console.log(error);
    }
    finally {
      client.close();
    }
  });


  app.post('/finduser', async(request, response) => {
    try {
      await client.connect();
      const sessions = client.db('bugle').collection('sessions');
      const session = await sessions.findOne({session_id: request.body.session_id})
      const users = client.db('bugle').collection('users');
      const user = await users.findOne({_id: session._id});
      console.log(user);
      response.send(user);
    }
    catch(error){
      console.log(error);
    }
    finally { 
      client.close();
    }
  });


  function generateSessionId(length = 32) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let sessionId = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        sessionId += characters[randomIndex];
    }
    return sessionId;
}


