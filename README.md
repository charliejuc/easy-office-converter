#easy-office-converter

##INPUT SUPPORTED FORMATS
1. Any office or libreoffice format. (ppt, pptx, xls, xlsx, odt, doc...)

##OUTPUT SUPPORTED FORMATS
1. pdf
2. html
3. Any office or libreoffice format. (ppt, pptx, xls, xlsx, odt, doc...)

##USAGE

``` js
var officeConverter = require('easy-office-converter')

var converter = officeConverter('./foo/foo.ppt', {
	allowQueue: true, //optional, default is true, more information bellow.
	timeout: 500 //optional, 500 ms is the default value
})

var output_options = {
	outputDir: './media/', //optional, use file to convert directory as default value
	outputFormat: 'pdf' //parameter required
}

converter.convert((err, file_path) => {
	//Do something when convert the file
}, output_options)

var output_options = {
	outputDir: './media/', //optional, use file to convert directory as default value
	outputFormat: 'html' //parameter required
}

converter.convert((err, file_path) => {
	//Do something when convert the file
}, output_options)
```

##OPTIONS
* allowQueue(default:true): This module uses internally unoconv and libreoffice. Libreoffice has problems when there are many "soffice.bin" instances. Then by default this module checks if another instance is running and wait until it is done, so we avoid strange error messages and we can guarantee a successful conversion. Changing this option to false none of this will be done.
* timeout(default:500): Time in milliseconds to wait for complete conversion.


##DEPENDENCIES
We need unoconv and libreoffice to convert the files: <https://github.com/dagwieers/unoconv>

On ubuntu or debian you can exec:
```
apt-get install unoconv libreoffice
```
