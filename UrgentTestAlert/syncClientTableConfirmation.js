
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')
var dbConnMYSQL
var strSQL = ''
var result

try {
  //  MYSQL
  dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
  strSQL = " \
    INSERT INTO UrgentProcedureTracking.tblClientUpdateStatus \
    (Status, \
    StatusDateTime) \
    VALUES \
    ('Updated', \
    NOW());"

  result = dbConnMYSQL.executeUpdate(strSQL)
} catch (err) {
  logger.debug("Error Name:" + err.name + " Error Details: " + err + ". SQL:" + strSQL)
} finally {
  if (dbConnMYSQL) {
    dbConnMYSQL.close()
  }
}
