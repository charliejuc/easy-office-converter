#easy-office-converter

##INPUT SUPPORTED FORMATS
1. Any office or libreoffice format. (ppt, pptx, xls, xlsx, odt...)

##OUTPUT SUPPORTED FORMATS
1. pdf
2. html
3. Any office or libreoffice format. (ppt, pptx, xls, xlsx, odt...)

##USAGE

``` js
var officeConverter = require('easy-office-converter')

var converter = officeConverter('./foo/foo.ppt', {
	outputFormat: 'pdf',
	outputDir: './media/', //optional, use file to convert directory as default value
	quality: 100 //optional, 100 is the default value
})

converter.convert((err, file_path) => {
	//Do something when convert the file
})
```
