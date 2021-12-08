const NewsRepository = require('../models/newsRepository');
const UsersRepository = require('../models/usersRepository')

module.exports = 
class NewsController extends require('./Controller') {
    constructor(req, res, params){
        super(req, res, params,  false /* needAuthorization */);
        this.newsRepository = new NewsRepository(req);
        this.usersRepository = new UsersRepository(req);
    }
   
    head() {
        this.response.JSON(null, this.newsRepository.ETag);
    }
    get(id){
        // if we have no parameter, expose the list of possible query strings
        if (this.params === null) { 
            if(!isNaN(id)) {
                let returnedNews=this.newsRepository.get(id);
                returnedNews['userName']= this.usersRepository.get(returnedNews['UserId']).Name;
                returnedNews['AvatarGUID']= this.usersRepository.get(returnedNews['UserId']).AvatarGUID;
                this.response.JSON(returnedNews);
            }
            else
            {
                let newsList = this.newsRepository.getAll();
                newsList.forEach(news => {
                    news['userName'] = this.usersRepository.get(news['UserId']).Name;
                    news['AvatarGUID'] = this.usersRepository.get(news['UserId']).AvatarGUID;
                });
                this.response.JSON(newsList, this.newsRepository.ETag);
            }  
                
        }
        else {
            if (Object.keys(this.params).length === 0) /* ? only */{
                this.queryStringHelp();
            } else {
                let newsList = this.newsRepository.getAll(this.params);
                newsList.forEach(news => {
                    news['userName'] = this.usersRepository.get(news['UserId']).Name;
                    news['AvatarGUID'] = this.usersRepository.get(news['UserId']).AvatarGUID;
                })
                this.response.JSON(newsList, this.newsRepository.ETag);
            }
        }
    }
    post(news){  
        if (this.requestActionAuthorized()) {
            let newNews = this.newsRepository.add(news);
            if (newNews)
                this.response.created(newNews);
            else
                this.response.unprocessable();
        } else 
            this.response.unAuthorized();
    }
    put(news){
        if (this.requestActionAuthorized()) {
            if (this.newsRepository.update(news))
                this.response.ok();
            else
                this.response.unprocessable();
        } else
            this.response.unAuthorized();
    }
    remove(id){
        if (this.requestActionAuthorized()) {
            if (this.newsRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        } else
            this.response.unAuthorized();
    }
}