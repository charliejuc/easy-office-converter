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

	if ( ! self.filePath ) throw new Error('filePath is required')
	if ( ! self.options.outputFormat ) throw new Error('outputFormat option is required')
	
	self.inputExt = path.extname(self.filePath)
	self.inputFilename = path.basename(self.filePath, self.inputExt)
	self.inputDirname = path.dirname(self.filePath)
	self.outputExt = self.options.outputFormat 

	self.outputFilename = self.inputFilename

	self.outputFilePath = path.join(self.inputDirname, self.outputFilename + '.' + self.outputExt)

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

	self.convert = function (callback) {
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
			
			callback(null, self.getOutputFilePath())
		})
	}
	
	self.getFinalOutputFilePath = function () {
		var oldPath = self.getOutputFilePath()
		if ( ! self.options.outputDir ) return oldPath
		
		return path.join(self.options.outputDir, self.outputFilename + '.' + self.outputExt)	
	} 

	self.getOutputFilePath = function () {
		return self.outputFilePath
	}

	self.moveFileToOutput = function (callback) {
		if ( ! self.options.outputDir ) return callback()

		var oldPath = self.getOutputFilePath()
		var newPath = self.getFinalOutputFilePath()

		self.outputFilePath = newPath
	
		fs.rename(oldPath, newPath, callback)
	}

	self.getConvertCommand = function () {
		var command = 'unoconv -f %s %s' 
		return util.format(command, self.options.outputFormat, self.filePath)
	}
	
	return self
}

module.exports = officeConverter
