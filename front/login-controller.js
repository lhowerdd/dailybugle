const modal = document.getElementById("create-account-modal");
const openCreateBtn = document.getElementById("open-create-account-button");
const closeModal = document.getElementsByClassName("close")[0];

const signInModal = document.getElementById("sign-in-modal");
const openSignInBtn = document.getElementById("open-sign-in-button");
const closeSignInModal = document.getElementsByClassName("close")[1];


const signOutBtn = document.getElementById("sign-out-button")

document.getElementById("hide-sign-out-button").style.display = 'none';

openCreateBtn.addEventListener("click", () => {
    closeAllModals();
    modal.style.display = "block";
    
});

openSignInBtn.addEventListener("click", () => {
    closeAllModals();
    signInModal.style.display = "block";
 
});


closeModal.addEventListener("click", () => {
    document.getElementById("create-username").value ='';
    document.getElementById("create-password").value='';
    document.getElementById("confirm-password").value='';
    modal.style.display = "none";
    let message = document.getElementById("create-error-message");
    message.innerHTML = "";
});

closeSignInModal.addEventListener("click", () => {
    document.getElementById("login-username").value='';
    document.getElementById("login-password").value='';
    signInModal.style.display = "none";
    let message = document.getElementById("login-error-message");
    message.innerHTML = "";
});



window.addEventListener("click", (event) => {
    if (event.target === modal) {
        document.getElementById("create-username").value ='';
        document.getElementById("create-password").value='';
        document.getElementById("confirm-password").value='';
        modal.style.display = "none";
    }
    if (event.target === signInModal) {
        document.getElementById("login-username").value='';
        document.getElementById("login-password").value='';
        signInModal.style.display = "none";
    }

});

function closeAllModals(){
    document.getElementById("create-username").value ='';
    document.getElementById("create-password").value='';
    document.getElementById("confirm-password").value='';
    document.getElementById("login-username").value='';
    document.getElementById("login-password").value='';
    modal.style.display = "none";
    signInModal.style.display = "none";
}

 const actions = {"login":"http://localhost:8080/bugle-auth/login",
                  "create_account":"http://localhost:8080/bugle-auth/create-account",
                  "logout": "http://localhost:8080/bugle-auth/logout",
                  "check_cookie": "http://localhost:8080/bugle-auth/check-cookie",
                  "test":"http://localhost:8080/bugle-auth"
                 };


async function signIn(){
    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;

    if(password == "" || username == ""){
        let message_secion = document.getElementById("login-error");
        let message = document.getElementById("login-error-message");
        message.innerHTML = "Either username or password is empty";
        if (message_section.style.display == 'none'){
            message_section.style.display = "block";
        }  
    }

    body = {'username': username, 'password': password}
    const options = {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    }
    const url = actions["login"];
    try {
        let response = await fetch(url, options);
        response = await response.json();
        const code = response.code;
        if (code == "login-not-found") {
            message.innerHTML = "invalid login";
            if (message_section.style.display == 'none'){
                message_section.style.display = "block";
            }  
        }
        else{
            closeAllModals();
            hideSignInBar();
            showSignOut();
            showUserName(username);
            await loadPage(response.role);
        }
    }
    catch (error) {
        console.error(error);
    }
}


async function createAccount() {
    let username = document.getElementById("create-username").value;
    let password = document.getElementById("create-password").value;
    let confirmPassword = document.getElementById("confirm-password").value;
    let message = document.getElementById("create-error-message")
    let message_section = document.getElementById("create-account-error");
    if(username == "" || password == "" || confirmPassword == "") {
        message.innerHTML = "one field left empty";
        if (message_section.style.display == 'none'){
            message_section.style.display = "block";
        }  
    }
    else if(password != confirmPassword){
        message.innerHTML = "passwords do not match";
        if (message_section.style.display == 'none'){
            message_section.style.display = "block";
        }
        return;
    }
    const body = {'username': username, 'password': password}
    const options = {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    }
    const url = actions["create_account"];
    console.log(url);
    try {
        let response = await fetch(url, options);
        response = await response.json();
        const code = response.code;
        if(code == 'name-taken'){
            message.innerHTML = "username is taken";
            if (message_section.style.display == 'none'){
                message_section.style.display = "block";
            } 
        }
        else {
            message.innerHTML = "account created!";
            if (message_section.style.display == 'none'){
                message_section.style.display = "block";
            } 
        }
    }
    catch (error) {
        console.error(error);
    }
}


function hideSignInBar(){
    document.getElementById("hide-top-right-buttons").style.display = 'none';
}

function showSignOut(){
    document.getElementById("hide-sign-out-button").style.display = 'block';
}

function showUserName(username){
    document.getElementById('display-username').innerHTML = username;
}

function hideUserName(){
    document.getElementById('display-username').innerHTML = '';
}

function showSignInBar(){
    document.getElementById("hide-top-right-buttons").style.display = 'block';
}


function hideSignOut(){
    document.getElementById("hide-sign-out-button").style.display = 'none';
}

async function signOut(){
    hideUserName();
    hideSignOut();
    showSignInBar();
    response = await fetch(actions["logout"]);
    response = await response.json();
    console.log(response);
    console.log(response.body);
    checkCookie();
}


async function checkCookie(){
    result = await fetch(actions['check_cookie']);
    result = await result.json();
    if (result.role == 'anon'){
        loadPage('anon')
    }
    else if (result.role == "reader") {
        //load reader page
        hideSignInBar();
        showSignOut();
        showUserName(result.username);
        loadPage(result.role);
    }
    else {
        //load author page
        hideSignInBar();
        showSignOut();
        showUserName(result.username);
        await loadPage(result.role);
    }
}
