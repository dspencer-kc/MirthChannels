var intDebugLevel = 10
var intValidRPValueCutoff // If RP < this value, considered valid

for (var intRPLookupCounter = 0; intRPLookupCounter < getArrayOrXmlLength(msg['row']); intRPLookupCounter++) {

  var strTargetName = msg[intRPLookupCounter]['row']['Target_Name'].toString()
  var strRPSampleName = 'Sample Name Not Found'

  // Find RP Target
  if (strTargetName === 'RP') {

    // Confirm RP is valid
    // Get Sample Name
    strRPSampleName = msg[intRPLookupCounter]['row']['Sample_Name'].toString()
    var strRPCTValue = msg['row']['CT'].toString()  

    if (strRPCTValue === parseFloat(strRPCTValue)) {
      // RP is Number - confirm less than cutoff value
      if (strRPCTValue < intValidRPValueCutoff) {
        // RP is Valid
        // Loop through messages to find next sample name
        // Look for N1 CT Value
        for (var intN1LookupCounter = 0; intN1LookupCounter < getArrayOrXmlLength(msg['row']); intN1LookupCounter++) {
          var strN1SampleName = msg[intN1LookupCounter]['row']['Sample_Name'].toString()
          if (strRPSampleName === strN1SampleName) {
            var strN1TargetName = msg[intN1LookupCounter]['row']['Target_Name'].toString()
            if (strN1TargetName === 'N1') {
              var strN1CTValue = 'Value Not Assigned'
              strN1CTValue = msg[intN1LookupCounter]['row']['CT'].toString()
              if (strN1CTValue === 'Undetermined') {
                // Find N2 Value
                for (var intN2LookupCount = 0; intN2LookupCount < getArrayOrXmlLength(msg['row']); intN2LookupCount++) {
                  var strN2SampleName = msg[intN2LookupCount]['row']['Sample_Name'].toString()
                  if (strN2SampleName === strN1SampleName) {
                    if (strN1TargetName === 'N2') {
                      var strN2CTValue = 'Value Not Assigned'
                      strN2CTValue = msg[intN2LookupCount]['row']['CT'].toString()
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
