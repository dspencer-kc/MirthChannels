var intDebugLevel = 5 // 11 is all messages, 1 is critical only
var intValidRPValueCutoff = 32 // If RP < this value, considered valid
var strResultTextFile = ''

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
  var strRPSampleName = 'Sample Name Not Found'

  // Find RP Target
  if (strTargetName === 'RP') {
    PrintToDebugLog(8, 'RP Located')
    // Confirm RP is valid
    // Get Sample Name
    strRPSampleName = msg['row'][intRPLookupCounter]['SampleName'].toString()

    PrintToDebugLog(7, 'Sample Name:' + strRPSampleName)
    var strRPCTValue = msg['row'][intRPLookupCounter]['CT'].toString()
    PrintToDebugLog(7, 'RPCTValue:' + strRPCTValue)

    if (strRPCTValue == parseFloat(strRPCTValue)) {
      // RP is Number - confirm less than cutoff value
      PrintToDebugLog(10, 'RP Is a Number')

      if (parseFloat(strRPCTValue) < parseFloat(intValidRPValueCutoff)) {
        // RP is Valid
        // Loop through messages to find next sample name
        // Look for N1 CT Value

        PrintToDebugLog(7, 'RP <' + intValidRPValueCutoff)
        PrintToDebugLog(7, 'RP Sample Name' + strRPSampleName)
        for (var intN1LookupCounter = 0; intN1LookupCounter < getArrayOrXmlLength(msg['row']); intN1LookupCounter++) {
          var strN1SampleName = msg['row'][intN1LookupCounter]['SampleName'].toString()
          PrintToDebugLog(7, 'N1 Sample Name:' + strN1SampleName + ' RP Sampe Name:' + strRPSampleName)
          if (strRPSampleName === strN1SampleName) {

            PrintToDebugLog(6, 'N1 RP Sample Name Match')
            var strN1TargetName = msg['row'][intN1LookupCounter]['TargetName'].toString()
            PrintToDebugLog(6, 'TargetName' + strN1TargetName)
            if (strN1TargetName === 'N1') {
              var strN1CTValue = 'Value Not Assigned'
              strN1CTValue = msg['row'][intN1LookupCounter]['CT'].toString()

              PrintToDebugLog(5, 'N1 RP Match')

              if (strN1CTValue === 'Undetermined') {
                // Find N2 Value
                PrintToDebugLog(5, 'N1 Value Undetermined, check N2 next')

                for (var intN2LookupCount = 0; intN2LookupCount < getArrayOrXmlLength(msg['row']); intN2LookupCount++) {
                  var strN2SampleName = msg['row'][intN2LookupCount]['SampleName'].toString()
                  if (strN2SampleName === strN1SampleName) {
                    PrintToDebugLog(4, 'N2 and N1 Found')
                    var strN2TargetName = msg['row'][intN2LookupCount]['TargetName'].toString()
                    if (strN2TargetName === 'N2') {
                      PrintToDebugLog(3, 'N2 Record Found')
                      var strN2CTValue = 'Value Not Assigned'
                      strN2CTValue = msg['row'][intN2LookupCount]['CT'].toString()
                      if (strN2CTValue === 'Undetermined') {
                        // RP Valid, N1 Undetermined, N2 Undetermined
                        // Result is NOT DETECTED
                        PrintToDebugLog(3, 'N2 Found Undetermined')
                        PrintToDebugLog(2, 'NOT DETECTED ' + strRPSampleName + ' N1CTValue:' + strN1CTValue + ' N2CTValue:' + strN2CTValue)
                        var strProcResult = 'NOT DETECTED'

                        SendToInterfaceAndBuildTextFile(strRPSampleName, strProcResult)
                      } else {
                        // RP Valid, N1 Undetermined, N2 NOT Undetermined
                        // HOLD
                      }
                    }
                  }
                }
              } else {
                // RP Valid, CT Value is NOT Undetermined
                // Next Confirm it is a number and less than cutoff
                // potential deteted
              }
            }
          } else {
            PrintToDebugLog(7, 'N1 name did not match')
          }
        }
      } else {
        // RP CT is not less than 32
        // HOLD
      }
    } else {
      // RP CT Value Not a Number
      // HOLD
    }
  }
}
var strFileName = '/media/windowsshare/procedureinterface/7500/Result/Result_' + Date.now() + sourceMap.get('originalFilename')
FileUtil.write(strFileName, true, strResultTextFile)
// return(strResultTextFile)
function PrintToDebugLog (intHowImportant, strDebugMsg) {
  if (intDebugLevel > intHowImportant) {
    logger.debug(intHowImportant + ' ' + strDebugMsg)
  }
}

function SendToInterfaceAndBuildTextFile(strLocalSampleName, strLocalProcResult) {

  // Add 20- to front of sample name
  // ***REMINDER TO ADJUST HERE FOR CURRENT YEAR and add logic if 20- is already there***
  var strCSV = "'20-" + strLocalSampleName + "','" + strLocalProcResult + "'"

  // Send Message
  // DEV: router.routeMessage('Dev_CopathProc_Result', strCSV)
  router.routeMessage('Production_CopathProc_Result', strCSV)
  strResultTextFile = strResultTextFile + strLocalSampleName + ': ' + strLocalProcResult + ' \r\n'
}