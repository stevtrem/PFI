exports.get = (variableName) => {
    var propertiesReader = require('properties-reader');
    var properties = propertiesReader('serverVariables.js');
    return properties.get(variableName);
}
