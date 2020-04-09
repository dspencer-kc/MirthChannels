
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')



try {

  var strCaseNo = $('strCaseNo')
  var strPortalID = $('strPortalID')
  var strTestName = $('strTestName')
  var strTestResult = $('strTestResult')
  var strClientName = $('strClientName')


  strSQL = "INSERT INTO UrgentProcedureTracking.tblTestResult \
    (CaseNo, \
    PortalID, \
    Test, \
    TestResult, \
    ClientName) \
    VALUES \
    ('" + strCaseNo + "', \
    '" + strPortalID + "', \
    '" + strTestName + "', \
    '" + strTestResult + "', \
    '" + strClientName + "') \
    ON DUPLICATE KEY UPDATE \
    PortalID = '" + strPortalID + "', \
    Test = '" + strTestName + "', \
    TestResult = '" + strTestResult + "', \
    ClientName = '" + strClientName + "', \
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