module.exports = 
class News{
    constructor(newsTitle, newsText, created, userId, imageGUID)
    {
        this.Id = 0;
        this.UserId = userId !== undefined ? userId : 0; // User name + User Avatar
        this.Created = created !== undefined ? created : 0;
        this.NewsTitle = newsTitle !== undefined ? newsTitle : "";
        this.NewsText = newsText !== undefined ? newsText : "";
        this.ImageGUID = imageGUID !== undefined ? imageGUID : "";
    }

    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('UserId', 'integer');
        validator.addField('Created','integer');
        validator.addField('NewsTitle','string');
        validator.addField('NewsText','string');
        return validator.test(instance);
    }
}