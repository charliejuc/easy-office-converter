'use strict'
var async = require('async')
var test = require('tape')
var officeConverter = require('../').converter
var listenerFunc = require('../').listener
var path = require('path')
var util = require('util')
var inputFormats =  ['ppt', 'pptx', 'doc', 'docx']
var outputFormats = ['pdf', 'pdf', 'html']
var fakeOutputFormats = ['dafsd', '23saf']
var fs = require('fs')

test('Should be create officeConverter properly', function (t) {
	t.ok(officeConverter, 'officeConverter should be exist')
	t.equals(typeof officeConverter, 'function', 'officeConverter should be a function')

	t.ok(listenerFunc, 'listenerFunc should be exist')
	t.equals(typeof listenerFunc, 'function', 'listenerFunc should be a function')

	var filePath = path.join(__dirname, 'test-files', 'test.ppt')
	var timeout = 550
	var options = {
		timeout: timeout
	}

	var converter = officeConverter(filePath, options)
	var listener = listenerFunc()
	
	t.ok(converter, 'converter should be exist')		
	t.ok(converter instanceof {}.constructor, 'converter should be a json object')

	t.ok(converter.options, 'converter.options should be exist')		
	t.ok(converter.options instanceof {}.constructor, 'converter.options should be a json object')

	t.ok(listener.options, 'listener.options should be exist')		
	t.ok(listener.options instanceof {}.constructor, 'listener.options should be a json object')

	t.equals(converter.options.timeout, timeout,'converter.options.timeout should be equal to timeout')
	
	t.ok(converter.convert, 'converter.convert should be exist')
	t.equals(typeof converter.convert, 'function', 'converter.convert should be a function')

	t.ok(listener._getProcessCommand, 'listener._getProcessCommand should be exist')
	t.equals(typeof listener._getProcessCommand, 'function', 'listener._getProcessCommand should be a function')

	t.ok(listener._getListenerCommand, 'listener._getListenerCommand should be exist')
	t.equals(typeof listener._getListenerCommand, 'function', 'listener._getListenerCommand should be a function')

	t.ok(listener._getSofficeCommand, 'listener._getSofficeCommand should be exist')
	t.equals(typeof listener._getSofficeCommand, 'function', 'listener._getSofficeCommand should be a function')

	t.ok(converter.getConvertCommand, 'converter.getConvertCommand should be exist')
	t.equals(typeof converter.getConvertCommand, 'function', 'converter.getConvertCommand should be a function')	

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

	t.ok(converter.setOutputOptions, 'converter.setOutputOptions should be exist')
	t.equals(typeof converter.setOutputOptions, 'function', 'converter.setOutputOptions should be a function')

	t.ok(converter.filePath, 'converter.filePath should be exist')
	t.equals(converter.filePath, filePath, 'converter.filePath should be a function')

	t.ok(listener.exists, 'listener.exists should be exist')
	t.equals(typeof listener.exists, 'function', 'listener.exists should be a function')

	t.ok(listener.create, 'listener.create should be exist')
	t.equals(typeof listener.create, 'function', 'listener.create should be a function')
	
	t.ok(listener.kill, 'listener.kill should be exist')
	t.equals(typeof listener.kill, 'function', 'listener.kill should be a function')
	
	t.ok(listener.pid, 'listener.pid should be exist')
	t.equals(typeof listener.pid, 'function', 'listener.pid should be a function')
	
	function existsListener (cb) {
		function createListener (callback) {
			listener.create(callback)	
		}

		listener.exists((err, exists) => {
			t.error(err, 'should not be an error in listener.exists')
			t.ok(exists === false || exists === true, 'listener.exists should be equal to true or false')

			if ( exists === false ) createListener(cb)

			cb()
		})
	}

	
	function inputFileExists (cb) {
		converter.inputFileExists(err => {
			t.error(err, 'should not be an error in inputFileExists')
			
			if (err) cb(err)

			cb()
		})
	}
	
	function outputFileExists (cb) {
		converter.outputOptions = { outputFormat: 'pdf' }

		converter.outputFileExists(err => {
			cb()
		})
	}
	
	async.series([
		existsListener,
		inputFileExists,
		outputFileExists
	], err => {
		t.error(err, 'should not be an error in async.series final callback')

		t.end()
	})
})

test('should be throw exception', function (t) {
	var filePath = path.join(__dirname, 'test-files', 'test.ppt')
	var outputFormat = 'pdf'
	var outputDir = path.join(__dirname, 'files-output')
	var except

	try {	
		
		var converter = officeConverter(filePath)
		converter.convert((err, filePath) => {})
	} catch (e) {
		except = e
	}

	t.ok(except, 'should be throw exception if there are not options.')	
	except = undefined

	try {	
		var converter = officeConverter()
	} catch (e) {
		except = e
	}

	t.ok(except, 'should be throw exception if there is not filePath.')	
	except = undefined

	t.end()
	
})

test('Fail creating listener', function (t) {
	var listener = listenerFunc()
	
	listener.kill((err) => {
		t.error(err, 'should not be an error killing listener')
		listener.create((err) => {
			t.ok(err, 'should be and error creating listener')
			t.end()
		})

		setTimeout(() => listener.kill(function () {}), Math.round(listener.options.createTimeout/2))
	})
})

test('Prev convert kill listener', function (t) {
	var listener = listenerFunc()
	var cbCalled = false
	
	function existsListener (cb) {
		var cbWrapper = err => {
			if (cbCalled) return
			cbCalled = true
			if (err) return cb(err)

			cb()
		}

		function createListener (callback) {
			listener.create(callback)	
		}

		listener.exists((err, exists) => {
			t.error(err, 'should not be an error in listener.exists')
			t.ok(exists === false || exists === true, 'listener.exists should be equal to true or false')
			if ( exists === false ) return createListener(cbWrapper)

			cbWrapper()
		})
	}

	function killListener (cb) {
		listener.kill(cb)	
	}

	async.series([
		existsListener,
		killListener
	], err => {
		t.error(err, 'should not be an error in async.series')

		t.end()
	})
})

test('Kill listener fails', function (t) {
	var listener = listenerFunc()	
	var killListener = err => {
		listener.kill(err => {
			t.ok(err, 'should be an error in kill cb')
			t.end()
		})	
	}

	listener.kill(killListener)	
})

test('should convert files', function (t) {		
	var filePath_no_ext = path.join(__dirname, 'test-files', 'test.')
	var outputDir = path.join(__dirname, 'files-output')

	var converter, filePath, outputOptions, outputFormat, inputFormat
	
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
			
			converter = officeConverter(filePath)
			
			function endConvert (o_length) {
				if ( ! o_length ) return doConvert(i_length, outputFormats.length)
				--o_length

				outputFormat = outputFormats[o_length]
				outputOptions = {
					outputFormat: outputFormat,
					outputDir: outputDir
				}

				converter.convert((err, filePath) => { 
					t.equals(converter.outputOptions, outputOptions, 'converter.outputOptions should be equal to outputOptions.')
					t.equals(converter.getConvertCommand(), util.format('unoconv -f %s %s', converter.outputOptions.outputFormat, converter.filePath), 'converter.getConvertCommand should be equals to unoconv command')
					t.ok(converter.outputFilePath, 'converter.outputFilePath should be exist')
					t.equals(converter.outputFilePath, converter.getOutputFilePath(), 'converter.outputFilePath should be equal to converter.getOutputFilePath()')
					callbacks[i_length > 0 || o_length > 0 ? 1 : 0](err, filePath)
					
					endConvert(o_length)
				}, outputOptions)
			}

			endConvert(o_length)
		}

		doConvert(i_length, o_length)
	}


	whileConverting()
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

		converter = officeConverter(filePath)

		converter.convert((err, filePath) => {
			t.ok(err, util.format('should be an error in convert %s to %s', inputFormat, outputFormat))
			t.ok(! filePath, util.format('should not be exists filePath in convert %s to %s', inputFormat, outputFormat))
			cb()
		}, options)
	}	
		
	function failByOutputExt (cb) {
		filePath = path.join(__dirname, 'test-files', 'test.doc')

		inputFormat = path.extname(filePath)
		outputFormat = fakeOutputFormats[0]
		options = {
			outputFormat: outputFormat,
		}

		converter = officeConverter(filePath)

		converter.convert((err, filePath) => {
			t.ok(err, util.format('should be an error in convert %s to %s', inputFormat, outputFormat))
			t.ok(! filePath, util.format('should not be exists filePath in convert %s to %s', inputFormat, outputFormat))
			cb()
		}, options)
	}	

	async.series([
		failByFilePath,
		failByOutputExt		
	], err => {
		t.end()
	})
})

test('After convert kill listener', function (t) {
	var listener = listenerFunc()
	
	function existsListener (cb) {
		function createListener (callback) {
			listener.create(callback)	
		}

		listener.exists((err, exists) => {
			t.error(err, 'should not be an error in listener.exists')
			t.ok(exists === false || exists === true, 'listener.exists should be equal to true or false')

			if ( exists === false ) return createListener(cb)

			cb()
		})
	}

	function killListener (cb) {
		listener.kill(cb)	
	}

	async.series([
		existsListener,
		killListener
	], err => {
		t.error(err, 'should not be an error in async.series')

		t.end()
	})
})
