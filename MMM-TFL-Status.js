/* Magic Mirror Module: MMM-TFL-Status
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * And Emanuele Albini https://github.com/emanuele-albini/
 * MIT Licensed.
 */

const ALIAS = { 'London Overground': 'Overground' };

Module.register('MMM-TFL-Status', {

    defaults: {
        modes: ['tube', 'elizabeth-line', 'dlr', 'overground'],
        lines: null,
        blacklistLines: false,
        lines_sorting: null,
        lines_always_show: null,
        ignore_good: false,
        interval: 15 * 60 * 1000, // Every 15 minutes
        names: { 'london-overground': 'Overground', 'elizabeth': 'Elizabeth' },
    },


    start: function () {
        Log.log('Starting module: ' + this.name);

        // Set up the local values, here we construct the request url to use
        this.responses = {};

        // Trigger the first request
        this.getTFLStatusData();
    },


    getStyles: function () {
        return ['tube-status.css', 'font-awesome.css'];
    },


    getTFLStatusData: function () {

        var that = this;

        // Request he helper to get the status for each mode
        this.config.modes.forEach(function (mode) {
            console.log('Getting TFL status for ' + mode + '...');
            that.sendSocketNotification('GET-TFL-STATUS', mode);
        });

        // Set up the timer to perform the updates
        setTimeout(that.getTFLStatusData, that.config.interval);
    },


    getDom: function () {

        var that = this;

        // Set up the wrapper
        var wrapper = document.createElement('div');
        wrapper.className = 'bright medium';


        var startedLoading = (Object.keys(this.responses).length > 0);
        var finishedLoading = (Object.keys(this.responses).length == this.config.modes.length);
        var errors = [];

        // If we have some data to display then build the results table
        if (startedLoading) {
            // Get status of all the lines
            var lines = []
            for (var mode in that.responses) {
                response = that.responses[mode];
                const { result } = response;
                if (result !== null) {
                    for (var i = 0; i < result.length; i++) {
                        r = result[i]
                        for (var j = 0; j < r.lineStatuses.length; j++) {
                            if (r.lineStatuses[j].validityPeriods.length < 2) {
                                statusDesc = r.lineStatuses[j].statusSeverityDescription;
                            } else {
                                for (var k = 0; k < r.lineStatuses[j].validityPeriods.length; k++) {
                                    if (r.lineStatuses[j].validityPeriods[k].isNow) {
                                        statusDesc = r.lineStatuses[j].statusSeverityDescription;
                                    }
                                }
                            }
                        }

                        lineName = r.name;
                        if (that.config.names[r.id] !== undefined) {
                            lineName = that.config.names[r.id];
                        }

                        var line = {
                            'id': r.id,
                            'name': lineName,
                            'status': statusDesc,
                            'mode': mode,
                        };

                        console.log('MMM-TFL-Status: ' + r.id + ' (' + r.name + ') reports ' + statusDesc);

                        if (that.config.lines === null) {
                            lines.push(line);
                        } else {

                            // We exclude the blacklisted lines if `blacklistLines` is set
                            // Otherwise we keep only those specified (or all if config.lines is null)
                            if (that.config.blacklistLines) {
                                if (!that.config.lines.includes(line.id)) {
                                    lines.push(line);
                                }
                            } else {
                                if (that.config.lines.includes(line.id)) {
                                    lines.push(line);
                                }
                            }
                        }
                    }
                } else {
                    errors.push({ 'mode': mode, 'message': response.error })
                }
            }

            //Sort
            if (that.config.lines_sorting !== null) {
                const compareLines = (linea, lineb) => {
                    var indexa = that.config.lines_sorting.indexOf(linea.id)
                    var indexb = that.config.lines_sorting.indexOf(lineb.id)

                    if (indexa == -1) {
                        indexa = 10000
                    }
                    if (indexb == -1) {
                        indexb = 10000
                    }

                    return indexa - indexb;
                }
                lines = lines.sort(compareLines)
            }

            // Show loading banner if all modes did not load yet
            if (!finishedLoading) {
                wrapper.innerHTML = 'Loading TfL status...';
            }

            // Show error banner if some of the modes status did not load correctly
            if (errors.length > 0) {
                wrapper.innerHTML = ''
                errors.forEach(function (err) {
                    wrapper.innerHTML += 'Error ' + err.message + ' loading TfL status for ' + err.mode + '<br>';
                });
            }

            // Create a table
            linesTable = document.createElement('table');
            linesTable.className = 'tflStatus bright';

            // Lines with good service counter
            var goodService = 0;

            lines.forEach(function (line) {
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
                switch (line.status) {
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

                // We do not show those with good service if `ignore_good` is set
                console.log(that.config.ignore_good.toString());
                if (!that.config.ignore_good || line.status != 'Good Service' || (that.config.lines_always_show !== null && that.config.lines_always_show.includes(line.id))) {
                    linesTable.appendChild(lineRow);
                }
            });


            // Let's add a "Good Service" banner on "All Lines" if all are running fine
            // (and `ignore_good` is set)
            if (finishedLoading && that.config.ignore_good && goodService === lines.length && errors.length == 0) {
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

        } else {
            wrapper.innerHTML = 'Loading TfL lines...';
        }

        return wrapper;
    },



    socketNotificationReceived: function (notification, payload) {
        // check to see if the response was for us and used the same url
        if (notification === 'GOT-TFL-STATUS') {
            console.log('Got TFL status for ', payload.mode);

            // we got some data so set the flag, stash the data to display then request the dom update
            this.responses[payload.mode] = payload;
            this.updateDom(1000);
        }
    }
});
