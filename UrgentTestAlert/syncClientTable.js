
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')
const strSybaseUserName = configurationMap.get('SybaseUserName')
const strSybasePassword = configurationMap.get('SybasePassword')
const strSybaseJDBCConnection = configurationMap.get('SybaseJDBCConnection')
const strSybaseJDBCDriver = configurationMap.get('SybaseJDBCDriver')
var strLastUpdate
var dbConnMYSQL
var dbConnCoPath
var objCopathResult
var objMYSQLResult2
var result

try {
  //  MYSQL
  var strSQL = " /* Mysql get latest update time*/ \
    select last_updated from tblClientAddress group by last_updated order by last_updated desc limit 1;"

  dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
  result = dbConnMYSQL.executeCachedQuery(strSQL)
  result.next()
  strLastUpdate = result.getString("last_updated")

  //  CoPath
  strSQL = "/*CoPath get all updates sense last updated time*/ \
    select name, intf_link, state_id, city, street1, zip, last_updated from c_d_client where active_flag = 'A' and last_updated > '"+ strLastUpdate + "'"
  dbConnCoPath = DatabaseConnectionFactory.createDatabaseConnection(strSybaseJDBCDriver, strSybaseJDBCConnection, strSybaseUserName, strSybasePassword)
  objCopathResult = dbConnCoPath.executeCachedQuery(strSQL)
  var intResultSize = objCopathResult.size()

  if (intResultSize > 0) {
    for (var i = 0; i < intResultSize; i++) {
      // logger.debug("i: " + i.toString() + "Entry point.");
      objCopathResult.next()

      var strName = SanitizeVariableAddLeadingAndTrailingApostrophies(objCopathResult.getString("name"))
      var strIntLink = SanitizeVariableAddLeadingAndTrailingApostrophies(objCopathResult.getString("intf_link"))
      var strState = SanitizeVariableAddLeadingAndTrailingApostrophies(objCopathResult.getString("state_id"))
      var strStreet = SanitizeVariableAddLeadingAndTrailingApostrophies(objCopathResult.getString("street1"))
      var strCity = SanitizeVariableAddLeadingAndTrailingApostrophies(objCopathResult.getString("city"))
      var strZip = SanitizeVariableAddLeadingAndTrailingApostrophies(objCopathResult.getString("zip"))
      var strLastUpdated = SanitizeVariableAddLeadingAndTrailingApostrophies(objCopathResult.getString("last_updated"))

      strSQL = "/* Insert each row*/ \
        INSERT INTO UrgentProcedureTracking.tblClientAddress \
        (name, \
        intf_link, \
        state_id, \
        city, \
        street1, \
        zip, \
        last_updated) \
        VALUES \
        (" + strName + ", \
        " + strIntLink + ", \
        " + strState + ", \
        " + strCity + ", \
        " + strStreet + ", \
        " + strZip + ", \
        " + strLastUpdated + ") \
        ON DUPLICATE KEY UPDATE \
        name = " + strName + ", \
        intf_link = " + strIntLink + ", \
        state_id = " + strState + ", \
        city = " + strCity + ", \
        street1 = " + strStreet + ", \
        zip = " + strZip + ", \
        last_updated = " + strLastUpdated + ";"

      objMYSQLResult2 = dbConnMYSQL.executeUpdate(strSQL)
    } // End For
  }
} catch (err) {
  logger.debug("Error Name:" + err.name + " Error Details: " + err + ". SQL:" + strSQL)
} finally {
  if (dbConnMYSQL) {
    dbConnMYSQL.close()
  }
  if (dbConnCoPath) {
    dbConnCoPath.close()
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
