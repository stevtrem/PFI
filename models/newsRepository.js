const Repository = require('./repository');
const ImageFilesRepository = require('./imageFilesRepository.js');
//const User = require('./user.js');
const News = require('./news.js')
const utilities = require("../utilities");
module.exports = 
class NewsRepository extends Repository {
    constructor(req){
        super('News', true);
        this.req = req;
    }
    bindImageURL(news){
        if (news) {
            let bindedNews = {...news};
            if (news["ImageGUID"] != ""){
                bindedNews["ImageURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(news["ImageGUID"]);
            } else {
                bindedNews["ImageURL"] = "";
            }
            return bindedNews;
        }
        return null;
    }
    bindImageURLS(images){
        let bindedNews = [];
        for(let image of images) {
            bindedNews.push(this.bindImageURL(image));
        }
        return bindedNews;
    }
    get(id) {
        return this.bindImageURL(super.get(id));
    }
    getAll(params = null) {
        return this.bindImageURLS(super.getAll(params));
    }
    add(news) {
        news["Created"] = utilities.nowInSeconds();
        if (News.valid(news)) {
            news["ImageGUID"] = ImageFilesRepository.storeImageData("", news["ImageData"]);
            delete news["ImageData"];
            return this.bindImageURL(super.add(news));
        }
        return null;
    }
    update(news) {
        news["Created"] = 0; // will take the original creation date, see lower
        if (News.valid(news)) {
            let foundNews = super.get(news.Id);
            if (foundNews != null) {
                news["Created"] = foundNews["Created"];
                news["ImageGUID"] = ImageFilesRepository.storeImageData(news["ImageGUID"], news["ImageData"]);
                delete news["ImageData"];
                
                return super.update(news);
            }
        }
        return false;
    }
    remove(id){
        let foundNews = super.get(id);
        if (foundNews) {
            ImageFilesRepository.removeImageFile(foundNews["ImageGUID"]);
            return super.remove(id);
        }
        return false;
    }
}