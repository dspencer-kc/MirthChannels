
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
var intClientUpdateCount = 0

try {
  //  MYSQL
  var strSQL = " /* Mysql get latest update time*/ \
    select last_updated from tblClientAddress group by last_updated order by last_updated desc limit 1;"

  dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
  result = dbConnMYSQL.executeCachedQuery(strSQL)
  result.next()
  strLastUpdate = result.getString("last_updated")

  //Set here to hardcode what client updates to get
  //strLastUpdate = '7/20/2020 19:39:01:623'

  //  CoPath
  strSQL = "/*CoPath get all updates sense last updated time*/ \
  select name, intf_link, state_id, city, street1, zip, last_updated, id from c_d_client where active_flag = 'A' and last_updated > '"+ strLastUpdate + "'"
  
  //Update All
  //strSQL = "/*CoPath get all updates sense last updated time*/ \
  //select name, intf_link, state_id, city, street1, zip, last_updated, id from c_d_client where active_flag = 'A'"
  

  
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
      var strCoPathInternalClientID = SanitizeVariableAddLeadingAndTrailingApostrophies(objCopathResult.getString("id"))

      strSQL = "/* Insert each row*/ \
        INSERT INTO UrgentProcedureTracking.tblClientAddress \
        (name, \
        intf_link, \
        state_id, \
        city, \
        street1, \
        zip, \
        last_updated, \
        CoPathClientID) \
        VALUES \
        (" + strName + ", \
        " + strIntLink + ", \
        " + strState + ", \
        " + strCity + ", \
        " + strStreet + ", \
        " + strZip + ", \
        " + strLastUpdated + ", \
        " + strCoPathInternalClientID + ") \
        ON DUPLICATE KEY UPDATE \
        name = " + strName + ", \
        intf_link = " + strIntLink + ", \
        state_id = " + strState + ", \
        city = " + strCity + ", \
        street1 = " + strStreet + ", \
        zip = " + strZip + ", \
        last_updated = " + strLastUpdated + ", \
        CoPathClientID = " + strCoPathInternalClientID + " ;"

      try {
	   objMYSQLResult2 = dbConnMYSQL.executeUpdate(strSQL)
      } catch (err) {
        logger.debug("Error Name:" + err.name + " Error Details: " + err + ". SQL:" + strSQL)
      } 


      // Send JSON to MAWDLIS
      // strName = SanitizeVariableLeadingAndTrailingApostrophiesNullAsEmptyString(objCopathResult.getString("name"))
      // strIntLink = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(objCopathResult.getString("intf_link"))
      // strState = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(objCopathResult.getString("state_id"))
      // strStreet = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(objCopathResult.getString("street1"))
      // strCity = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(objCopathResult.getString("city"))
      // strZip = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(objCopathResult.getString("zip"))
      // strLastUpdated = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(objCopathResult.getString("last_updated"))

      // Send Text Delimited to MAWDLIS
      strName = SanitizeVariableAddLeadingAndTrailingQuotesNullAsEmptyString(objCopathResult.getString("name"))
      strIntLink = SanitizeVariableAddLeadingAndTrailingQuotesNullAsEmptyString(objCopathResult.getString("intf_link"))
      strState = SanitizeVariableAddLeadingAndTrailingQuotesNullAsEmptyString(objCopathResult.getString("state_id"))
      strStreet = SanitizeVariableAddLeadingAndTrailingQuotesNullAsEmptyString(objCopathResult.getString("street1"))
      strCity = SanitizeVariableAddLeadingAndTrailingQuotesNullAsEmptyString(objCopathResult.getString("city"))
      strZip = SanitizeVariableAddLeadingAndTrailingQuotesNullAsEmptyString(objCopathResult.getString("zip"))
      strLastUpdated = SanitizeVariableAddLeadingAndTrailingQuotesNullAsEmptyString(objCopathResult.getString("last_updated"))
      strCoPathInternalClientID = SanitizeVariableAddLeadingAndTrailingQuotesNullAsEmptyString(objCopathResult.getString("id"))
         
      var strJSONClientData = '{\
        "intfLink": "'+ strIntLink +'", \
        "name": "'+ strName +'",\
        "state": "'+ strState +'",\
        "city": "'+ strCity +'",\
        "street1": "'+ strStreet +'",\
        "zip": "'+ strZip +'",\
        "lastUpdated": "'+ strLastUpdated +'"\
          }'

      var strDelimitedTextClient = strIntLink + ', ' + strName + ', ' + strState + ', ' + strCity + ', ' + strStreet + ', ' + strZip + ', ' + strLastUpdated + ', ' + strCoPathInternalClientID
       //New Format:
       // "1141","THE -RES GUEST HOUSE", "LA", "Baton Ruoge", "THE GUEST HOUSE 10145 FLORIDA BLVD, BATON ROUGE, LA 70815", "70815", "2020-07-20 16:31:45.25"

      //router.routeMessage('OB_to_MAWDLIS', strJSONClientData)
      
      //router.routeMessage('OB_to_MAWDLIS', strDelimitedTextClient)
      intClientUpdateCount++
    } // End For

  logger.debug("Client Update Completed." + intClientUpdateCount + " clients updated.")
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
function SanitizeVariableAddLeadingAndTrailingQuotesNullAsEmptyString (txt) {
  if (txt == null) {
      return ""
  } else {
      return '"' + EscapeApostrophe(txt) + '"'
  }
}
function SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString (txt) {
  if (txt == null) {
      return ""
  } else {
      return EscapeApostrophe(txt)
  }
}
