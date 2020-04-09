const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')



try {

  var strStatus = $('strStatus')
  var strBatchNo = $('strBatchNo')
  var strMessagesSynced = $('strMessagesSynced')

  strSQL = "UPDATE UrgentProcedureTracking.tblAlertBatches \
  SET \
  Status = '" + strStatus + "', \
  DTAlertSent = NOW(), \
  blAlertSent = 1, \
  Details = '"+ strMessagesSynced +" Messages sent' \
  WHERE `AlertBatch` = " + strBatchNo + ";"


  dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
  result = dbConnMYSQL.executeUpdate(strSQL)

} catch (err) {
  logger.debug('ERROR- MYSQL:' + err.name + ' Error Details: ' + err + '. SQL: ' + strSQL)
} finally {
  if (dbConnMYSQL) {
    dbConnMYSQL.close()
  }
}