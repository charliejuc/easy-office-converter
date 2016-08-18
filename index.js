var uniqid = require('uniqid')
var async = require('async')
var exec = require('child_process').exec
var path = require('path')
var util = require('util')
var fs = require('fs')

function officeConverter (filePath, options) {
	self = {}
	self.options = options || {}
	self.filePath = filePath

	self.allowQueue = self.options.allowQueue || false
	self.timeout = self.options.timeout || 500

	if ( ! self.filePath ) throw new Error('filePath is required')	
	
	self.inputExt = path.extname(self.filePath)
	self.inputFilename = path.basename(self.filePath, self.inputExt)
	self.inputDirname = path.dirname(self.filePath)
	
	self.outputFilename = self.inputFilename

	self.inputFileExists = function (callback) {
		self.fileExists(self.filePath, callback)
	}

	self.outputFileExists = function (callback) {
		self.fileExists(self.getOutputFilePath(), callback)
	}

	
	self.finalOutputFileExists = function (callback) {
		self.fileExists(self.getFinalOutputFilePath(), callback)
	}


	self.fileExists = function (filePath, callback) {
		fs.access(filePath, fs.F_OK, callback)
	}

	self.addUniqueidToOutputFilename = function () {
		self.outputFilename += util.format('_%s', uniqid())
	}

	self.setOutputOptions = function (outputOptions) {
		if ( ! self.outputOptions || ( outputOptions && Object.keys(outputOptions).length )) {
			self.outputOptions = outputOptions
		}

		return self.outputOptions
	}

	self.appendToQueue = function () {
		throw new Error("Code not finished")
	}

	self.existsPreviousProcess = function () {
		return undefined
	}

	self.convert = function (callback, outputOptions) {
		self.setOutputOptions(outputOptions)

		if ( ! self.outputOptions.outputFormat ) throw new Error('outputFormat option is required')
		if ( self.existsPreviousProcess() ) return self.addToQueue(callback, outputOptions)

		function finalOutputFileExists (cb) {
			var callback = function (err) {
				if ( ! err) self.addUniqueidToOutputFilename()
				
				cb()
			}

			self.finalOutputFileExists(callback)
		}

		function convertProcess (cb) {
			var convertCommand = self.getConvertCommand()

			exec(convertCommand, (err, stdout, stderr) => {
				if (err) return cb(err)

				cb()
			})
		} 

		function outputFileExists (cb) {
			self.outputFileExists(err => {
				if (err) return cb(err)

				cb()
			})
		}

		function moveFile (cb) {
			self.moveFileToOutput(err => {
				if (err) return cb(err)

				cb()
			})
		}

		async.series([
			finalOutputFileExists,
			convertProcess,
			outputFileExists,
			moveFile
		], err => {
			if (err) return callback(err)
			
			callback(null, self.getFinalOutputFilePath())
		})
	}
	
	self.getFinalOutputFilePath = function () {
		var oldPath = self.getOutputFilePath()
		if ( ! self.outputOptions.outputDir ) return oldPath
		
		return path.join(self.outputOptions.outputDir, self.outputFilename + '.' + self.outputOptions.outputFormat)	
	} 

	self.getOutputFilePath = function () {
		self.outputFilePath = path.join(self.inputDirname, self.inputFilename + '.' + self.outputOptions.outputFormat )
		
		return self.outputFilePath
	}

	self.moveFileToOutput = function (callback) {
		if ( ! self.outputOptions.outputDir ) return callback()

		var oldPath = self.getOutputFilePath()
		var newPath = self.getFinalOutputFilePath()

		self.outputFilePath = newPath
	
		fs.rename(oldPath, newPath, callback)
	}

	self.getConvertCommand = function () {
		var command = 'unoconv -f %s %s' 
		return util.format(command, self.outputOptions.outputFormat, self.filePath)
	}
	
	return self
}

module.exports = officeConverter
