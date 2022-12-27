/* Magic Mirror Module: MMM-TLF-Status helper
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * And Emanuele Albini https://github.com/emanuele-albini/
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');

module.exports = NodeHelper.create({

    start: function () {
        console.log('MMM-TLF-Status helper, started...');
    },

    getLinesStatusPerMode: function (mode) {

        var that = this;
        var url = "https://api.tfl.gov.uk/line/mode/" + mode + "/status";

        // Send an API request
        fetch(url)
            .then((response) => {
                if (response.ok) { return response.json(); } else { throw new Error(response.status); }
            }
            )
            .then((data) => {
                that.sendSocketNotification('GOT-TFL-STATUS', { 'result': data, 'mode': mode });
            })
            .catch((error) => {
                that.sendSocketNotification('GOT-TFL-STATUS', { 'result': null, 'mode': payload, 'error': error.message });
            });

    },

    socketNotificationReceived: function (notification, payload) {

        // Check this is for us and if it is let's get the weather data
        if (notification === 'GET-TFL-STATUS') {
            var mode = payload;
            this.getLinesStatusPerMode(mode);
        }
    }

});
