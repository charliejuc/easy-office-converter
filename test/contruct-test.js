'use strict'
var test = require('tape')
var officeConverter = require('../')
var path = require('path')
var util = require('util')
var inputFormats = ['ppt']
var outputFormats = ['pdf']
var fs = require('fs')

test('Should be create officeConverter properly', function (t) {
	t.ok(officeConverter, 'officeConverter should be exist')
	t.equals(typeof officeConverter, 'function', 'officeConverter should be a function')

	var filePath = path.join(__dirname, 'test-files', 'test.ppt')
	var outputFormat = 'pdf'
	var outputDir = path.join(__dirname, 'files-output')
	var options = {
		outputFormat: outputFormat,
		outputDir: outputDir
	}

	var converter = officeConverter(filePath, options)
	
	t.ok(converter, 'converter should be exist')		
	t.ok(converter instanceof {}.constructor, 'converter should be a json object')

	t.ok(converter.options, 'converter.options should be exist')		
	t.ok(converter.options instanceof {}.constructor, 'converter.options should be a json object')

	t.ok(converter.options.outputFormat, 'converter.options.outputFormat should be exist')
	t.equals(converter.options.outputFormat, outputFormat, 'converter.options.outputFormat should be equals to outputFormat')

	t.ok(converter.options.outputDir, 'converter.options.outputDir should be exist')
	t.equals(converter.options.outputDir, outputDir, 'converter.options.outputDir should be equals to outputDir')
	
	t.ok(converter.convert, 'converter.convert should be exist')
	t.equals(typeof converter.convert, 'function', 'converter.convert should be a function')

	t.ok(converter.getConvertCommand, 'converter.getConvertCommand should be exist')
	t.equals(typeof converter.getConvertCommand, 'function', 'converter.getConvertCommand should be a function')
	t.equals(converter.getConvertCommand(), util.format('unoconv -f %s %s', outputFormat, filePath), 'converter.getConvertCommand should be equals to unoconv command')

	t.ok(converter.moveFileToOutput, 'converter.moveFileToOutput should be exist')
	t.equals(typeof converter.moveFileToOutput, 'function', 'converter.moveFileToOutput should be a function')

	t.ok(converter.getOutputFilePath, 'converter.moveFileToOutput should be exist')
	t.equals(typeof converter.getOutputFilePath, 'function', 'converter.moveFileToOutput should be a function')

	t.ok(converter.filePath, 'converter.filePath should be exist')
	t.equals(converter.filePath, filePath, 'converter.filePath should be a function')

	t.ok(converter.outputFilePath, 'converter.outputFilePath should be exist')
	t.equals(converter.outputFilePath, converter.getOutputFilePath(), 'converter.outputFilePath should be equal to converter.getOutputFilePath()')
	
	t.end()
})

test('should convert files', function (t) {		
	var filePath_no_ext = path.join(__dirname, 'test-files', 'test.')
	var outputDir = path.join(__dirname, 'files-output')

	var converter, filePath, options, outputFormat, inputFormat
	
	var base_callback = (err, filePath, cb) => {
		t.error(err, util.format('should not be an error in convert %s to %s', inputFormat, outputFormat))	
		t.ok(filePath, util.format('should be exists filePath in convert %s to %s', inputFormat, outputFormat))	

		fs.access(filePath || '', fs.F_OK, err => {
			t.error(err, 'should not be an error if file exists')	
			if (cb) cb()
		})
	}
	var callbacks = [(err, filePath) => {
				base_callback(err, filePath, whileEnd)				
			}, base_callback]

	function whileEnd() {
		if (! outputDir) return t.end()
		outputDir = undefined
		whileConverting()
	}

	function whileConverting () {
		var i_length = inputFormats.length
		var o_length = outputFormats.length

		while (i_length) {
			--i_length

			inputFormat = inputFormats[i_length]

			filePath = filePath_no_ext + inputFormat
			
			while (o_length) {
				--o_length

				outputFormat = outputFormats[o_length]
				options = {
					outputFormat: outputFormat,
					outputDir: outputDir
				}

				converter = officeConverter(filePath, options)

				converter.convert(callbacks[o_length > 0 ? 1 : 0])
			}
		}
	}


	whileConverting()
})

test('should be throw exception', function (t) {
	var filePath = path.join(__dirname, 'test-files', 'test.ppt')
	var outputFormat = 'pdf'
	var outputDir = path.join(__dirname, 'files-output')


	try {	
		var converter = officeConverter(filePath)
	} catch (e) {
		t.ok(e, 'should be throw exception if there are not options.')	
	}

	try {	
		var converter = officeConverter()
	} catch (e) {
		t.ok(e, 'should be throw exception if there is not filePath.')	
	}

	t.end()
	
})

test('should be fail converting files', function (t) {		
	var i_length = inputFormats.length
	var o_length = outputFormats.length

	var filePath = path.join(__dirname, 'test-files', 'testsdf.')
	var outputDir = path.join(__dirname, 'files-output')

	var converter, filePath, options, outputFormat, inputFormat

	inputFormat = path.extname(filePath)
	outputFormat = 'pdf'
	options = {
		outputFormat: outputFormat,
	}

	converter = officeConverter(filePath, options)

	converter.convert((err, filePath) => {
		t.ok(err, util.format('should be an error in convert %s to %s', inputFormat, outputFormat))
		t.ok(! filePath, util.format('should not be exists filePath in convert %s to %s', inputFormat, outputFormat))
		t.end()
	})
})
