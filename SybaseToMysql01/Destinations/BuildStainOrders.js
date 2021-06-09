var dbConnMYSQL
var strSQL
var result
var intResultSize
var strDateTime = DateUtil.getCurrentDate('yyyyMMddHHmmss')
var strSyncID = $('intLastSyncID')
const intDebugLevel = 10
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('MYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')

const strStainCSVRecMirthChannel = 'StainOrderCSVToVentanna'
const blSendToMirthChannel = false

// If no syncid, set as 0.
if (isNaN(strSyncID)) {
  strSyncID = 0
} else if (strSyncID == "") {
  strSyncID = 0
}

// Sync New Slide Orders
try {
	strSQL = "SELECT \
  substring(Patient, 1, instr(Patient, ',') - 1) as 'First', \
  substring(Patient, instr(Patient, ',') + 1)  as 'Last' , \
  'U' as 'Sex', \
     AccessionID, \
     StainOrderDate, \
        SlideID, \
        substring(SlideID, 5) as 'HumanReadableSlideID', \
        PartDesignator, \
        StainInst, \
        BlockInst, \
        SiteLabel, \
        StainID as 'ProtocolNumber', \
        StainLabel as 'ProtocolName' \
  FROM tblSlides \
  WHERE \
    `SyncID` = " + strSyncID + ";"

    if (intDebugLevel > 9) {
      logger.debug("strCSV:" + strCSV);
    }

  // logger.debug("SQL:" + strSQL);
  dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
  result = dbConnMYSQL.executeCachedQuery(strSQL)

  if (intDebugLevel > 9) {
    logger.debug("Query executed");
  }

    // Loop set result size for loop.  Loop after dbconn established.
    intResultSize = result.size()

  if (intResultSize > 0) {
    for (var i = 0; i < intResultSize; i++) {
      result.next()
      
      if (intDebugLevel > 9) {
        logger.debug("Start CSV Build");
      }
      // fisrt,last,sex,accessionid,stainorderdate,slideid,humanreadableslideid,partdesignator,staininst,blockinst,sitelabel,protocolnumber,protocolname
      var strCSV = result.getString('First') + result.getString('Last') + ',' + result.getString('Sex') +  ',' +result.getString('AccessionID') +  ',' + result.getString('StainOrderDate') + ',' + result.getString('SlideID') + ',' + result.getString('HumanReadableSlideID') + ',' + result.getString('PartDesignator') + ',' + result.getString('StainInst') + result.getString('BlockInst') + ',' + result.getString('SiteLabel') + ',' + result.getString('ProtocolNumber') + ',' + result.getString('ProtocolName')

      if (intDebugLevel > 5) {
        logger.debug("strCSV:" + strCSV);
      }

      if (blSendToMirthChannel) {
        router.routeMessage(strStainCSVRecMirthChannel, strCSV)
      }
    }
  }

} catch (err) {
  logger.debug('ERROR- MYSQL:' + err.name + ' Error Details: ' + err + '. SQL: ' + strSQL)
} finally {
  if (dbConnMYSQL) {
    dbConnMYSQL.close()
  }
}
