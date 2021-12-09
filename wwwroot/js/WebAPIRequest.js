/*
    Méthodes d'accès aux services Web API_Server/bookmarks
 */

const apiBaseURL= "http://localhost:5000";
//const apiBaseURL= "https://rune-literate-scaffold.glitch.me"

function tokenRequestURL() {
    return apiBaseURL + '/token';
}
function storeAccessToken(token) {
    localStorage.setItem('access_Token', token);
}
function eraseAccessToken() {
    localStorage.removeItem('access_Token');
}
function retrieveAccessToken() {
    return  localStorage.getItem('access_Token');
}
function getBearerAuthorizationToken() {
    return { 'Authorization': 'Bearer ' + retrieveAccessToken() };
}
function registerRequestURL() {
    return apiBaseURL + '/Accounts/register';
}
function storeLoggedUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}
function retrieveLoggedUser() {
    return JSON.parse(localStorage.getItem('user'));
}
function deConnect() {
    localStorage.removeItem('user');
    eraseAccessToken();
}
function webAPI_Register(profil, successCallBack, errorCallBack){
    $.ajax({
        url: apiBaseURL + "/accounts/register",
        type: 'POST',
        contentType:'application/json',
        data: JSON.stringify(profil),
        success: function () {
            successCallBack();
        },
        error: function(jqXHR) {
            errorCallBack(jqXHR.status);
            console.log("webAPI_register - error");
        }
    })
}
function webAPI_ChangeProfil( profil , successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/accounts/change",
        type: 'PUT',
        headers: getBearerAuthorizationToken(),
        contentType:'application/json',
        data: JSON.stringify(profil),
        success: () => {
            webAPI_getUserInfo(profil.Id, successCallBack, errorCallBack);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            errorCallBack(jqXHR.status);
            console.log("webAPI_POST - error");
        }
    });
}
function webAPI_login( Email, Password, successCallBack, errorCallBack) {
    $.ajax({
        url: tokenRequestURL(),
        contentType:'application/json',
        type: 'POST',
        data: JSON.stringify({Email, Password}),
        success: function (profil) {
            storeAccessToken(profil.Access_token);
            webAPI_getUserInfo(profil.UserId, successCallBack, errorCallBack);
        },
        error: function(jqXHR, textStatus, errorThrown) {  
            errorCallBack(jqXHR.status);
            console.log("webAPI_login - error");
        }
    })
}
function webAPI_getUserInfo(userId, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/accounts/index" + "/" + userId,
        type: 'GET',
        contentType:'text/plain',
        data:{},
        success: function (profil) {
            storeLoggedUser(profil);
            successCallBack();
        },
        error: function(jqXHR) {  
            errorCallBack(jqXHR.status);
            console.log("webAPI_login - error");
        }
    })
}
function webAPI_logout(userId, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/accounts/logout/" + userId,
        contentType:'application/json',
        type: 'POST',
        data: JSON.stringify({Id: userId}),
        headers: getBearerAuthorizationToken(),
        success:() => {
            deConnect();
            successCallBack(); 
        },
        error: function(jqXHR) {
            deConnect();
            errorCallBack(jqXHR.status);
            console.log("webAPI_logout - error");
        }
    });
}
function webAPI_HEAD(successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/api/news",
        type: 'HEAD',
        contentType:'text/plain',
        complete: function(request) { 
            console.log(request.getResponseHeader('ETag'));
            successCallBack(request.getResponseHeader('ETag'));},
        error: function(jqXHR) {
            errorCallBack(jqXHR.status);
            console.log("webAPI_GET_ALL - error");
        }
    });
}
function webAPI_GET_ALL(queryString, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/api/news" + queryString,
        type: 'GET',
        contentType:'text/plain',
        data:{},
        success: (data, status, xhr) => { 
            let ETag = xhr.getResponseHeader("ETag");
            successCallBack(data, ETag); 
            console.log("webAPI_GET_ALL - success", data); 
            console.log(`ETag: ${ETag}`);
        },
        error: function(jqXHR) {
            errorCallBack(jqXHR.status);
            console.log("webAPI_GET_ALL - error");
        }
    });
}
function webAPI_GET( id, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/api/news" + "/" + id,
        type: 'GET',
        contentType:'text/plain',
        data:{},
        success: data  => { successCallBack(data);},
        error: function(jqXHR) {
            errorCallBack(jqXHR.status);
            console.log("webAPI_GET - error");
        }
    });
}
function webAPI_POST( data , successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/api/news",
        type: 'POST',
        headers: getBearerAuthorizationToken(),
        contentType:'application/json',
        data: JSON.stringify(data),
        success: () => {successCallBack();},
        error: function(jqXHR) {
            errorCallBack(jqXHR.status);
            console.log("webAPI_POST - error");
        }
    });
}
function webAPI_PUT(data, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/api/news" + "/" + data.Id,
        type: 'PUT',
        headers: getBearerAuthorizationToken(),
        contentType:'application/json',
        data: JSON.stringify(data),
        success:() => {successCallBack();},
        error: function(jqXHR) {
            errorCallBack(jqXHR.status);
            console.log("webAPI_PUT - error");
        }
    });
}
function webAPI_DELETE( id, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/api/news" + "/" + id,
        contentType:'text/plain',
        type: 'DELETE',
        headers: getBearerAuthorizationToken(),
        success:() => {successCallBack(); },
        error: function(jqXHR) {
            errorCallBack(jqXHR.status);
            console.log("webAPI_DELETE - error");
        }
    });
}
function webAPI_DELETE_Account( id, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/accounts/remove/" + id,
        contentType:'text/plain',
        type: 'DELETE',
        headers: getBearerAuthorizationToken(),
        success:() => {localStorage.clear() ;successCallBack(); },
        error: function(jqXHR) {
            errorCallBack(jqXHR.status);
            console.log("webAPI_DELETE_Account - error");
        }
    });
}

