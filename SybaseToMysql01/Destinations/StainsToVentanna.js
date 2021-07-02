var dbConnMYSQL
var strSQL
var result
var intResultSize
var strDateTime = DateUtil.getCurrentDate('yyyyMMddHHmmss')
var strSyncID = $('intLastSyncID')
const intDebugLevel = 1
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('MYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')

const strStainCSVRecMirthChannel = 'StainOrderCSVToVentanna'
const blSendToMirthChannel = true

// If no syncid, set as 0.
if (isNaN(strSyncID)) {
  strSyncID = 0
} else if (strSyncID == "") {
  strSyncID = 0
}

// Sync New Slide Orders
try {
	strSQL = "SELECT \
  substring(s.Patient, 1, instr(s.Patient, ',') - 1) as 'First', \
  substring(s.Patient, instr(s.Patient, ',') + 1)  as 'Last' , \
  'U' as 'Sex', \
     s.AccessionID, \
     s.StainOrderDate, \
        s.SlideID, \
        substring(s.SlideID, 5) as 'HumanReadableSlideID', \
        s.PartDesignator, \
        s.StainInst, \
        s.BlockInst, \
        s.SiteLabel, \
        s.StainID as 'ProtocolNumber', \
        s.StainLabel as 'ProtocolName', \
	    p.name as 'TissueType', \
        b.PartDescription as 'TissueDescription', \
        b.MRN,\
        sp.foreign_identifier \
  FROM tblSlides as s \
    left join tblBlock as b  \
		on s.BlockID = b.BlockID \
	left join copath_c_d_parttype as p \
        on b.PartType = p.id \
	left join copath_c_d_stainprocess as sp \
        on s.StainID = sp.id \
 WHERE \
    foreign_identifier not like '' AND \
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

      var strMRN = ''
      strMRN = result.getString('MRN')
      var strTissueType = ''
      strTissueType = result.getString('TissueType')
      var strTissueDescription = ''
      strTissueDescription = result.getString('TissueDescription')

      // first,last,sex,accessionid,stainorderdate,slideid,humanreadableslideid,partdesignator,staininst,blockinst,sitelabel,protocolnumber,protocolname
      var strCSV = result.getString('First') + ',' + result.getString('Last') + ',' + result.getString('Sex') +  ',' +result.getString('AccessionID') +  ',' + result.getString('StainOrderDate') + ',' + result.getString('SlideID') + ',' + result.getString('HumanReadableSlideID') + ',' + result.getString('PartDesignator') + ',' + result.getString('StainInst') + result.getString('BlockInst') + ',' + result.getString('SiteLabel') + ',' + result.getString('ProtocolNumber') + ',' + result.getString('ProtocolName') + ',' + strTissueType + ',' + strTissueDescription + ',' + strMRN + ',' + result.getString('foreign_identifier')

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
