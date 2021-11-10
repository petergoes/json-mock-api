/**
 * Tests if a provided filename matches a RegExp
 * @param {String} re String to be converted into a RegExp
 * @returns {function(string): boolean} A function executing the test
 */
 const filenameMatching = re => file => new RegExp(re).test(file)

 module.exports = filenameMatching