'use strict'
var async = require('async')
var test = require('tape')
var officeConverter = require('../')
var path = require('path')
var util = require('util')
var inputFormats =  ['ppt', 'pptx', 'doc', 'docx']
var outputFormats = ['pdf', 'pdf', 'html']
var fakeOutputFormats = ['dafsd', '23saf']
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

	t.ok(converter.getOutputFilePath, 'converter.getOutputFilePath should be exist')
	t.equals(typeof converter.getOutputFilePath, 'function', 'converter.getOutputFilePath should be a function')

	t.ok(converter.getFinalOutputFilePath, 'converter.getFinalOutputFilePath should be exist')
	t.equals(typeof converter.getFinalOutputFilePath, 'function', 'converter.getFinalOutputFilePath should be a function')
	
	t.ok(converter.fileExists, 'converter.fileExists should be exist')
	t.equals(typeof converter.fileExists, 'function', 'converter.fileExists should be a function')
	
	t.ok(converter.inputFileExists, 'converter.inputFileExists should be exist')
	t.equals(typeof converter.inputFileExists, 'function', 'converter.inputFileExists should be a function')
	
	t.ok(converter.outputFileExists, 'converter.outputFileExists should be exist')
	t.equals(typeof converter.outputFileExists, 'function', 'converter.outputFileExists should be a function')

	t.ok(converter.finalOutputFileExists, 'converter.finalOutputFileExists should be exist')
	t.equals(typeof converter.finalOutputFileExists, 'function', 'converter.finalOutputFileExists should be a function')

	t.ok(converter.addUniqueidToOutputFilename, 'converter.addUniqueidToOutputFilename should be exist')
	t.equals(typeof converter.addUniqueidToOutputFilename, 'function', 'converter.addUniqueidToOutputFilename should be a function')

	t.ok(converter.filePath, 'converter.filePath should be exist')
	t.equals(converter.filePath, filePath, 'converter.filePath should be a function')

	t.ok(converter.outputFilePath, 'converter.outputFilePath should be exist')
	t.equals(converter.outputFilePath, converter.getOutputFilePath(), 'converter.outputFilePath should be equal to converter.getOutputFilePath()')

	function inputFileExists (cb) {
		converter.inputFileExists(err => {
			t.error(err, 'should not be an error in inputFileExists')
			
			if (err) cb(err)

			cb()
		})
	}
	
	function outputFileExists (cb) {
		converter.outputFileExists(err => {
			cb()
		})
	}
	
	async.series([
		inputFileExists,
		outputFileExists
	], err => {
		t.error(err, 'should not be an error in async.series final callback')

		t.end()
	})
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
			if ( ! err ) fs.unlink(filePath)
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

		function doConvert (i_length, o_length) {
			if ( ! i_length ) return
			--i_length

			inputFormat = inputFormats[i_length]

			filePath = filePath_no_ext + inputFormat
			
			function endConvert (o_length) {
				if ( ! o_length ) return doConvert(i_length, outputFormats.length)
				--o_length

				outputFormat = outputFormats[o_length]
				options = {
					outputFormat: outputFormat,
					outputDir: outputDir
				}

				converter = officeConverter(filePath, options)

				converter.convert((err, filePath) => { 
					callbacks[i_length > 0 || o_length > 0 ? 1 : 0](err, filePath)

					endConvert(o_length)
				})
			}

			endConvert(o_length)
		}

		doConvert(i_length, o_length)
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

	function failByFilePath (cb) {
		inputFormat = path.extname(filePath)
		outputFormat = 'pdf'
		options = {
			outputFormat: outputFormat,
		}

		converter = officeConverter(filePath, options)

		converter.convert((err, filePath) => {
			t.ok(err, util.format('should be an error in convert %s to %s', inputFormat, outputFormat))
			t.ok(! filePath, util.format('should not be exists filePath in convert %s to %s', inputFormat, outputFormat))
			cb()
		})
	}	
		
	function failByOutputExt (cb) {
		filePath = path.join(__dirname, 'test-files', 'test.doc')

		inputFormat = path.extname(filePath)
		outputFormat = fakeOutputFormats[0]
		options = {
			outputFormat: outputFormat,
		}

		converter = officeConverter(filePath, options)

		converter.convert((err, filePath) => {
			t.ok(err, util.format('should be an error in convert %s to %s', inputFormat, outputFormat))
			t.ok(! filePath, util.format('should not be exists filePath in convert %s to %s', inputFormat, outputFormat))
			cb()
		})
	}	

	async.series([
		failByFilePath,
		failByOutputExt		
	], err => {
		t.end()
	})
})
