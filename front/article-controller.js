

const article_actions = {"create-article": "http://localhost:8080/bugle-article/create-article",
                         "get-articles": "http://localhost:8080/bugle-article/get-articles",
                         "edit-article-view": "http://localhost:8080/edit-article",
                         "anon-view": "http://localhost:8080/anon",
                         "reader-view": "http://localhost:8080/reader",
                         "author-view": "http://localhost:8080/author",
                         "update-article": "http://localhost:8080/bugle-article/update-article",
                         "create-comment": "http://localhost:8080/bugle-article/create-comment",
                         "get-comments": 'http://localhost:8080/bugle-article/comments',
                         "get-ad": 'http://localhost:8080/bugle-ads/ad'
                        };


var articles;
var displayedArticle;
var curr_art_index = 0;
var curr_role = "";
var displayedAd = {}

async function loadPage(role){
    //let text = document.getElementById('article-content');
    //text.innerHTML = 'Signed in as: '  + role;
   // loadEditPage();
    //getEditArticleView();
    //loadAnonView()
    curr_role = role;
    articles = await getArticles();
   
    displayedArticle = articles[curr_art_index];

    switch (role) {
        case "anon":
            await loadAnonView();
            break;
        case "reader":
            await loadReaderView();
            break;
        case "author":
            await loadAuthorView();
    }
}


async function loadAnonView(){
    await getAnonView();
    showImage();
    setTitle();
    setBody();
    setTeasers();
    setCategories();
    showComments();
    //load ad
    showAd();
}


async function loadReaderView(){
    await getReaderView();
    showImage();
    setTitle();
    setBody();
    setCategories();
    showComments();
    //loadcomments
    //load ad
    showAd();
}


async function loadAuthorView(){
    await getAuthorView();
    showImage();
    setTitle();
    setBody();
    setCategories();
    showComments();
    //load comments
}


function loadTeaser(id){
    t1index = (curr_art_index + 1) % articles.length;
    t2index = (curr_art_index + 2) % articles.length; 

    a1 = articles[t1index];
    a2 = articles[t2index];
    if (id == 1) {
        curr_art_index = t1index;
    }
    else{
        curr_art_index = t2index;
    }
    loadPage('anon');
}


function loadNextArticle(){
    console.log('next art');
    t1index = (curr_art_index + 1) % articles.length;
    curr_art_index = t1index;
    console.log("role: " + curr_role);
    loadPage(curr_role);
}


async function updateArticle(event) {
    const form = event.target;
    const formData = new FormData(form);
    formData.append("_id", displayedArticle.id);   
    try {
        const response = await fetch(article_actions['update-article'], {
            method: "PUT",
            body: formData,
        });
        loadPage("author");
    }
    catch(error) {
        console.log(error);
    }
}



async function saveArticle(event){
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch(article_actions["create-article"], {
            method: 'POST',
            body: formData,
            });
        const result = await response.json();
        console.log('Upload Result:', result);
        loadPage('author');
    } 
    catch (error) {
        console.error('Error uploading image:', error);
    }
    
}


async function getArticles(){
    try{
        const response = await fetch(article_actions['get-articles'])
        const articles = await response.json();
        //console.log(articles);
        //showImage(articles[0]);
        return articles;
    }
    catch(error){
        console.log(error);
    }
}


function setTitle(){
    document.getElementById('article-title').innerText = articles[curr_art_index].title;
}


function setBody(){
    document.getElementById('article-body').innerText = articles[curr_art_index].body;
}


function setTeasers(){
    const t1title = document.getElementById('t1-title');
    const t2title = document.getElementById('t2-title');
    const t1text = document.getElementById('t1-text');
    const t2text = document.getElementById('t2-text');
    t1index = (curr_art_index + 1) % articles.length;
    t2index = (curr_art_index + 2) % articles.length; 
    a1 = articles[t1index];
    a2 = articles[t2index];
    t1title.innerText = a1.title;
    t2title.innerText = a2.title;
    t1text.innerHTML = a1.teaser;
    t2text.innerHTML = a1.teaser;
}

function setCategories() {
    const article = articles[curr_art_index];
    let categories = article.categories;
    let cats = "";
    const section = document.getElementById('categories');

    if (Array.isArray(categories) == false) {
        section.innerHTML = categories;
        return;
    }

    for (i = 0; i < categories.length; i++){
        cats += categories[i].toString() + ", ";
    }
 
    section.innerHTML = cats;


    const dateCreated = document.getElementById('date-created');
    const lastEdit = document.getElementById('last-edit');

    let created = displayedArticle.dateCreated
    let edited = displayedArticle.lastEdit
    created = created.slice(0, 10)
    edited = edited.slice(0,10);

    dateCreated.innerHTML = "Created On: " + created;
    lastEdit.innerHTML = "Last Edited On: " + edited;



}
async function showImage(){
    
    const article = articles[curr_art_index];
    
    const imgElement = document.getElementById('actual-img')
    imgElement.src = `data:${article.contentType};base64,${article.image}`; // Use the Base64 image string
    imgElement.alt = article.filename;  // Example field   
}




async function getEditArticleView() {
    try {
       const response = await fetch(article_actions['edit-article-view']);
       const html = await response.text();

        document.getElementById("main-page").innerHTML = html;

        const form = document.getElementById('create-article-form');
        form.onsubmit = function(event) {
            const selectElement = document.getElementById('article-categories-edit');
            const selectedOptions = Array.from(selectElement.options).filter(option => option.selected);
            if (selectedOptions.length === 0) {
                event.preventDefault(); // Prevent form submission
                alert("select at least one category")
            }
            else{
                saveArticle(event);
            }
        }


    }
    catch (error){
        console.log(error);
    }
}

/*
async function editCurrentArticle(){
    await getEditArticleView();
    const article = articles[curr_art_index];
    document.getElementById('article-title-edit').value = article.title;
    document.getElementById('article-body-edit').value = article.body;
    document.getElementById('article-teaser-edit').value = article.teaser;

    const selectElement = document.getElementById('article-categories-edit');
    var categories = article.categories;
    if(Array.isArray(categories) == false){
        categories = [categories];
    }
    console.log(categories);
    for(let option of selectElement.options) {
        options.selected = categories.includes(option.value);
    }
}
*/


async function editCurrentArticle() {
    try {
        // Wait for the view to load
        await getEditArticleView();
        // Get the article data
        const article = articles[curr_art_index];
        // Check if article exists
        if (!article) {
            console.error("No article found at index " + curr_art_index);
            return;
        }
        
        // Set the article values in the form
        const titleInput = document.getElementById('article-title-edit');
        const bodyInput = document.getElementById('article-body-edit');
        const teaserInput = document.getElementById('article-teaser-edit');
        const categoriesSelect = document.getElementById('article-categories-edit');
        // Check if the form elements exist
        if (!titleInput || !bodyInput || !teaserInput || !categoriesSelect) {
            console.error("One or more form elements not found.");
            return;
        }
        // Set form values
        titleInput.value = article.title;
        bodyInput.value = article.body;
        teaserInput.value = article.teaser;
        // Normalize categories to always be an array
        let categories = Array.isArray(article.categories) ? article.categories : [article.categories];
        // Set the categories in the select element
        for (let option of categoriesSelect.options) {
            option.selected = categories.includes(option.value);
        }
        const image_input = document.getElementById("article-image-edit");
        image_input.removeAttribute('required');

        const form = document.getElementById('create-article-form');
        form.onsubmit = function(event) {
            event.preventDefault(); 
            const selectElement = document.getElementById('article-categories-edit');
            const selectedOptions = Array.from(selectElement.options).filter(option => option.selected);
            if (selectedOptions.length === 0) {
                // Prevent form submission
                alert("select at least one category")
            }
            else{
                updateArticle(event);
            }
        }
    } 
    catch (error) {
        console.error("Error while editing article:", error);
    }
}

async function getAnonView() {
    try {
       const response = await fetch(article_actions['anon-view']);
       const html = await response.text();

        document.getElementById("main-page").innerHTML = html;

        //
        //await waitForDomUpdate();
        //

    }
    catch (error){
        console.log(error);
    }
}


async function getReaderView(){
    try {
        const response = await fetch(article_actions['reader-view']);
        const html = await response.text();
 
         document.getElementById("main-page").innerHTML = html;
 
     }
     catch (error){
         console.log(error);
     }
}


async function getAuthorView(){
    try {
        const response = await fetch(article_actions['author-view']);
        const html = await response.text();
 
         document.getElementById("main-page").innerHTML = html;
 

     }
     catch (error){
         console.log(error);
     }
}


async function addComment(){
    try{
        const comment = document.getElementById('new-comment');
        console.log('comment: ' + comment);

        const body = {article_id: displayedArticle.id, comment: comment.value};
        const options = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }
        result = await fetch(article_actions['create-comment'], options);
        comment.value='';
        showComments();
    }
    catch(error){
        console.log(error);
    }
}


/*
async function addComment() {
    try {
        // Get the comment input element
        const commentInput = document.getElementById('new-comment');

        // Ensure the value is not empty before proceeding
        const commentValue = commentInput.value.trim();
        
        if (!commentValue) {
            console.log('Comment cannot be empty.');
            return; // Optionally show a user-friendly message or UI feedback
        }

        // Prepare the request body
        const body = {
            article_id: displayedArticle.id,
            comment: commentValue
        };

        // Define the request options
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };

        // Make the POST request to the API
        const result = await fetch(article_actions['create-comment'], options);

        // Optionally check for response status
        if (result.ok) {
            console.log('Comment added successfully.');
            
        } else {
            console.log('Failed to add comment:', result.statusText);
        }
    } catch (error) {
        console.log('Error occurred while adding comment:', error);
    }
}
*/


async function getComments(){
    try{
        const body = {article_id: displayedArticle.id};
        const options = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }
        let comments = await fetch(article_actions['get-comments'], options);
        comments = await comments.json();
        console.log(comments);
        return comments;
    }
    catch(error){
        console.log(error);
    }
}


async function showComments() {
    const comments = await getComments();
    const container = document.getElementById('comments-list');
    container.innerHTML ='';
    for (i = 0; i < comments.length; i++){
        const comment = comments[i];
        const comment_li = document.createElement('li');
        comment_li.innerHTML = comment.username + ": " + comment.comment;

        //if(role == 'author') {
          //  const comment_button = document.createElement('button');
           // comment_button.textContent = "edit"

        //}

        container.appendChild(comment_li);
    }
}


async function getAd() {
    try{
        let result = await fetch(article_actions['get-ad']);
        result = await result.json();
        console.log(result);
        return result;
    }
    catch(error){
        console.log(error);
    }
}


async function showAd(){
    ad = await getAd();
    displayedAd = ad;
    ad_content = document.getElementById('ad-content');
    ad_content.innerHTML = ad.content;
}


async function createAdEvent(){
    const ad = displayedAd;
    let result = await fetch('https://api.ipify.org?format=json');
    result = await result.json();
    let ip = result.ip;
            
    const body = {
        article_id: displayedArticle.id,
        ad_id: displayedAd._id,
        ip: ip,
        user_agent: navigator.userAgent,
    };
    options = {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    };

    const response = await fetch(article_actions['get-ad'], options)


}



