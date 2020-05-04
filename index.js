#!/usr/bin/env node

const dbfstream = require('dbfstreammemo');
const { program } = require('commander');
program
	.arguments('<filePath>')
	.option('-hr, --header', 'Show Header Row')
	.option('-nr, --numRows', 'Show Number Of Rows')
	.option('-d, --showData', 'Show Data')
	.option('-dr, --dataRow <number>', 'Show Data Row (Accept multiple rows split with ",")')
	.option('-c, --column <name>', 'Show Column (Accept multiple params split with ",")')
	.option('-v, --verbose', 'Show Additional Logging')
	.action((filePath, { header , showData , numRows, verbose }) => {
		let obj = { data: []};
		log(verbose , `Opening DBF ${filePath}`);
		let dbf = dbfstream(filePath , 'utf-8');
		let opts = program.column ? program.column.split(',') : false;
		let rows = program.dataRow ? program.dataRow.split(',') : false;
		dbf.on('header', (data) => {
			log(verbose , `DBF Header Loaded`)
			obj.header = {...data}
			if (numRows){ console.log(`Number Of Records: ${obj.header.numberOfRecords}`) };
			if (header) { console.log(obj.header) };
			if (!showData && !opts && !rows) { process.exit(0) }
		});
		dbf.on('data', (data) => {
			obj.data.push(data);
			if (rows){
				rows.includes(data['@numOfRecord'].toString()) ? printRow(data, opts) : null;
			}
		});
		dbf.on('end', () => {
			if (showData && !opts) console.dir(obj.data);
			if (showData && opts) {obj.data.forEach((obj) => {printRow(obj , opts)})}
		});
   	});
function printRow(row , opts){
	if (!opts){
		let obj = {}
		for (let [key, value] of Object.entries(row)) {
  			obj[key] = value;
		}
		console.table(obj)
	}else{
		let obj = {
			'Row' : row['@numOfRecord']
		};
		for (const word of opts){
			for (let [key, value] of Object.entries(row)) {
				if (key.toLowerCase().includes(word.toLowerCase())){
					obj[key] = value;
				}
			}
		}
		console.table(obj)
	}
}
function log(verbose , message ){
	verbose ? console.log(message) : null;
}
program.parse(process.argv);
