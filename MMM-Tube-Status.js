/* Magic Mirror Module: MMM-TLF-Status
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * And Emanuele Albini https://github.com/emanuele-albini/
 * MIT Licensed.
 */

Module.register('MMM-TLF-Status', {

    defaults: {
        modes: ['tube', 'elizabeth_line', 'dlr', 'overground'],
        lines: null,
        sorting: ['elizabeth', 'jubilee', 'piccadilly', 'bakerloo', 'northern', 'dlr', 'victoria', 'district', 'circle', 'london-overground',],
        hide_good: false,
        interval: 15 * 60 * 1000 // Every 15 minutes
    },


    start: function () {
        Log.log('Starting module: ' + this.name);

        // Set up the local values, here we construct the request url to use
        this.result = {};

        // Trigger the first request
        this.getTFLStatusData(this);
    },


    getStyles: function () {
        return ['tube-status.css', 'font-awesome.css'];
    },


    getTFLStatusData: function (that) {
        console.log('Getting Tube data...')

        // Request he helper to get the status for each mode
        for (var mode in this.config.modes) {
            that.sendSocketNotification('GET-TFL-STATUS', mode);
        }

        // Set up the timer to perform the updates
        setTimeout(that.getTFLStatusData, that.config.interval, that);
    },


    getDom: function () {
        var startedLoading = (Object.keys(this.result).length > 0);
        var finishedLoading = (Object.keys(this.result).length == this.config.modes.length);
        var errors = {};

        // If we have some data to display then build the results table
        if (startedLoading) {
            // Get status of all the lines
            var lines = []
            for (var mode in this.result) {
                result = this.result[mode];
                if (result !== null) {
                    for (var i = 0; i < result.length; i++) {
                        r = result[i]
                        for (var j = 0; j < r.lineStatuses.length; j++) {
                            if (r.lineStatuses[j].validityPeriods.length < 2) {
                                severity = r.lineStatuses[j].statusSeverityDescription;
                            } else {
                                for (var k = 0; k < r.lineStatuses[j].validityPeriods.length; k++) {
                                    if (r.lineStatuses[j].validityPeriods[k].isNow) {
                                        severity = r.lineStatuses[j].statusSeverityDescription;
                                    }
                                }
                            }
                            lines.push({
                                'id': r.id,
                                'name': r.name,
                                'status': severity,
                                'mode': mode,
                            });
                        }
                    }
                } else {
                    errors.push({ 'mode': mode, 'message': result.error })
                }
            }

            // Set up the local wrapper
            var wrapper = document.createElement('div');
            wrapper.className = 'bright medium';

            // Show loading banner if all modes did not load yet
            if (!finishedLoading) {
                wrapper.innerHTML = 'Loading TfL status...';
            }

            // Show error banner if some of the modes status did not load correctly
            if (errors.length > 0) {
                wrapper.innerHTML = ''
                for (var err in errors) {
                    wrapper.innerHTML += 'Error ' + err.message + ' loading TfL status for ' + err.mode + '<br>';
                }
            }

            // Create a table
            linesTable = document.createElement('table');
            linesTable.className = 'tflStatus bright';

            // Lines with good service counter
            var goodService = 0;

            for (var line in lines) {
                // Create a line for each line
                lineRow = document.createElement('tr');

                // Create line name with corresponding class (for colors)
                lineName = document.createElement('td');
                lineName.className = 'lineName ' + line.id;
                lineName.innerHTML = line.name;

                // Create status cell
                lineStatus = document.createElement('td');
                lineStatus.innerHTML = line.status;

                // Assign class depending on the status
                switch (severity) {
                    case 'Good Service':
                    case 'No Issues':
                        lineStatus.className = 'lineStatus goodStatus';
                        break;
                    case 'Part Closure':
                    case 'Minor Delays':
                    case 'Part Suspended':
                    case 'Reduced Service':
                    case 'Bus Service':
                    case 'Part Closed':
                    case 'No Step Free Access':
                    case 'Diverted':
                    case 'Issues Reported':
                        lineStatus.className = 'lineStatus poorStatus';
                        break;
                    case 'Closed':
                    case 'Service Closed':
                    case 'Planned Closure':
                    case 'Suspended':
                    case 'Severe Delays':
                    case 'Exit Only':
                    case 'Not Running':
                        lineStatus.className = 'lineStatus badStatus';
                        break;
                    default:
                        lineStatus.className = 'lineStatus';
                        break;
                }

                lineRow.appendChild(lineName);
                lineRow.appendChild(lineStatus);

                // Count lines with good service
                if (line.status == 'Good Service') {
                    goodService++;
                }

                // We do not show those with good service if `hide_good` is set
                if (!this.config.hide_good || line.status != 'Good Service') {
                    linesTable.appendChild(lineRow);
                }
            }


            // Let's add a "Good Service" banner on "All Lines" if all are running fine
            // (and `hide_good` is set)
            if (finishedLoading && this.config.hide_good && goodService === lines.length && errors.length == 0) {
                allRow = document.createElement('tr');

                allLines = document.createElement('td');
                allLines.className = 'lineName allLines';
                allLines.innerHTML = 'All Lines';

                allStatus = document.createElement('td');
                allStatus.className = 'lineStatus goodService';
                allStatus.innerHTML = 'Good Service';

                allRow.appendChild(allLines);
                allRow.appendChild(allStatus);

                linesTable.appendChild(allRow);
            }

            wrapper.appendChild(linesTable);

        }

        return wrapper;
    },



    socketNotificationReceived: function (notification, payload) {
        // check to see if the response was for us and used the same url
        if (notification === 'GOT-TFL-STATUS') {
            // we got some data so set the flag, stash the data to display then request the dom update
            this.result[payload.mode] = payload.result;
            this.updateDom(1000);
        }
    }
});
