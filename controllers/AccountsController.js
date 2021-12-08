const usersRepository = require('../models/usersRepository');
//const ImagesRepository = require('../models/imagesRepository');
const newsRepository = require('../models/newsRepository');
const TokenManager = require('../tokenManager');
const utilities = require("../utilities");
const User = require('../models/user');
const Cache = require('../getRequestsCacheManager');
const Repository = require('../models/repository');

module.exports =
    class AccountsController extends require('./Controller') {
        constructor(req, res) {
            super(req, res);
            this.usersRepository = new usersRepository(this.req);
        }

        // list of users with masked password
        index(id) {
            if (!isNaN(id)) {
                let user = this.usersRepository.get(id);
                if (user != null) {
                    let userClone = { ...user };
                    userClone.Password = "********";
                    this.response.JSON(userClone);
                }
            }
            else {
                let users = this.usersRepository.getAll();
                let usersClone = users.map(user => ({ ...user }));
                for (let user of usersClone) {
                    user.Password = "********";
                }
                this.response.JSON(usersClone);
            }
        }

        // POST: /token body payload[{"Email": "...", "Password": "...", "grant-type":"password"}]
        login(loginInfo) {
            // to do assure that grant-type is present in the request header
            let user = this.usersRepository.findByField("Email", loginInfo.Email);
            if (user != null) {
                if (user.Password == loginInfo.Password) {
                    let newToken = TokenManager.create(user);
                    this.response.JSON(newToken);
                } else
                    this.response.badRequest();
            } else
                this.response.badRequest();
        }

        logout(user) {
            if (this.requestActionAuthorized()) {
                TokenManager.logout(user.Id);
                this.response.accepted();
            }
            else
                this.response.unAuthorized();
        }

        // POST: account/register body payload[{"Id": 0, "Name": "...", "Email": "...", "Password": "..."}]
        register(user) {
            user.Created = utilities.nowInSeconds();
            // validate User before insertion
            if (User.valid(user)) {
                // avoid duplicates Email
                if (this.usersRepository.findByField('Email', user.Email) == null) {
                    // take a clone of the newly inserted user
                    let newUser = { ...this.usersRepository.add(user) };
                    if (newUser) {
                        // mask password in the json object response
                        newUser.Password = "********";
                        this.response.created(newUser);
                    } else
                        this.response.internalError();
                } else
                    this.response.conflict();
            } else
                this.response.unprocessable();
        }

        change(user) {
            if (this.requestActionAuthorized()) {
                let foundUser = this.usersRepository.get(user.Id);
                if (foundUser) {
                    let userForEmailConflictTest = this.usersRepository.findByField('Email', user.Email);
                    let proceed = userForEmailConflictTest != null;
                    if (proceed) {
                        proceed = userForEmailConflictTest.Id == user.Id;
                    } else
                        proceed = true;
                    let _newsRepository = new newsRepository(this.req, true);
                   
                    if (proceed) {
                        // images are linked with user, we must flush all caches
                        _newsRepository.newETag();
                        user["Created"] = foundUser.Created;
                        user["AvatarGUID"] = foundUser.AvatarGUID;
                        if (user.Password == "")
                            user.Password = foundUser.Password;
                        this.usersRepository.update(user);
                        this.response.ok();
                    } else
                        this.response.conflict();
                }
            } else
                this.response.unAuthorized();
        }
        deleteAllUsersBookmarks(userId) {
            let bookmarksRepository = new Repository('Bookmarks', true);
            let bookmarks = bookmarksRepository.getAll();
            let indexToDelete = [];
            let index = 0;
            for (let bookmark of bookmarks) {
                if (bookmark.UserId == userId)
                    indexToDelete.push(index);
                index++;
            }
            bookmarksRepository.removeByIndex(indexToDelete);
            Cache.clear('bookmarks');
        }
        deleteAllUsersImages(userId) {
            let imagesRepository = new ImagesRepository(this.req, true);
            let images = imagesRepository.getAll();
            let indexToDelete = [];
            let index = 0;
            for (let image of images) {
                if (image.UserId == userId)
                    indexToDelete.push(index);
                index++;
            }
            imagesRepository.removeByIndex(indexToDelete);
            Cache.clear('images');
        }

        deleteAllUsersNews(userId)
        {
            let newRepository = new newsRepository(this.req, true);
            let news = newRepository.getAll();
            let index = 1;
            for (let _news of news) {
                if (_news.UserId == userId){
                    newRepository.remove(index);
                    index++;
                }else{
                    index++;
                }
            }
            Cache.clear('news');
        }

        remove(id) {
            if (this.requestActionAuthorized()) {
                //this.deleteAllUsersBookmarks(id);
               // this.deleteAllUsersImages(id);
               this.deleteAllUsersNews(id)
                if (this.usersRepository.remove(id))
                    this.response.accepted();
                else
                    this.response.notFound();
            } else
                this.response.unAuthorized();
        }
    }