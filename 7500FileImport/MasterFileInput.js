const strMODE = 'DEV'

// 7500
const strInstrument = '7500'
// 7300
// const strInstrument = '7300'
// 7500 start at 9
const intLineStart = 9
// 7300 start at 27
// const intLineStart = 27
var strOutputPath = '/media/windowsshare/procedureinterface/7500/Result/Result_'
const strDevOutputPath = '/media/windowsshare/procedureinterface/7500/Dev/Result/Result_'

// Dev

if (strMODE === 'DEV') {
  strOutputPath = strDevOutputPath
} else {
  // Continue Logic to set all variables based off of mode.  Case Statement Issues in Mirth
}
// const strOutputPath = '/media/windowsshare/procedureinterface/7500/Dev/Result/Result_'
// 7300
// var strOutputPath = '/media/windowsshare/procedureinterface/7300/Result/Result_'

var intDebugLevel = 5 // 11 is all messages, 1 is critical only
var intValidRPValueCutoff = 40 // If RP < this value, considered valid
var strResultTextFile = ''
var strMAWDLISResult = ''
var blRPCheck = false // Do not set checks here, it is calculated
var blN2Check = false
var strSQL = ''
const blDBUpload = false
const blSendToLIS = false
const blSaveResultTextFile = true
const blSendToMAWDLIS = true
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')
const strMAWDLISMirthChannel = 'OB_MAWDLIS_CDC_Plate_Result'

var strRPWell = 'NA'
var strN1Well = 'NA'
var strN2Well = 'NA'

PrintToDebugLog(10, 'TestDebugLog')

// Verify N2 and RP in file
for (var intRPLookupCounter = intLineStart; intRPLookupCounter < getArrayOrXmlLength(msg['row']); intRPLookupCounter++) {
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
  // Find RP Target
  var strTargetNameForRPLookup = msg['row'][intRPLookupCounter]['TargetName'].toString()
  if (strTargetNameForRPLookup === 'RP') {
    blRPCheck = true
  } else {
    if (strTargetNameForRPLookup === 'N2') {
      blN2Check = true
    }
  }
}
// End Verification.

if (blN2Check && blRPCheck) {
  PrintToDebugLog(7, 'Running with N2 and RP')
  for (var intRPLookupCounter = intLineStart; intRPLookupCounter < getArrayOrXmlLength(msg['row']); intRPLookupCounter++) {

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
    strRPWell = ''
    strN1Well = ''
    strN2Well = ''

    // Find RP Target
    if (strTargetName === 'RP') {
      PrintToDebugLog(8, 'RP Located')
      // Confirm RP is valid
      // Get Sample Name
      strRPSampleName = msg['row'][intRPLookupCounter]['SampleName'].toString()
      strRPWell = msg['row'][intRPLookupCounter]['Well'].toString()
      PrintToDebugLog(7, 'Sample Name:' + strRPSampleName)
      var strRPCTValue = msg['row'][intRPLookupCounter]['CT'].toString()
      PrintToDebugLog(7, 'RPCTValue:' + strRPCTValue)

      // Get N1 Values
      var strN1SampleName = ''
      var strN1CTValue = ''
      var strN1TargetName = ''
      for (var intN1LookupCounter = 0; intN1LookupCounter < getArrayOrXmlLength(msg['row']); intN1LookupCounter++) {
        strN1SampleName = msg['row'][intN1LookupCounter]['SampleName'].toString()
        PrintToDebugLog(7, 'N1 Sample Name:' + strN1SampleName + ' RP Sampe Name:' + strRPSampleName)
        if (strRPSampleName === strN1SampleName) {
          PrintToDebugLog(7, 'N1 RP Sample Name Match')
          strN1TargetName = msg['row'][intN1LookupCounter]['TargetName'].toString()
          strN1Well = msg['row'][intN1LookupCounter]['Well'].toString()
          PrintToDebugLog(7, 'TargetName' + strN1TargetName)
          if (strN1TargetName === 'N1') {
            strN1CTValue = 'Value Not Assigned'
            strN1CTValue = msg['row'][intN1LookupCounter]['CT'].toString()
            PrintToDebugLog(7, 'N1 RP Match')
          }
        }
      }

      // Find N2 Values
      var strN2SampleName = ''
      var strN2TargetName = ''
      var strN2CTValue = ''
      for (var intN2LookupCount = 0; intN2LookupCount < getArrayOrXmlLength(msg['row']); intN2LookupCount++) {
        strN2SampleName = msg['row'][intN2LookupCount]['SampleName'].toString()
        if (strN2SampleName === strRPSampleName) {
          PrintToDebugLog(7, 'N2 and N1 Found')
          strN2TargetName = msg['row'][intN2LookupCount]['TargetName'].toString()
          if (strN2TargetName === 'N2') {
            PrintToDebugLog(7, 'N2 Record Found')
            strN2CTValue = 'Value Not Assigned'
            strN2CTValue = msg['row'][intN2LookupCount]['CT'].toString()
            strN2Well = msg['row'][intN2LookupCount]['Well'].toString()
          }
        }
      }

      if (strRPCTValue == parseFloat(strRPCTValue)) {
        // RP is Number - confirm less than cutoff value

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
              PrintToDebugLog(7, 'N1 RP Sample Name Match')
              var strN1TargetName = msg['row'][intN1LookupCounter]['TargetName'].toString()
              strN1Well = msg['row'][intN1LookupCounter]['Well'].toString()
              PrintToDebugLog(7, 'TargetName' + strN1TargetName)
              if (strN1TargetName === 'N1') {
                var strN1CTValue = 'Value Not Assigned'
                strN1CTValue = msg['row'][intN1LookupCounter]['CT'].toString()
                PrintToDebugLog(7, 'N1 RP Match')
                if (strN1CTValue === 'Undetermined') {
                  // Find N2 Value
                  PrintToDebugLog(7, 'N1 Value Undetermined, check N2 next')
                  for (var intN2LookupCount = 0; intN2LookupCount < getArrayOrXmlLength(msg['row']); intN2LookupCount++) {
                    var strN2SampleName = msg['row'][intN2LookupCount]['SampleName'].toString()
                    if (strN2SampleName === strN1SampleName) {
                      PrintToDebugLog(7, 'N2 and N1 Found')
                      var strN2TargetName = msg['row'][intN2LookupCount]['TargetName'].toString()
                      if (strN2TargetName === 'N2') {
                        PrintToDebugLog(7, 'N2 Record Found')
                        var strN2CTValue = 'Value Not Assigned'
                        strN2CTValue = msg['row'][intN2LookupCount]['CT'].toString()
                        strN2Well = msg['row'][intN2LookupCount]['Well'].toString()
                        if (strN2CTValue === 'Undetermined') {
                          // RP Valid, N1 Undetermined, N2 Undetermined
                          // Result is NOT DETECTED
                          PrintToDebugLog(7, 'N2 Found Undetermined')
                          PrintToDebugLog(5, 'NOT DETECTED ' + strRPSampleName + ' N1CTValue:' + strN1CTValue + ' N2CTValue:' + strN2CTValue, '')
                          var strProcResult = 'NOT DETECTED'
                          SendToInterfaceAndBuildTextFile(strRPSampleName, strProcResult, strN1CTValue, strN2CTValue, strRPCTValue, '', strRPWell, strN1Well, strN2Well)
                        } else {
                          // RP Valid, N1 Undetermined, N2 NOT Undetermined
                          // HOLD
                          SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, strN2CTValue, strRPCTValue, 'N1 and N2 CT Discrepancy', strRPWell, strN1Well, strN2Well)
                        }
                      }
                    }
                  }
                } else {
                  // RP Valid, CT Value is NOT Undetermined
                  // Next Confirm it is a number and less than cutoff
                  // potential detected

                  if (strN1CTValue == parseFloat(strN1CTValue)) {
                    // N1 CT is a number
                    if (parseFloat(strN1CTValue) < parseFloat(intValidRPValueCutoff)) {
                      // N1 CT DETECTED, validate N2 CT
                      // Loop to find N2 CT
                      PrintToDebugLog(5, 'N1 Value DETECTED, check N2 next')
                      for (var intN2LookupCount = 0; intN2LookupCount < getArrayOrXmlLength(msg['row']); intN2LookupCount++) {
                        var strN2SampleName = msg['row'][intN2LookupCount]['SampleName'].toString()

                        if (strN2SampleName === strN1SampleName) {
                          PrintToDebugLog(7, 'N2 and N1 Found')
                          var strN2TargetName = msg['row'][intN2LookupCount]['TargetName'].toString()
                          if (strN2TargetName === 'N2') {
                            PrintToDebugLog(7, 'N2 Record Found')
                            var strN2CTValue = 'Value Not Assigned'
                            strN2CTValue = msg['row'][intN2LookupCount]['CT'].toString()
                            var strN2Well = msg['row'][intN2LookupCount]['Well'].toString()
                            if (strN2CTValue === 'Undetermined') {
                              // RP Valid, N1 CT Detected, N2 CT Undetermined
                              SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, strN2CTValue, strRPCTValue, 'N1 and N2 CT Discrepancy', strRPWell, strN1Well, strN2Well)
                            } else {
                              // RP Valid, N1 UDETECTED, N2 NOT Undetermined
                              // COnfirm DETECTED
                              if (strN2CTValue == parseFloat(strN2CTValue)) {
                                // N2 CT is a number
                                if (parseFloat(strN2CTValue) < parseFloat(intValidRPValueCutoff)) {
                                  // DETECTED
                                  SendToInterfaceAndBuildTextFile(strRPSampleName, 'DETECTED', strN1CTValue, strN2CTValue, strRPCTValue, '', strRPWell, strN1Well, strN2Well)
                                } else {
                                  // HOLD HIGH N2 CT Value
                                  SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, strN2CTValue, strRPCTValue, 'N2 CT HIGH Value', strRPWell, strN1Well, strN2Well)
                                }
                              } else {
                                // HOLD N1CT Detected, N2CT Value not a valid number
                                SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, strN2CTValue, strRPCTValue, 'N1 and N2 CT Discrepancy', strRPWell, strN1Well, strN2Well)
                              }
                            }
                          }
                        }
                      }
                    } else {
                      // HOLD - HIGH N1 CT Value
                      SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, strN2CTValue, strRPCTValue, 'HIGH N1 CT Value', strRPWell, strN1Well, strN2Well)
                    }
                  } else {
                    // CT Value is not Undertermined AND is not a valid number
                    // Hold
                    SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, strN2CTValue, strRPCTValue, 'RP Valid, N1 CT NOT Undetermined, but is NOT a valid number', strRPWell, strN1Well, strN2Well)
                  }

                }
              }
            } else {
              PrintToDebugLog(7, 'N1 name did not match')
            }
          }
        } else {
          // RP CT is not less than 32
          // HOLD
          SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, strN2CTValue, strRPCTValue, 'Invalid RP, greater than RP Cutoff', strRPWell, strN1Well, strN2Well)
        }
      } else {
        // RP CT Value Not a Number
        // HOLD
        SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, strN2CTValue, strRPCTValue, 'Invalid RP, not a number', strRPWell, strN1Well, strN2Well)
      }
    }
  }
} else if (blN2Check === false && blRPCheck) {
  // Run with RP but no N2 {}
  PrintToDebugLog(7, 'Running with RP, no N2')
  for (var intRPLookupCounter = intLineStart; intRPLookupCounter < getArrayOrXmlLength(msg['row']); intRPLookupCounter++) {
    // Mirth Scaffolding
    strRPWell = ''
    strN1Well = ''
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
      strRPWell = msg['row'][intRPLookupCounter]['Well'].toString()
      PrintToDebugLog(7, 'Sample Name:' + strRPSampleName)
      var strRPCTValue = msg['row'][intRPLookupCounter]['CT'].toString()
      PrintToDebugLog(7, 'RPCTValue:' + strRPCTValue)

      // Get N1 Values
      var strN1SampleName = ''
      var strN1CTValue = ''
      var strN1TargetName = ''
      for (var intN1LookupCounter = 0; intN1LookupCounter < getArrayOrXmlLength(msg['row']); intN1LookupCounter++) {
        strN1SampleName = msg['row'][intN1LookupCounter]['SampleName'].toString()
        PrintToDebugLog(7, 'N1 Sample Name:' + strN1SampleName + ' RP Sampe Name:' + strRPSampleName)
        if (strRPSampleName === strN1SampleName) {
          PrintToDebugLog(7, 'N1 RP Sample Name Match')
          strN1TargetName = msg['row'][intN1LookupCounter]['TargetName'].toString()
          strN1Well = msg['row'][intN1LookupCounter]['Well'].toString()
          PrintToDebugLog(7, 'TargetName' + strN1TargetName)
          if (strN1TargetName === 'N1') {
            strN1CTValue = 'Value Not Assigned'
            strN1CTValue = msg['row'][intN1LookupCounter]['CT'].toString()
            PrintToDebugLog(7, 'N1 RP Match')
          }
        }
      }
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
                strN1Well = msg['row'][intN1LookupCounter]['Well'].toString()
                PrintToDebugLog(5, 'N1 RP Match')
                if (strN1CTValue === 'Undetermined') {
                  PrintToDebugLog(5, 'N1 Value Undetermined')
                  // Result is NOT DETECTED
                  PrintToDebugLog(7, 'NOT DETECTED ' + strRPSampleName + ' N1CTValue:' + strN1CTValue + ' N2CTValue: NA')
                  var strProcResult = 'NOT DETECTED'
                  var strCSV = "'20-" + strRPSampleName + "','" + strProcResult + "'"
                  SendToInterfaceAndBuildTextFile(strRPSampleName, strProcResult, strN1CTValue, 'NA', strRPCTValue, 'N2 not present', strN1Well, strN1Well, strN2Well)
                } else {
                  // N1 not Undetermined, potential detected
                  if (strN1CTValue == parseFloat(strN1CTValue)) {
                    // N1 CT is a number
                    if (parseFloat(strN1CTValue) < parseFloat(intValidRPValueCutoff)) {
                    // N1 CT DETECTED - not checking N2, result DETECTED
                      SendToInterfaceAndBuildTextFile(strRPSampleName, 'DETECTED', strN1CTValue, 'NA', strRPCTValue, 'N2 not present', strN1Well, strN1Well, strN2Well)
                    } else {
                    // HOLD - HIGH N1 CT Value
                      SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, 'NA', strRPCTValue, 'HIGH N1 CT Value', strN1Well, strN1Well, strN2Well)
                    }
                  } else {
                    // CT Value is not Undertermined AND is not a valid number
                    // Hold
                    SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, 'NA', strRPCTValue, 'N1 CT NOT Undetermined, but is NOT a valid number', strN1Well, strN1Well, strN2Well)
                  }
                }
              }
            } else {
              PrintToDebugLog(7, 'N1 name did not match')
            }
          }
        } else {
          // RP CT is not less than 32
          // HOLD
          SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, 'NA', strRPCTValue, 'RP greater than RP Cutoff, N2 Not Verified', strRPWell, strN1Well, strN2Well)
        }
      } else {
        // RP CT Value Not a Number
        // HOLD
        SendToInterfaceAndBuildTextFile(strRPSampleName, 'HOLD', strN1CTValue, 'NA', strRPCTValue, 'RP not a number, N2 not verified', strRPWell, strN1Well, strN2Well)
      }
    }
  }
} else if (blN2Check === false && blRPCheck === false) {
  PrintToDebugLog(7, 'Running with N1 only, no N2 and no RP')
  // N1 Only no N2 no RP
  for (var intRowCounter = 9; intRowCounter < getArrayOrXmlLength(msg['row']); intRowCounter++) {

    // Mirth Scaffolding  
    if (typeof(msg) == 'xml') {
      if (typeof(msg['row'][intRowCounter]) == 'undefined') {
        createSegment('row', msg, intRowCounter)
      }
    } else {
      if (typeof(msg) == 'undefined') {
        msg = {}
      }
      if (typeof(msg['row']) == 'undefined') {
        msg['row'] = []
      }
      if (typeof(msg['row'][intRowCounter]) == 'undefined') {
        msg['row'][intRowCounter] = {}
      }
    }
    PrintToDebugLog(9, 'RPLookup Counter: ' + intRowCounter)
    var strTargetName = msg['row'][intRowCounter]['TargetName'].toString()
    PrintToDebugLog(9, 'Target Name: ' + strTargetName)
    var strRPSampleName = 'RP: NA'
    var strN1SampleName = msg['row'][intRowCounter]['SampleName'].toString()
    var strN1TargetName = msg['row'][intRowCounter]['TargetName'].toString()
    strN1Well = ''
    if (strN1TargetName === 'N1') {
      var strN1CTValue = 'Value Not Assigned'
      strN1CTValue = msg['row'][intRowCounter]['CT'].toString()
      strN1Well = msg['row'][intRowCounter]['Well'].toString()
      PrintToDebugLog(5, 'N1 RP Match')
      if (strN1CTValue === 'Undetermined') {
        PrintToDebugLog(5, 'N1 Value Undetermined')
        // Result is NOT DETECTED
        PrintToDebugLog(2, 'NOT DETECTED ' + strN1SampleName + ' N1CTValue:' + strN1CTValue + ' N2CTValue: NA')
        var strProcResult = 'NOT DETECTED'
        var strCSV = "'20-" + strN1SampleName + "','" + strProcResult + "'"
        // Send Message
        SendToInterfaceAndBuildTextFile(strN1SampleName, 'NOT DETECTED', strN1CTValue, 'NA', 'NA', 'RP not present, N2 not present', strRPWell, strN1Well, strN2Well)
      } else {
        // N1 not Undetermined, potential detected
        if (strN1CTValue == parseFloat(strN1CTValue)) {
          // N1 CT is a number
          if (parseFloat(strN1CTValue) < parseFloat(intValidRPValueCutoff)) {
          // N1 CT DETECTED - not checking N2, result DETECTED
            SendToInterfaceAndBuildTextFile(strN1SampleName, 'DETECTED', strN1CTValue, 'NA', 'NA', 'RP not present, N2 not present', strRPWell, strN1Well, strN2Well)
          } else {
          // HOLD - HIGH N1 CT Value
            SendToInterfaceAndBuildTextFile(strN1SampleName, 'HOLD', strN1CTValue, 'NA', 'NA', 'HIGH N1 CT Value, RP not present, N2 not present', strRPWell, strN1Well, strN2Well)
          }
        } else {
          // CT Value is not Undertermined AND is not a valid number
          // Hold
          SendToInterfaceAndBuildTextFile(strN1SampleName, 'HOLD', strN1CTValue, 'NA', 'NA', 'N1 CT NOT Undetermined, but is NOT a valid number, RP not present, N2 not present', strRPWell, strN1Well, strN2Well)
        }
      }
    }
  }
}

if (blSaveResultTextFile) {
  var strFileName = strOutputPath + Date.now() + sourceMap.get('originalFilename')
  FileUtil.write(strFileName, true, strResultTextFile)
}

if (blSendToMAWDLIS) {
  router.routeMessage(strMAWDLISMirthChannel, strMAWDLISResult)
}

// return(strResultTextFile)
function PrintToDebugLog (intHowImportant, strDebugMsg) {
  if (intDebugLevel > intHowImportant) {
    logger.debug(intHowImportant + ' ' + strDebugMsg)
  }
}

function SendToInterfaceAndBuildTextFile (strLocalSampleName, strLocalProcResult, strLocalN1CTValue, strLocalN2CTValue, strLocalRPCTValue, strLocalComment, strLocalRPWell, strLocalN1Well, strLocalN2Well) {
  // Exclude Emtpy Sample Name
  if (strLocalSampleName !== '') {
    // Add 20- to front of sample name
    // ***REMINDER TO ADJUST HERE FOR CURRENT YEAR and add logic if 20- is already there***
    var blSentToLIS = 0
    var strCSV = "'20-" + strLocalSampleName + "','" + strLocalProcResult + "'"

    if (blSendToLIS && strLocalProcResult === 'NOT DETECTED') {
      router.routeMessage('Production_CopathProc_Result', strCSV)
      blSentToLIS = 1
    }

    if (blSaveResultTextFile) {
      strResultTextFile = strResultTextFile + strLocalSampleName + ': ' + strLocalProcResult + '-' + strLocalComment + ' \r\n'
    }

    if (blSendToMAWDLIS) {
      // RPTN20-Z4998.CV,NOT DETECTED,200728_nCoVptntRun_17_D_CW_data.txt,7500
      strMAWDLISResult = strMAWDLISResult + strLocalSampleName + ',' + strLocalProcResult + ',' + $('originalFilename') + ',' + strInstrument + ' \r\n'
    }

    // Insert to DB
    if (blDBUpload) {
      try {
        // DBConnection
        dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
        var strSampleNameForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalSampleName)
        var strResultValueForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalProcResult)
        var strN1CTForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalN1CTValue)
        var strN2CTForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalN2CTValue)
        var strRPCTForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalRPCTValue)
        var strFileNameForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('originalFilename'))
        var strCommentForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalComment)
        var strN1WellForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalN1Well)
        var strN2WellForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalN2Well)
        var strRPWellForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalRPWell)

        strSQL = "INSERT INTO UrgentProcedureTracking.tblCDCResults \
          (SampleName, \
          N1CTValue, \
          N2CTValue, \
          FileName,\
          RPCTValue,\
          ResultValue,\
          Instrument,\
          N1Well,\
          N2Well,\
          RPWell,\
          Comment,\
          SentToLIS)\
          VALUES\
          (" + strSampleNameForDB + ",\
          " + strN1CTForDB + ",\
          " + strN2CTForDB + ",\
          " + strFileNameForDB + ",\
          " + strRPCTForDB + ",\
          " + strResultValueForDB + ",\
          '" + strInstrument + "',\
          " + strN1WellForDB + ",\
          " + strN2WellForDB + ",\
          " + strRPWellForDB + ",\
          " + strCommentForDB + ",\
          " + blSentToLIS + ");"

        result = dbConnMYSQL.executeUpdate(strSQL)
      } catch (err) {
        logger.debug('ERROR- MYSQL:' + err.name + ' Error Details: ' + err + '. SQL: ' + strSQL)
      } finally {
        if (dbConnMYSQL) {
          dbConnMYSQL.close()
        }
      }
    }

    PrintToDebugLog(5, strSQL)
  }
}
function SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString (txt) {
  if (txt == null) {
    return ""
  } else {
    return "'" + EscapeApostrophe(txt) + "'"
  }
}
function EscapeApostrophe (txt)  {
  return (txt + "").replace(/\'/g, "''")
}
