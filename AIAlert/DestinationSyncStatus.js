
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')
var intDebugLevel = 10

try {

  var strStatus = $('strStatus')
  var strBatchNo = $('strBatchNo')
  var strAlertTriggered = $('strAlertTriggered')

  strSQL = "UPDATE UrgentProcedureTracking.tblLISAlertBatches  \
  SET \
  Status = '" + strStatus + "', \
  DTAlertSent = NOW(), \
  blAlertSent = "+ strAlertTriggered +" \
  WHERE `AlertBatch` = (" + strBatchNo + ");"

  if (intDebugLevel > 4) {
  	  logger.debug(strSQL)
}


  dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
  result = dbConnMYSQL.executeUpdate(strSQL)

} catch (err) {
  logger.debug('ERROR- MYSQL:' + err.name + ' Error Details: ' + err + '. SQL: ' + strSQL)
} finally {
  if (dbConnMYSQL) {
    dbConnMYSQL.close()
  }
}