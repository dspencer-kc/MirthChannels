for (var i = 0; i < getArrayOrXmlLength(msg['row']); i++) {

  if (typeof(msg) == 'xml') {
      if (typeof(msg['row'][i]) == 'undefined') {
          createSegment('row', msg, i);
      }
  } else {
      if (typeof(msg) == 'undefined') {
          msg = {};
      }
      if (typeof(msg['row']) == 'undefined') {
          msg['row'] = [];
      }
      if (typeof(msg['row'][i]) == 'undefined') {
          msg['row'][i] = {};
      }
  }

  var strTargetName = msg['row'][i]['TargetName'].toString()
  var strSampleName = msg['row'][i]['SampleName'].toString()
  var strCTValue = msg['row'][i]['CT'].toString()
  
  logger.debug(i + ' TargetName: ' + strTargetName + ' Sample Name: ' + strSampleName + ' CT Value' + strCTValue)

}