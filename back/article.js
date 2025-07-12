const express = require('express');
const app = express();

const {MongoClient, ObjectId, Binary} = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

app.use(express.json());

const cookieParser = require('cookie-parser');
app.use((cookieParser()));

const multer = require('multer');
const upload = multer();

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:8080/',
    credentials: true,
}));


let port = 8002;
app.listen(port, () => console.log('`listening on port ${port}'));


app.post('/create-article', upload.single('image'), async(request, response) => {
    try{
        await client.connect();
        const articles = client.db('bugle').collection('articles');
        const imageFile = request.file;

        const { title, categories, body, teaser } = request.body;
        console.log(title)
        console.log(categories);
        console.log(body);
        console.log(teaser);

        const article = {imageType: imageFile.mimetype,
                         imageName: imageFile.originalname,
                         image: new Binary(imageFile.buffer),
                         title: title,
                         categories: categories,
                         body: body,
                         teaser: teaser,
                         dateCreated: new Date(),
                         lastEdit: new Date()
                        };
        const result = await articles.insertOne(article);
        const code = { message: 'Image uploaded successfully', id: result.insertedId };
        response.send(code);
        
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.close();
    }
});


app.put("/update-article", upload.single('image'), async(request, response) => {
    try {
        const { title, categories, body, teaser, _id } = request.body;
        var update = {};
        if (!request.file){
            console.log("no image");
            update = {$set: {
                title: title,
                categories: categories,
                body: body,
                teaser: teaser,
                lastEdit: new Date()
            }};
        }
        else {
            const imageFile = request.file;
            console.log('image');
            update = {$set: {
                title: title,
                categories: categories,
                body: body,
                teaser: teaser,
                lastEdit: new Date(),
                imageType: imageFile.mimetype,
                imageName: imageFile.originalname,
                image: new Binary(imageFile.buffer)
            }};
        }
        const articleId = new ObjectId(_id);
        await client.connect();
        let articles = client.db('bugle').collection('articles');
        result = await articles.updateOne({_id: articleId}, update);
        response.send(result);
    }
    catch (error){
        console.log(error);
        response.send(error);
    }
    finally {
        client.close();
    }
});



app.get('/get-articles', async(request, response) => {
    try{
        await client.connect();
        const collection = client.db('bugle').collection('articles');
        const articles = await collection.find({}).toArray();
        
        const articlesWithBase64 = articles.map((article) => {
            const imageBase64 = article.image ? article.image.buffer.toString('base64') : null;

            return {
                imageType: article.imageType || null,
                imageName: article.imageName || null,
                image: imageBase64,
                title: article.title || null,
                body: article.body || null,
                teaser: article.teaser || null,
                dateCreated: article.dateCreated || null,
                lastEdit: article.lastEdit || null,
                categories: article.categories || null,
                id: article._id || null
            };
        });

        response.json(articlesWithBase64);
        /*
        await client.connect();
        const collection = client.db('bugle').collection('articles');
        const articles = await collection.find({}).toArray();
        
        const articlesWithBase64 = articles.map((article) => {
            return {
                imageType: article.imageType,
                imageName: article.imageName,
                image: article.image.buffer.toString('base64'),
                title: article.title,
                body: article.body,
                teaser: article.teaser,
                dateCreated: article.dateCreated,
                lastEdit: article.lastEdit
            };
        });

        //response.json(articlesWithBase64);
        response.send(articlesWithBase64);
        */
    }
    catch (error){
        console.log(error);
    }
    finally {
        client.close();
    }
});


app.post('/create-comment', async(request, response) => {
    try {
        const session_id = request.cookies.session_id;
        let user_info = await findUser(session_id);
        await client.connect();
        const comments = client.db('bugle').collection('comments');
        const new_comment = {user_id: new ObjectId(user_info._id),
                             username: user_info.username,
                            article_id: new ObjectId(request.body.article_id),
                            comment: request.body.comment
                            }
        const result = await comments.insertOne(new_comment);
        response.send(result);
    }
    catch (error) {
        console.log(error);
    }
    finally {
         client.close();
    }
});


app.post('/comments', async(request, response) => {
    try{
        await client.connect();
        let comments = client.db('bugle').collection('comments');
        let result = await comments.find({article_id: new ObjectId(request.body.article_id)}).toArray();
        response.send(result);
    }
    catch (error){
        console.log(error);
    }
    finally {
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


/*
app.get('/comments', async(request, response) => {
    try{

    }
    catch (error){
        console.log(error);
    }
    finally {
        
    }
}) 
*/