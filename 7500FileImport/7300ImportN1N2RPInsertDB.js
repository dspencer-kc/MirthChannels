var intDebugLevel = 5 // 11 is all messages, 1 is critical only
const intValidRPValueCutoff = 34 // If RP < this value, considered valid
var strResult = ''
var intLineStart = 27
var strOutputPath = '/media/windowsshare/procedureinterface/7300/Result/Result_'
var strSQL = ''
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')
const strInstrument = '7300'

PrintToDebugLog(10, 'TestDebugLog')

try {
  // DBConnection
  dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)

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
                          // Result is NOT DETECTED
                          PrintToDebugLog(3, 'N2 Found Undetermined')
                          PrintToDebugLog(2, 'NOT DETECTED ' + strRPSampleName + ' N1CTValue:' + strN1CTValue + ' N2CTValue:' + strN2CTValue)

                          /* strHL7Message = "\
  MSH|^~\&|COPATHPLUS|MAWD|COPATHPLUS|99999|20110812155410||ORU^R01|16600002339256|P|2.3\r\n\
  PID|1||30484186^^^99999||Test^Test^^^Ms.||19000101|F||||||9999999991\r\n\
  ORC|RE|2170580279|MP20-1$1$201108121640$2019||CM\r\n\
  OBR|1|2170580279|MP20-1$1$201108121640$2019|2019^SARS-CoV-2 (COVID-19)||||||||||||||||||20110812155358||SP|F||||||||UXD^Cerner^User\r\n\
  OBX|1|TX|PIN||HeyMaLookIMadeIt.||||||F\r\n\
  OBX|2|TX|PRC|This is the procedure comment line one||||||F\r\n" */
                        var strProcResult = 'NOT DETECTED'
                        

                        //JSON
                        //var strJSON = '{"SampleName":"' + strRPSampleName + '","Result":"' + strResult + '"}'
                        // var strJSON = '"SampleName":"' + strRPSampleName + '","Result":"' + strResult + '"'
  // var strJSON = '{“header”: {“sample_name”: “' + strRPSampleName + '”,“result”: “' + strResult + '”}}'
  // var strJSON = '{"samplename":"' + strRPSampleName + '","result":"' + strResult + '"}'
  //var strCSV = "'samplename','result'\r\n'" + strRPSampleName + "','" + strResult + "'"
  var strCSV = "'20-" + strRPSampleName + "','" + strProcResult + "'"

                          //Send Message
                          
                          // DEV: router.routeMessage('Dev_CopathProc_Result', strCSV)
                          router.routeMessage('Production_CopathProc_Result', strCSV)
                          
                          // Insert to DB
                          var strSampleNameForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strRPSampleName)
                          var strResultValueForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strProcResult)
                          var strN1CTForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strN1CTValue)
                          var strN2CTForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strN2CTValue)
                          var strRPCTForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strRPCTValue)
                          var strFileNameForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('originalFilename'))

                          strSQL = "INSERT INTO UrgentProcedureTracking.tblCDCResults \
                          (SampleName, \
                          N1CTValue, \
                          N2CTValue, \
                          FileName,\
                          RPCTValue,\
                          ResultValue,\
                          Instrument)\
                          VALUES\
                          (" + strSampleNameForDB + ",\
                          " + strN1CTForDB + ",\
                          " + strN2CTForDB + ",\
                          " + strFileNameForDB + ",\
                          " + strRPCTForDB + ",\
                          " + strResultValueForDB + ",\
                          " + strInstrument + ");"
                      
                          result = dbConnMYSQL.executeUpdate(strSQL)
                          PrintToDebugLog(5, strSQL)


                          strResult = strResult + strRPSampleName + ': NOT DETECTED \r\n'
                          
                          if (intDebugLevel > 5) {
                            var strDebugMsg = strRPSampleName + ' NOT DETECTED'
                            
                            logger.debug(strDebugMsg)

                            // Save to Message
                            // tmp['OBX'][0]['OBX.5']['OBX.5.1']
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              PrintToDebugLog(7, 'N1 name did not match')
            }
          }
        } else {
          // RP CT is not less than 32
        }
      } else {
        // RP CT Value Not a Number
      }
    }
  }
  var strFileName = strOutputPath + Date.now() + sourceMap.get('originalFilename')
  FileUtil.write(strFileName, true, strResult);
} catch (err) {
  logger.debug('ERROR- MYSQL:' + err.name + ' Error Details: ' + err + '. SQL: ' + strSQL)
} finally {
  if (dbConnMYSQL) {
    dbConnMYSQL.close()
  }
}
// return(strResult)
function PrintToDebugLog (intHowImportant, strDebugMsg) {
  if (intDebugLevel > intHowImportant) {
    logger.debug(intHowImportant + ' ' + strDebugMsg)
  }
}
function SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString (txt) {
  if (txt == null) {
      return ""
  } else {
      return "'" + EscapeApostrophe(txt) + "'"
  }
}
function EscapeApostrophe(txt)  {
  return (txt + "").replace(/\'/g, "''")
}