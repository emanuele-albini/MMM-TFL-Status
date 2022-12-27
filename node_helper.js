/* Magic Mirror Module: MMM-TFL-Status helper
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * And Emanuele Albini https://github.com/emanuele-albini/
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const https = require('https');

module.exports = NodeHelper.create({

    start: function () {
        console.log('MMM-TFL-Status helper, started...');
    },

    getLinesStatusPerMode: function (mode) {

        var that = this;
        var url = "https://api.tfl.gov.uk/line/mode/" + mode + "/status";

        // Send an API request
        https.get(url, (response) => {

            const { statusCode } = response;

            if (statusCode < 200 || statusCode >= 300) {
                throw new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}: ` + url);
            }

            let rawRata = '';

            // a data chunk has been received.
            response.on('data', (chunk) => {
                rawRata += chunk;
            });

            // complete response has been received.
            response.on('end', () => {
                var data = JSON.parse(rawRata)
                that.sendSocketNotification('GOT-TFL-STATUS', { 'result': data, 'mode': mode });
            });

        }).on("error", (error) => {
            that.sendSocketNotification('GOT-TFL-STATUS', { 'result': null, 'mode': mode, 'error': error.message });
        });

        // fetch(url)
        //     .then((response) => {
        //         if (response.ok) { return response.json(); } else { throw new Error(response.status); }
        //     }
        //     )
        //     .then((data) => {
        //         that.sendSocketNotification('GOT-TFL-STATUS', { 'result': data, 'mode': mode });
        //     })
        //     .catch((error) => {
        //         that.sendSocketNotification('GOT-TFL-STATUS', { 'result': null, 'mode': mode, 'error': error.message });
        //     });

    },

    socketNotificationReceived: function (notification, payload) {

        // Check this is for us and if it is let's get the weather data
        if (notification === 'GET-TFL-STATUS') {
            var mode = payload;
            this.getLinesStatusPerMode(mode);
        }
    }

});
