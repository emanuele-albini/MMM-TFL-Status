# MMM-TFL-Status 
## Magic Mirror Module for Trasport For London Status

![](https://img.shields.io/badge/status-active-brightgreen)
![Issues](
https://img.shields.io/github/issues/emanuele-albini/MMM-TFL-Status)
![Pull](
https://img.shields.io/github/issues-pr/emanuele-albini/MMM-TFL-Status)
[![Maintaner](https://img.shields.io/badge/maintainer-Emanuele-blue)](https://www.emanuelealbini.com)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/emanuele-albini/qualtrutils/blob/master/LICENSE)

This is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror).  

This module shows the status of the Transport for London (TFL) lines including:
- Tube
- Elizabeth Line
- DLR
- Overground
- Tram
- Bus
- River Coach

<img src="tube.png" width="300"/>

## Installation
Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/emanuele-albini/MMM-TFL-Status`. 
A new folder `MMM-TFL-Status` will appear, navigate into it.

The package does not require any additional dependency and thus does not contains any `package.json`.

*If you encounter any issuses with the package, please submit an issue here on GitHub.*

## Configuration
The entry in `config.js` can include the following options. *All arguments are optional*.

|Option|Description|
|---|---|
|`interval`| How often the TFL status is updated.<br><br>**Type:** `integer`<br>**Default value:** `600000 // 10 minutes`|
|`modes`| Modes for which to gather the status from TFL API.<br>Check [https://api.tfl.gov.uk/line/meta/modes](https://api.tfl.gov.uk/line/meta/modes) for a list of valid modes. <br><br>**Type:** `array` of `string` <br>**Default value:** `['tube', 'elizabeth-line', 'dlr', 'overground']`|
|`ignore_good`| This determines if the module display hides lines that have good service (`true`) or shows all of the lines (`false`). If this is used and all lines have good service then only a single line indicates this. <br><br>**Type:** `boolean`<br>**Default value:** `false`|
|`lines`| Array of lines to visualise (among those in the selected modes).<br>Check [https://api.tfl.gov.uk/line/mode/<mode>](https://api.tfl.gov.uk/line/mode/tube) for a list of all the lines in a certain mode.<br><br>**Type:** `array` of `string` (lines id, or name, in lower-case) <br>**Default value:** `null` (all)|
|`lines_always_show`| Array of lines to always show (even if `hide_good = true`).<br><br>**Type:** `array` of `string` (lines id, or name, in lower-case) <br>**Default value:** `null` (none)|
|`lines_order`| Order in which to visualise the lines. The lines listed here will be visualised first (in the order specified). <br><br>**Type:** `array` of `string`  <br>**Default value:** `null` (random order)|
|`blacklistLines`| If `true`, `lines` will act as a balcklist (all the lines but those specified will be visualised). <br><br>**Type:** `boolean` <br>**Default value:** `false`|
|`names`| A line ID-name mapping to override the default names that TFL gives to lines. This is useful for lines that have inexplicably long names in TFL API (e.g., `London Overground` or `Elizabeth line`) <br><br>**Type:** `object/dictionary` line ids as keys and line names as values <br>**Default value:** `{ 'london-overground': 'Overground', 'elizabeth': 'Elizabeth' }`|

Here is an example of an entry in `config.js`
```
{
    module:     'MMM-TFL-Status',
    position:   'top_left',
    config:		{
        ignore_good: true,
        lines_always_show: ['elizabeth'],
        interval: 15 * 60 * 1000, // 15 minutes
    }
},
```

### TFL API

For more informations on the TFL API check out their [website](https://api.tfl.gov.uk/).

Note that this plugin does not require any API key because TFL grants 50 requests/minute under anonymous access at the time of writing.

## Credits
This module is based and considerably extends [Nigel Daniels](https://github.com/nigel-daniels/)'s module [MMM-Tube-Status](https://github.com/nigel-daniels/MMM-Tube-Status).

This module extends it by allowing the user to:
- show also additional TFL lines (and not only Tube lines);
- use a blacklist of lines instead of a whitelist.
- sort the lines in a custom order;
- select some lines to always show even if the `hide_good` option is set.
- Removing the dependency from the `request` package.
