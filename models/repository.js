
const fs = require('fs');
const { v1: uuidv1 } = require('uuid');
const utilities = require('../utilities.js');
const CollectionFilter = require('./collectionFilter.js');
const RepositoryCachesManager = require("./repositoryCachesManager.js");
const getRequestCache = require('../getRequestsCacheManager');
///////////////////////////////////////////////////////////////////////////
// This class provide CRUD operations on JSON objects collection text file 
// with the assumption that each object have an Id member.
// If the objectsFile does not exist it will be created on demand.
// Warning: no type and data validation is provided
///////////////////////////////////////////////////////////////////////////
let repositoryEtags = {};

class Repository {
    constructor(objectsName, cached = false) {
        this.objectsList = null;
        this.objectsFile = `./data/${objectsName}.json`;
        this.objectsName = objectsName.toLowerCase();
        this.initEtag();
        this.cached = cached;
        this.bindExtraDataMethod = null;
    }
    setBindExtraDataMethod(bindExtraDataMethod){
        this.bindExtraDataMethod = bindExtraDataMethod;
    }
    initEtag() {
        this.ETag = "";
        if (this.objectsName in repositoryEtags)
            this.ETag = repositoryEtags[this.objectsName];
        else
            this.newETag();
    }
    newETag(){
        this.ETag = uuidv1();
        repositoryEtags[this.objectsName] = this.ETag;
        getRequestCache.clear(this.objectsName);
        RepositoryCachesManager.clear(this.objectsName);
    }
    objects() {
        if (this.objectsList == null || this.objectsList.length == 0) 
            this.read();
        return this.objectsList;
    }
    read() {
        this.objectsList = null;
        if (this.cached) {
            this.objectsList = RepositoryCachesManager.find(this.objectsName);
        }
        if (this.objectsList == null) {
            try{
                let rawdata
                // if (this.objectsFile == "./data/Users.json")
                //     rawdata = fs.readFileSync("API_Server-2.11-master/data/Users.json")
                // else if (this.objectsFile == "./data/Tokens.json")
                //     rawdata = fs.readFileSync("API_Server-2.11-master/data/Tokens.json")
                // else if (this.objectsFile == "./data/News.json")
                //     rawdata = fs.readFileSync("API_Server-2.11-master/data/News.json")
                // else
                rawdata = fs.readFileSync(this.objectsFile);
                // we assume here that the json data is formatted correctly
                this.objectsList = JSON.parse(rawdata);
                if (this.cached)
                    RepositoryCachesManager.add(this.objectsName, this.objectsList);
            } catch(error) {
                if (error.code === 'ENOENT') {
                    // file does not exist, it will be created on demand
                    this.objectsList = [];
                }
            }
        }
    }
    write() {
        this.newETag();
        // if (this.objectsFile == "./data/Users.json")
        //     fs.writeFileSync("API_Server-2.11-master/data/Users.json", JSON.stringify(this.objectsList))
        // else if (this.objectsFile == "./data/Tokens.json")
        //     fs.writeFileSync("API_Server-2.11-master/data/Tokens.json", JSON.stringify(this.objectsList))
        // else if (this.objectsFile == "./data/News.json")
        //     fs.writeFileSync("API_Server-2.11-master/data/News.json", JSON.stringify(this.objectsList))
        // else
        fs.writeFileSync(this.objectsFile, JSON.stringify(this.objectsList));
        if (this.cached){
            RepositoryCachesManager.add(this.objectsName, this.objectsList);
        }
    }
    nextId() {
        let maxId = 0;
        for(let object of this.objects()){
            if (object.Id > maxId) {
                maxId = object.Id;
            }
        }
        return maxId + 1;
    }
    add(object) {
        try {
            object.Id = this.nextId();
            this.objectsList.push(object);
            this.write();
            return object;
        } catch(error) {
            return null;
        }
    }
    bindExtraData(datas){
        let bindedDatas = [];
        for(let data of datas) {
            bindedDatas.push(this.bindExtraDataMethod(data));
        };
        return bindedDatas;
    }
    getAll(params = null) {
        let objectsList = this.objects();
        if (this.bindExtraDataMethod != null){
            objectsList = this.bindExtraData(objectsList);
        }
        if (params) {
            let collectionFilter = new CollectionFilter(objectsList, params);
            return collectionFilter.get();
        }
        return objectsList;
    }
    get(id){
        for(let object of this.objects()){
            if (object.Id === id) {
                if (this.bindExtraDataMethod != null)
                    return this.bindExtraDataMethod(object);
                else
                    return object;
            }
        }
        return null;
    }
    remove(id) {
        let index = 0;
        for(let object of this.objects()){
            if (object.Id === id) {
                this.objectsList.splice(index,1);
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    removeByIndex(indexToDelete){
        if (indexToDelete.length > 0){
            utilities.deleteByIndex(this.objects(), indexToDelete);
            this.write();
        }
    }
    update(objectToModify) {
        let index = 0;
        for(let object of this.objects()){
            if (object.Id === objectToModify.Id) {
                this.objectsList[index] = objectToModify;
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    findByField(fieldName, value){
        let index = 0;
        for(let object of this.objects()){
            try {
                if (object[fieldName] === value) {
                    return this.objectsList[index];
                }
                index ++;
            } catch(error) {
                break;
            }
        }
        return null;
    }
}

module.exports = Repository;