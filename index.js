/**
 * Building a collection of distributed performance helpers in js.
 *
 * @param  {String} html
 * @return {String}
 */

var music = require('./lib/modules/music')
    // var hub = require('./lib/hub/hub')

module.exports = {
    escape: function(html) {
        return String(html)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    /**
     * Unescape special characters in the given string of html.
     *
     * @param  {String} html
     * @return {String}
     */
    unescape: function(html) {
        return String(html)
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }
};