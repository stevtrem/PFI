const utilities = require('../utilities');

module.exports =
    class collectionFilter {
        constructor(collection, filterParams) {
            this.collection = collection;
            this.sortFields = [];
            this.searchKeys = [];
            this.filteredCollection = [];
            this.limit = 0;
            this.offset = 0;
            let instance = this;
            Object.keys(filterParams).forEach(function (paramName) {
                let paramValue = filterParams[paramName];
                if (paramValue) {
                    switch (paramName) {
                        case "sort": instance.setSortFields(paramValue); break;
                        case "limit": instance.limit = parseInt(paramValue); break;
                        case "offset": instance.offset = parseInt(paramValue); break;
                        default: instance.addSearchKey(paramName, paramValue);
                    }
                }
            });
            if (isNaN(this.limit) || isNaN(this.offset)) {
                this.limit = 0;
                this.offset = 0;
            }
        }
        makeSortField(fieldName) {
            let parts = fieldName.split(',');
            let sortField = "";
            let ascending = true;
            if (parts.length > 0)
                sortField = utilities.capitalizeFirstLetter(parts[0].toLowerCase());
            if (parts.length > 1) {
                if (parts[1].toLowerCase().includes('desc')) {
                    ascending = false;
                }
            }
            return {
                name: sortField,
                ascending: ascending
            };
        }
        setSortFields(fieldNames) {
            if (Array.isArray(fieldNames)) {
                for (let fieldName of fieldNames) {
                    this.sortFields.push(this.makeSortField(fieldName));
                }
            } else
                this.sortFields.push(this.makeSortField(fieldNames));
        }
        addSearchKey(keyName, value) {
            this.searchKeys.push({ name: keyName, value: value });
        }
        valueMatch(value, searchValue) {
            try {
                return new RegExp('^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$').test(value.toString().toLowerCase());
            } catch (error) {
                console.log(error);
                return false;
            }
        }
        valueMatch(value, searchValue) {
            if (Number.isInteger(value)){
                value = value.toString();
            }
            try {
                return new RegExp('^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$').test(value.toLowerCase());
            } catch (error) {
                console.log(error);
                return false;
            }
        }
        itemMatch(item) {
            for (let key of this.searchKeys) {
                if (key.name in item) {
                    if (!Array.isArray(key.value)){
                        if (!this.valueMatch(item[key.name], key.value))
                            return false;
                    } else {
                        let allMatch = true;
                        for(let value of key.value) {
                            if (!this.valueMatch(item[key.name],value))
                                allMatch = false;
                        }
                        return allMatch;
                    }
                } else
                    return false;
            }
            return true;
        }
        findByKeys() {
            if (this.searchKeys.length > 0) {
                this.filteredCollection = [];
                for (let item of this.collection) {
                    if (this.itemMatch(item))
                        this.filteredCollection.push(item);
                }
            } else
                this.filteredCollection = this.collection;
        }
        compareNum(x, y) {
            if (x === y) return 0;
            else if (x < y) return -1;
            return 1;
        }
        innerCompare(x, y) {
            if ((typeof x) === 'string')
                return x.localeCompare(y);
            else
                return this.compareNum(x, y);
        }
        compare(itemX, itemY) {
            let fieldIndex = 0;
            let max = this.sortFields.length;
            do {
                let result = 0;
                if (this.sortFields[fieldIndex].ascending)
                    result = this.innerCompare(itemX[this.sortFields[fieldIndex].name], itemY[this.sortFields[fieldIndex].name]);
                else
                    result = this.innerCompare(itemY[this.sortFields[fieldIndex].name], itemX[this.sortFields[fieldIndex].name]);
                if (result == 0)
                    fieldIndex++;
                else
                    return result;
            } while (fieldIndex < max);
            return 0;
        }
        sort() {
            this.filteredCollection.sort((a, b) => this.compare(a, b));
        }
        get() {
            this.findByKeys();
            if (this.sortFields.length > 0)
                this.sort();
            if (this.limit != 0) {
                return this.filteredCollection.slice(this.offset * this.limit, (this.offset + 1) * this.limit);
            }
            return this.filteredCollection;
        }
    }