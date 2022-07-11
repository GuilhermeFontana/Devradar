module.exports = function parseStringAsArray(string) {
    return string.split(',').map(x => x.trim());    
};