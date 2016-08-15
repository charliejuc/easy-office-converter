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
	
	var inputExt = path.extname(self.filePath)
	var filename = path.basename(self.filePath, inputExt)
	var dirname = path.dirname(self.filePath)
	var ext = '.' + self.options.outputFormat 

	self.outputFilePath = path.join(dirname, filename + ext)

	self.convert = function (callback) {
		function convertProcess (cb) {
			var convertCommand = self.getConvertCommand()

			exec(convertCommand, (err, stdout, stderr) => {
				if (err) return cb(err)

				cb()
			})
		} 

		function fileExists (cb) {
			fs.access(self.getOutputFilePath(), fs.F_OK, (err) => {
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
			convertProcess,
			fileExists,
			moveFile
		], err => {
			if (err) return callback(err)

			callback(null, self.getOutputFilePath())
		})
	}

	self.getOutputFilePath = function () {
		return self.outputFilePath
	}

	self.moveFileToOutput = function (callback) {
		if ( ! self.options.outputDir ) return callback()

		var oldPath = self.getOutputFilePath()
		var newPath = path.join(self.options.outputDir, path.basename(oldPath))

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
