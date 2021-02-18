var intDebugLevel = 11
var intLineStart = 1

var match = /bar/.exec('\[RESULTS\]')
if (match) {
  logger.debug("match found at " + match.index)
}

for (var intLineStartLookupCounter = intLineStart; intLineStartLookupCounter < getArrayOrXmlLength(msg['row']); intRPLookupCounter++) {
  if (typeof(msg) == 'xml') {
    if (typeof(msg['row'][intLineStartLookupCounter]) == 'undefined') {
      createSegment('row', msg, intLineStartLookupCounter)
    }
  } else {
    if (typeof(msg) == 'undefined') {
      msg = {}
    }
    if (typeof(msg['row']) == 'undefined') {
      msg['row'] = []
    }
    if (typeof(msg['row'][intLineStartLookupCounter]) == 'undefined') {
      msg['row'][intRPLookupCounter] = {}
    }
  }
  // Find RP Target
  var strResultStartFound = msg['row'][intLineStartLookupCounter]['Well'].toString()
  if (strResultStartFound === '[Results]') {
    PrintToDebugLog(1, 'Found Results')
    PrintToDebugLog(1, intLineStartLookupCounter.toString())
    intLineStart = intLineStartLookupCounter
    intLineStartLookupCounter = getArrayOrXmlLength(msg['row'])
  }
}
// End Start Check.

PrintToDebugLog(3, 'Completed Processing ' + connectorMessage.getMessageId())

// return(strResultTextFile)
function PrintToDebugLog (intHowImportant, strDebugMsg) {
  if (intDebugLevel > intHowImportant) {
    logger.debug(intHowImportant + ' ' + strDebugMsg)
  }
}
