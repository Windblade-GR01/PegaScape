var fs = require('fs');
module.exports = function (repl, file) {
	try {
		var stat = fs.statSync(file);
		repl.history = fs.readFileSync(file, 'utf-8').split('\n').reverse();
		repl.history.shift();
		repl.historyIndex = -1; // will be incremented before pop
	} catch (e) { }

	var fd = fs.openSync(file, 'a'), reval = repl.eval;
	var wstream = fs.createWriteStream(file, {
		fd: fd
	});
	wstream.on('error', function (err) {
		throw err;
	});

	repl.addListener('line', function (code) {
		if (code && code !== '.history') {
			wstream.write(code + '\n');
		} else if (repl != null) {
			repl.historyIndex++;
			repl.history.pop();
		}
	});

	process.on('exit', function () {
		fs.closeSync(fd);
	});

	repl.commands['history'] = {
		help: 'Show the history',
		action: function () {
			var out = [];
			repl.history.forEach(function (v, k) {
				out.push(v);
			});
			repl.outputStream.write(out.reverse().join('\n') + '\n');
			repl.displayPrompt();
		}
	};
};
