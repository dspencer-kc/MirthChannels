var intDebugLevel = 10
var intValidRPValueCutoff // If RP < this value, considered valid

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

  if (intDebugLevel > 9) {
    var strDebugMsg = intRPLookupCounter
    logger.debug(strDebugMsg)
  } 

  var strTargetName = msg['row'][intRPLookupCounter]['TargetName'].toString()

  if (intDebugLevel > 9) {
    var strDebugMsg = 'Target Name: ' + strTargetName
    logger.debug(strDebugMsg)
  } 

  var strRPSampleName = 'Sample Name Not Found'

  // Find RP Target
  if (strTargetName === 'RP') {
    if (intDebugLevel > 8) {
      var strDebugMsg = 'RP Detected'
      logger.debug(strDebugMsg)
    } 

    // Confirm RP is valid
    // Get Sample Name
    strRPSampleName = msg['row'][intRPLookupCounter]['SampleName'].toString()

    if (intDebugLevel > 7) {
      var strDebugMsg = 'Sample Name:' + strRPSampleName
      logger.debug(strDebugMsg)
    } 
    var strRPCTValue = msg['row'][intRPLookupCounter]['CT'].toString()

    if (intDebugLevel > 7) {
      var strDebugMsg = 'RPCTValue:' + strRPCTValue
      logger.debug(strDebugMsg)
    } 

    if (strRPCTValue == parseFloat(strRPCTValue)) {
      // RP is Number - confirm less than cutoff value
      if (strRPCTValue < intValidRPValueCutoff) {
        // RP is Valid
        // Loop through messages to find next sample name
        // Look for N1 CT Value
        for (var intN1LookupCounter = 0; intN1LookupCounter < getArrayOrXmlLength(msg['row'][intRPLookupCounter]); intN1LookupCounter++) {
          var strN1SampleName = msg['row'][intRPLookupCounter]['SampleName'].toString()
          if (strRPSampleName === strN1SampleName) {
            var strN1TargetName = msg['row'][intRPLookupCounter]['TargetName'].toString()
            if (strN1TargetName === 'N1') {
              var strN1CTValue = 'Value Not Assigned'
              strN1CTValue = msg['row'][intRPLookupCounter]['CT'].toString()
              if (strN1CTValue === 'Undetermined') {
                // Find N2 Value
                for (var intN2LookupCount = 0; intN2LookupCount < getArrayOrXmlLength(msg['row']); intN2LookupCount++) {
                  var strN2SampleName = msg['row'][intN2LookupCount]['SampleName'].toString()
                  if (strN2SampleName === strN1SampleName) {
                    if (strN1TargetName === 'N2') {
                      var strN2CTValue = 'Value Not Assigned'
                      strN2CTValue = msg['row'][intN2LookupCount]['CT'].toString()
                      if (strN2CTValue === 'Undetermined') {
                        // Result is NOT DETECTED
                        if (intDebugLevel > 5) {
                          var strDebugMsg = strRPSampleName + ' NOT DETECTED'
                          logger.debug(strDebugMsg)
                        }
                      }
                    }
                  }
                }
              }
            }
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
