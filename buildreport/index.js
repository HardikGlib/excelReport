var excel = require('excel4node');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var tz = require('moment');
var nodemailer = require('nodemailer');
const Storage = require('@google-cloud/storage');
var Promise = require('bluebird');

var url = "mongodb://35.194.53.124:27017/excelReportCloud";

var email = 'hardik@glib.ai';

//const storage = Storage();

var transporter = nodemailer.createTransport({
    service: 'zoho',
    auth: {
        user: 'admin@chembondflux.com',
        pass: 'Turing123'
    }
});


var header1IndexStart = 1
var header1IndexEnd = 10
var header2IndexStart = header1IndexStart + header1IndexEnd
var header3IndexStart = header2IndexStart + 1
var header3IndexEnd = header3IndexStart + 1
var header4IndexStart = header3IndexEnd + 1
var dataIndexStart = header4IndexStart + 1
var dataIndexEnd = dataIndexStart + 34

var SubTotalIndexStart = dataIndexEnd + 4
var SubTotalIndexEnd = SubTotalIndexStart + 6


var generalOptions = {
    font: {
    	size: 10,
    },
};

header1Style = {
    border: {
        top: {
            style: 'thin',
            color: '#FFFFFF'
        },
        bottom: {
            style: 'thin',
            color: '#FFFFFF'
        },
        left: {
            style: 'thin',
            color: '#FFFFFF'
        },
        right: {
            style: 'thin',
            color: '#FFFFFF'
        },
    },
    font: {
    	size: 10,
        color: '0a19e7',
        bold: true
    },
    alignment: {
        horizontal: 'center',
        vertical: 'center'
    },
}


header2Style = {
	border: {
    	top: {
    		style: 'thick',
    	},
    	bottom: {
    		style: 'thick',
    	},
    	left: {
    		style: 'thin',
    	},
    	right: {
    		style: 'thin',
    	},
    },
    alignment: {
    	wrapText: true,
    	horizontal: 'center',
    	vertical: 'center'
    },
    font: {
    	size: 10,
    	bold: true,
    }
}

header3Style = {
	border: {
		top: {
    		style: 'thin',
    	},
    	bottom: {
    		style: 'thin',
    	},
    	left: {
    		style: 'thin',
    	},
    	right: {
    		style: 'thin',
    	},
	},
	font: {
		size: 10,
		bold: true,
	},
	alignment: {
		wrapText: true,
    	horizontal: 'center',
    	vertical: 'center'
    }
}

header4Style = {
	border: {
		top: {
    		style: 'thin',
    	},
    	bottom: {
    		style: 'thick',
    	},
    	left: {
    		style: 'thin',
    	},
    	right: {
    		style: 'thin',
    	},
	},
	font: {
		size: 10,
		bold: true,
	},
	alignment: {
		wrapText: true,
    	horizontal: 'center',
    	vertical: 'center'
    }
}

generalBorder = {
	border: {
		top: {
    		style: 'thin',
    	},
    	bottom: {
    		style: 'thin',
    	},
    	left: {
    		style: 'thin',
    	},
    	right: {
    		style: 'thin',
    	},
	},
	font: {
		size: 10,
	},
	alignment: {
		wrapText: true,
    	horizontal: 'center',
    	vertical: 'center'
    }
}

totalStyle = {
	border: {
		right: {
			style: 'thick',
		},
		top: {
			style: 'thick'
		},
		bottom: {
			style: 'thick'
		}
	},
	font: {
		size: 10,
		bold: true
	},
	alignment: {
    	horizontal: 'center',
    }
}

SubTotalStyle = {
	border: {
		top: {
    		style: 'thin',
    	},
    	bottom: {
    		style: 'thin',
    	},
    	left: {
    		style: 'thin',
    	},
    	right: {
    		style: 'thin',
    	},
	},
	font: {
		size: 10,
	},
	alignment: {
		wrapText: true,
    }
}

function SheetFormat(obj_sheet,obj_header2_list) {
	obj_sheet.row(header2IndexStart).setHeight(40);

	obj_header2_list.forEach(function(value,index) {
		obj_sheet.column(index+1).setWidth(10);
		obj_sheet.cell(header2IndexStart,index+1).string(value).style(header2Style);
	});

	obj_sheet.cell(header3IndexStart,1).string('Unit').style(header3Style);
	obj_sheet.cell(header3IndexEnd,1).string('LIMIT').style(header3Style);
	obj_sheet.cell(header3IndexStart,2,header3IndexEnd,obj_header2_list.length).style(generalBorder);

    obj_sheet.row(header4IndexStart).setHeight(30);
    obj_sheet.cell(header4IndexStart,1).string('Testing Freq').style(header4Style);
    obj_sheet.cell(header4IndexStart,2).string('10 Hrs').style(header4Style);

    obj_sheet.cell(header4IndexStart,3,header4IndexStart,obj_header2_list.length).string('Daily/weekly').style(header4Style);
}

function createFirstSheet(firstSheet,firstSheetHeader2) {

	firstSheet.cell(header1IndexStart,9).string("DAILY REPORT FOR COOLING WATER TREATMENT ");
	firstSheet.cell(header1IndexStart+1,9).string("By: CHEMBOND WATER TECHNOLOGIES LTD");

	firstSheet.cell(header1IndexStart,1,header1IndexEnd,21).style(header1Style);

	firstSheet.addImage({
//    	    path: 'gs://build-report/nav_logo.png',
	    path: 'flux.png',
	    type: 'picture',
	    position: {
	        type: 'twoCellAnchor',
	        from: {
	            col: header1IndexStart,
	            colOff: 0,
	            row: header1IndexStart,
	            rowOff: 0
	        },
	        to: {
	            col: header1IndexEnd-4,
	            colOff: 0,
	            row: header1IndexEnd-1,
	            rowOff: 0
	        }
	    }
	});

	firstSheet.column(firstSheetHeader2.length+1).setWidth(20);
	firstSheet.column(firstSheetHeader2.length+2).setWidth(20);
	firstSheet.cell(header2IndexStart,firstSheetHeader2.length+1).string('Remarks').style(header3Style);
	firstSheet.cell(header2IndexStart,firstSheetHeader2.length+2).string('Observation and remarks on next day').style(header3Style);

	SheetFormat(firstSheet,firstSheetHeader2);

	for(var obj_check=dataIndexStart; obj_check<=dataIndexEnd; obj_check++) {
		firstSheet.row(obj_check).setHeight(30);
	}

	firstSheet.cell(dataIndexStart,1,dataIndexEnd,firstSheetHeader2.length).style(generalBorder);

	firstSheet.cell(dataIndexEnd-2,1).string('Min').style(totalStyle);
	firstSheet.cell(dataIndexEnd-1,1).string('Max').style(totalStyle);
	firstSheet.cell(dataIndexEnd,1).string('Avg.').style(totalStyle);

	str_eg = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	for(var obj_check=2; obj_check<31; obj_check++) {
		if(firstSheetHeader2.length<obj_check) {
			break;
		}
		var obj_column;
		if(obj_check>26) {
			obj_column = 'A' + str_eg.charAt(obj_check-27);
		}
		else {
			obj_column = str_eg.charAt(obj_check-1);
		}
		firstSheet.cell(dataIndexEnd-2,obj_check).formula('MIN('+obj_column+(dataIndexStart)+':'+obj_column+(dataIndexEnd-3)+')').style({border:{top:{style: 'thick'}}});
		firstSheet.cell(dataIndexEnd-1,obj_check).formula('MAX('+obj_column+(dataIndexStart)+':'+obj_column+(dataIndexEnd-3)+')');
		firstSheet.cell(dataIndexEnd,obj_check).formula('AVERAGE('+obj_column+(dataIndexStart)+':'+obj_column+(dataIndexEnd-3)+')').style({border:{bottom:{style: 'thick'}}});
	}


	for(var obj_check=SubTotalIndexStart; obj_check<=SubTotalIndexEnd; obj_check++) {
		firstSheet.row(obj_check).setHeight(30);
	}

	SubTotalRow = ['Corrosion rate','Limit (MPY)','Actual MPY)','','Remarks']
	SubTotalColumn = ['MS','Brass','SS','LSI','TVC','SRB']

	firstSheet.cell(SubTotalIndexStart-1,1).string('Monthly Data').style({font:{size:10}});
	firstSheet.cell(SubTotalIndexStart,1,SubTotalIndexEnd,SubTotalRow.length).style(SubTotalStyle);

	SubTotalRow.forEach(function(value,index) {
		firstSheet.cell(SubTotalIndexStart,index+1).string(value);
	});

	SubTotalColumn.forEach(function(value,index) {
		firstSheet.cell(SubTotalIndexStart+index+1,1).string(value);
	});
}


function createSecondSheet(secondSheet,firstSheetHeader2) {
	SheetFormat(secondSheet, firstSheetHeader2);

	secondSheet.column(firstSheetHeader2.length+1).setWidth(20);
	secondSheet.column(firstSheetHeader2.length+2).setWidth(20);
	secondSheet.cell(header2IndexStart,firstSheetHeader2.length+1).string('Remarks').style(header3Style);
	secondSheet.cell(header2IndexStart,firstSheetHeader2.length+2).string('Observation and remarks on next day').style(header3Style);

	secondSheet.cell(dataIndexStart,1,dataIndexEnd,firstSheetHeader2.length).style(generalBorder);
}



function createSheet(siteMonthData) { // towerName,dateFrom
	var excelFile = new excel.Workbook();
	var generalInfoSite = siteMonthData[0];

	newData = {};
	console.log("enter for new sheet>>>");
	siteMonthData.forEach(function(oneRowValue, oneRowIndex) {
		newData[oneRowValue['timestamp']] = [];
		// var dataTower = oneRowValue['data'];
		var oneTower = oneRowValue['data'];
		// console.log(oneRowIndex);
		oneTower.forEach(function(val,index) {
			// console.log(">>>>>>>>>>>>>.");
			var keyList = []
			// console.log(val[key]);
			for (var keyTowerId in val){
				// console.log(keyTowerId);
				keyList.push(keyTowerId);
			}
			// console.log(keyList);
			var singleTowerID = keyList[0];
			if(singleTowerID) {
				var currentData = val[singleTowerID];
				if(currentData) {
					var check = {}
					check['name'] = currentData['gen']['name'];
					// check['date'] = dateFormat;
					var towerMakeCheck = currentData['gen']['type'].toLowerCase();
					if(towerMakeCheck.match('make')) {
						// ch[currentData['gen']['name']] =
						check['makeBoolean'] = true;
					}
					else {
						check['makeBoolean'] = false;
					}
					headerList = ['date'];

					for(var objHeader in currentData) {
						// if(objHeader !== "name") {
						if(objHeader !== "gen") {
							headerList.push(objHeader);
						}
					}
					check['header'] = headerList;
					// newData[currentData['gen']['name']] = check;
					newData[oneRowValue['timestamp']].push(check);
				}
			}
		});
	});
	var dataListRowWise = [];

	for(var dateObj in newData) {
		dataListRowWise.push(dateObj);
	}

	var listOfTowers = newData[dataListRowWise[0]];
	// console.log(listOfTowers);
	var boolUnwantedSheet = false;
	listOfTowers.forEach(function(singleTowerValue,singleTowerIndex) {
		var towerNameOfSheetObj;
		if(singleTowerValue['makeBoolean']) {
			boolUnwantedSheet = true;
			towerNameOfSheetObj = excelFile.addWorksheet(singleTowerValue['name'] + ' - make up',generalOptions);
			createSecondSheet(towerNameOfSheetObj,singleTowerValue['header']);
		}
		else {
			boolUnwantedSheet = true;
			towerNameOfSheetObj = excelFile.addWorksheet(singleTowerValue['name'] + ' - operational parameter',generalOptions);
			createFirstSheet(towerNameOfSheetObj,singleTowerValue['header']);
		}
		siteMonthData.forEach(function(rowWiseData, rowWiseDataIndex) {
			var dateFrom = rowWiseData['timestamp']*60;
			dateFromCurrent = tz(dateFrom*1000);
			dateFormat = dateFromCurrent.date() + "/" + (dateFromCurrent.month()+1) + "/" + dateFromCurrent.year();
			var cdf = rowWiseData['data'];
			cdf.forEach(function(val,index) {
				var keyList = [];
				for (var keyTowerId in val){
					// console.log(keyTowerId);
					keyList.push(keyTowerId);
				}
				// console.log(keyList[0]);
				var singleTowerID = keyList[0];
				if(singleTowerID) {
					var currentData = val[singleTowerID];
					if(currentData && (currentData['gen']['name'] === singleTowerValue['name'])) {
						// console.log(currentData);
						storeDataFunction(towerNameOfSheetObj, currentData, dateFormat,singleTowerValue['header'],rowWiseDataIndex);
					}
				}
			});
		})
	});
	console.log(generalInfoSite['site']);
	if(boolUnwantedSheet) {

		// // console.log(newData);
		var forthSheet = excelFile.addWorksheet('General comments, summary',generalOptions);
		// var thirdSheet = excelFile.addWorksheet(towerName + ' - cooling tower data',generalOptions);
		// createThirdSheet(thirdSheet);

		excelFile.write(generalInfoSite['site'] + '.xlsx', function (err, stats) {
		    if (err) {
		        console.error(err);
		    }
		    console.log(generalInfoSite['site'] + ".xlsx  # created");
		});

//		var mailOptions = {
//            from: '"Chembond Flux" <admin@chembondflux.com>', // sender address
//            to: email, // list of receivers
//           subject: '[Chembond Flux] Site Daily Report ✔', // Subject line
//            attachments: [{   // utf-8 string as an attachment
//                filename: generalInfoSite['site'] + '.xlsx',
//                path: generalInfoSite['site'] + '.xlsx'
//            }]
//        };
//        transporter.sendMail(mailOptions);
	}
}


function storeDataFunction(sheetId, data, dateFrom, headerList,oneRowIndex) {
	// console.log(data);

	dataIndexStartI = dataIndexStart + oneRowIndex;
	sheetId.cell(dataIndexStartI,1).string(dateFrom).style({border:{right:{style:'thick'}}});
	// sheetId.cell(dataIndexStartI,1).string(dateFrom);
	// console.log(data['name']);
	headerList.forEach(function(headerListValue, headerListIndex) {
		// console.log(data[headerListValue]);
		if(data[headerListValue] !== undefined) {
			var cur = data[headerListValue];
			if(cur.length > 1) {
				console.log(cur);

				var sum = 0;
				for(var objSum = 0; objSum<cur.length-1; objSum++) {
					sum += parseFloat(cur[objSum]);
				}
				var avg = sum/(cur.length-1);
				sheetId.cell(dataIndexStartI,headerListIndex+1).number(avg).style(generalBorder);
				sheetId.cell(header3IndexEnd,headerListIndex+1).string(cur[cur.length-1]["low"] + " - " + cur[cur.length-1]["high"]);
			}
		}
	});

}

function writeDbToExcel() {
	var currentMonthStart = new tz().startOf("month").unix();
	var currentMonthStartMin  = currentMonthStart/60;
	MongoClient.connect(url, function(err, db) {

		// if (err) throw err;
		db.listCollections().toArray(function(err, collInfos) {
			Promise.map(collInfos, function(tableName) {
//			collInfos.forEach(function(tableName) {
				var tableNameSite = tableName['name'];
				console.log(tableNameSite);
				db.collection(tableNameSite).find({"timestamp":{$gte:currentMonthStartMin}}).toArray(function(err, siteData) {
					// console.log(siteData);
					createSheet(siteData);
				});
			});
			db.close();
		});
    });
}


exports.updateDb = function(event) {
	console.log("first call enter>>>");
    writeDbToExcel();
};
