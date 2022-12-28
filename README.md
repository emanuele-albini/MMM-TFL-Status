# MMM-TFL-Status 
## Magic Mirror Module for Trasport For London Status

This is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror).  

This module shows the status of the Transport for London (TFL) lines including:
- Tube
- Elizabeth Line
- DLR
- Overground
- Tram
- Bus

![TFL status](tube.png "TFL status.")

## Installation
Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/emanuele-albini/MMM-TFL-Status`. 
A new folder `MMM-TFL-Status` will appear, navigate into it.

The package does not require any additional dependency and thus does not contains any `package.json`.

*If you encounter any issuses with the package, please submit an issue here on GitHub.*

## Configuration
The entry in `config.js` can include the following options:

|Option|Description|
|---|---|
|`modes`| Modes for which to gather the status from TFL API.<br><br>**Type:** `array` of `string` <br>**Default value:** `['tube', 'elizabeth_line', 'dlr', 'overground']`|
|`lines`| Array of lines to visualise.<br><br>**Type:** `array` of `string` (lines id, or name, in lower-case) <br>**Default value:** `null // all`|
|`lines_order`| Order in which to visualise the lines. The lines listed here will be visualised first (in the order specified). <br><br>**Type:** `array` of `string`  <br>**Default value:** `['elizabeth', 'jubilee', 'piccadilly', 'bakerloo', 'northern', 'dlr', 'victoria', 'district', 'circle', 'london-overground']`|
|`blacklistLines`| If `true`, `lines` will act as a balcklist (all the lines but those specified will be visualised). <br><br>**Type:** `boolean` <br>**Default value:** `false`|
|`hide_good`| This determines if the module displays hides lines that have good service (`true`) or shows all of the lines (`true`). If this is used and all lines have good service then only a single line indicates this. <br><br>**Type:** `boolean`<br>**Default value:** `false`|
|`interval`| How often the TFL status is updated.<br><br>**Type:** `integer`<br>**Default value:** `600000 // 10 minutes`|

Here is an example of an entry in `config.js`
```
{
    module:		'MMM-TFL-Status',
    position:	'top_left',
    header:		'TFL Status',
    config:		{
        hide_good: false,
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
- 
- Removing the dependency from the `request` package.
