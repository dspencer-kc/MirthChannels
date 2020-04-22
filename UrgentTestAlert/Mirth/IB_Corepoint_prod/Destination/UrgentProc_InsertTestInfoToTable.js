
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')



try {

  var strCaseNo = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('strCaseNo'))
  var strPortalID = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('strPortalID'))
  var strTestName = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('strTestName')) 
  var strTestResult = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('strTestResult'))
  var strClientName = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('strClientName'))
  var strPatientState = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('strPatientState'))
  var strSignoutDT = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('strSignoutDT'))


  strSQL = "INSERT INTO UrgentProcedureTracking.tblTestResult \
    (CaseNo, \
    PortalID, \
    Test, \
    TestResult, \
    PatientStateOfResidence, \
    DTSignedOut, \
    ClientName) \
    VALUES \
    (" + strCaseNo + ", \
    " + strPortalID + ", \
    " + strTestName + ", \
    " + strTestResult + ", \
    " + strPatientState + ", \
    " + strSignoutDT + ", \
    " + strClientName + ") \
    ON DUPLICATE KEY UPDATE \
    PortalID = " + strPortalID + ", \
    Test = " + strTestName + ", \
    TestResult = " + strTestResult + ", \
    ClientName = " + strClientName + ", \
    PatientStateOfResidence " + strPatientState + ", \
    DTSignedOut " + strSignoutDT + ", \
    AlertBatch = null, \
    DTInserted = now();"

  dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
  result = dbConnMYSQL.executeUpdate(strSQL)

} catch (err) {
  logger.debug('ERROR- MYSQL:' + err.name + ' Error Details: ' + err + '. SQL: ' + strSQL)
} finally {
  if (dbConnMYSQL) {
    dbConnMYSQL.close()
  }
}

function SanitizeVariableAddLeadingAndTrailingApostrophies (txt) {
  if (txt == null) {
      return "null"
  } else {
      return "'" + EscapeApostrophe(txt) + "'"
  }
}
function EscapeApostrophe(txt)  {
  return (txt + "").replace(/\'/g, "''")
}
function SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString (txt) {
  if (txt == null) {
      return ""
  } else {
      return "'" + EscapeApostrophe(txt) + "'"
  }
}
function SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString (txt) {
  if (txt == null) {
      return ""
  } else {
      return EscapeApostrophe(txt)
  }
}
