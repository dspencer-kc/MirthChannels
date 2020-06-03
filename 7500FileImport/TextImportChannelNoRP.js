var intDebugLevel = 5 // 11 is all messages, 1 is critical only
var intValidRPValueCutoff = 34 // If RP < this value, considered valid
var strResult = ''

PrintToDebugLog(10, 'TestDebugLog')

for (var intRPLookupCounter = 9; intRPLookupCounter < getArrayOrXmlLength(msg['row']); intRPLookupCounter++) {

  // Mirth Scaffolding

  if (typeof(msg) == 'xml') {
    if (typeof(msg['row'][intRPLookupCounter]) == 'undefined') {
      createSegment('row', msg, intRPLookupCounter)
    }
  } else {
    if (typeof(msg) == 'undefined') {
      msg = {}
    }
    if (typeof(msg['row']) == 'undefined') {
      msg['row'] = []
    }
    if (typeof(msg['row'][intRPLookupCounter]) == 'undefined') {
      msg['row'][intRPLookupCounter] = {}
    }
  }

  PrintToDebugLog(9, 'RPLookup Counter: ' + intRPLookupCounter)
  var strTargetName = msg['row'][intRPLookupCounter]['TargetName'].toString()
  PrintToDebugLog(9, 'Target Name: ' + strTargetName)
  var strRPSampleName = 'RP: NA'

  for (var intN1LookupCounter = 0; intN1LookupCounter < getArrayOrXmlLength(msg['row']); intN1LookupCounter++) {
    var strN1SampleName = msg['row'][intN1LookupCounter]['SampleName'].toString()
    var strN1TargetName = msg['row'][intN1LookupCounter]['TargetName'].toString()
    if (strN1TargetName === 'N1') {
      var strN1CTValue = 'Value Not Assigned'
      strN1CTValue = msg['row'][intN1LookupCounter]['CT'].toString()
      PrintToDebugLog(5, 'N1 RP Match')
      if (strN1CTValue === 'Undetermined') {
        PrintToDebugLog(5, 'N1 Value Undetermined')
        // Result is NOT DETECTED
        PrintToDebugLog(2, 'NOT DETECTED ' + strN1SampleName + ' N1CTValue:' + strN1CTValue + ' N2CTValue: NA')
        var strProcResult = 'NOT DETECTED'
        var strCSV = "'20-" + strN1SampleName + "','" + strProcResult + "'"
        // Send Message
        // DEV: router.routeMessage('Dev_CopathProc_Result', strCSV)
        router.routeMessage('Production_CopathProc_Result', strCSV)                        
        strResult = strResult + strRPSampleName + ': NOT DETECTED \r\n'
      }
    }
  }
}
var strFileName = '/media/windowsshare/procedureinterface/7500/Result/Result_' + Date.now() + sourceMap.get('originalFilename')
FileUtil.write(strFileName, true, strResult);
// return(strResult)
function PrintToDebugLog (intHowImportant, strDebugMsg) {
  if (intDebugLevel > intHowImportant) {
    logger.debug(intHowImportant + ' ' + strDebugMsg)
  }
}