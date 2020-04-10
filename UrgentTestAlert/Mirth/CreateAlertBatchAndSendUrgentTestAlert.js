// This channel should run every 5 minutes or so.
//   1.  Check to see if there are test results ready to be batched and sent
//   2.  If so, batch, send, and update

//  Check if test results are ready to be tach sent
/*qryCasesReadyForBatch*/

var dbConnMYSQL
var strSQL
var strSQL_2
var strSQL_3
var objMYLSQLResult
var mySQLresult
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')
var intEmailsSuccessfullySent = 0
var intDebugLevel = 10
var msg = <HL7Message/>;

if (intDebugLevel > 5) {
  	  logger.debug('Urgent Test Alert Start')
}

strSQL = 'SELECT Cases \
  FROM \
      (SELECT COUNT(CaseNo) as Cases, \
      MAX(DTInserted) as MostRecentResultNotAlerted \
      FROM tblTestResult \
      WHERE AlertBatch is NUll) as CasesReadyForBatch \
  WHERE CasesReadyForBatch.MostRecentResultNotAlerted <= (NOW() - INTERVAL 15 MINUTE);'

try {

  createSegment('MSH', msg)
  msg.MSH['MSH.1'] = '|';
  msg.MSH['MSH.2'] = '^~\\&';
  msg.MSH['MSH.3']['MSH.3.1'] = 'started'
  msg.MSH['MSH.4']['MSH.4.1'] = 0
  msg.MSH['MSH.5']['MSH.5.1'] = 0

  dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
  objMYLSQLResult = dbConnMYSQL.executeCachedQuery(strSQL)
  var intResultSize = objMYLSQLResult.size()
  if (intResultSize > 0) {

  // Batch needs created and sent
  //Create Batch
  strSQL_2 = "INSERT INTO UrgentProcedureTracking.tblAlertBatches \
  (Status) \
  VALUES \
  ( \
  'STARTED');"

  if (intDebugLevel > 5) {
  	  logger.debug(strSQL_2)
  }

  mySQLresult = dbConnMYSQL.executeUpdate(strSQL_2)
  // Get ID that was just inserted
  //strSQLGetLastInsertID = "SELECT LAST_INSERT_ID() as lastinsertid;"
  //lastInsertIDResult = dbConnMYSQL.executeCachedQuery(strSQLGetLastInsertID)
  //lastInsertIDResult.next()
  //intLastSyncID = lastInsertIDResult.getString('lastinsertid')

  // Update all that need to go on a batch
  // NOTE - YOU HAVE TO HANDLE IF THAT BATCH WAAS NEVER SENT OTHERWISE IF THERE IS AN ERROR, THESE WILL NOT BE PICKED UP  
  strSQL_3 = " \
    UPDATE UrgentProcedureTracking.tblTestResult \
    SET \
    AlertBatch = (SELECT LAST_INSERT_ID()) \
    WHERE AlertBatch is null;"

    if (intDebugLevel > 5) {
  	  logger.debug(strSQL_3)
  }
  mySQLresult = dbConnMYSQL.executeUpdate(strSQL_3)

  //  Get Covid results available
  strSQL = " \
    /*qryResultCountByPortalID*/ \
    SELECT PortalID, Test, COUNT(CaseNo) as ResultsAvailable, AlertBatch, ClientName \
    FROM tblTestResult \
    WHERE AlertBatch = (SELECT LAST_INSERT_ID()) \
    GROUP BY PortalID, Test, AlertBatch, ClientName;"
  objMYLSQLResult = dbConnMYSQL.executeCachedQuery(strSQL)

  //  For Each Client ID - compose message and send email
  var intResultCountSize = objMYLSQLResult.size()

  if (intDebugLevel > 5) {
        logger.debug(strSQL)
  }

  if (intResultCountSize > 0) {

    // Get first result prior to loop to get batch number
    objMYLSQLResult.next()
    var strAlertBatchNo = objMYLSQLResult.getString('AlertBatch')
    msg.MSH['MSH.5']['MSH.5.1'] = strAlertBatchNo  

    //For each portal ID
    for (var i = 0; i < intResultCountSize; i++) {

    	
      // Get results available    
      var strPortalID = objMYLSQLResult.getString('PortalID')
      var strClientName = objMYLSQLResult.getString('ClientName')
      var strResultsAvailableCount = objMYLSQLResult.getString('ResultsAvailable')
      var strTestName = objMYLSQLResult.getString('Test')
      var strMessageText = strClientName + ': ' + strResultsAvailableCount + ' new ' + strTestName + ' results available'
      
      // Get positive results for Covid-19 if any
      strSQL =  "/*qryPositiveCountByPortalID*/ \
        SELECT PortalID, COUNT(CaseNo) as PositiveResults \
        FROM tblTestResult \
        WHERE AlertBatch = (SELECT LAST_INSERT_ID()) AND \
        TestResult = 'DETECTED' AND \
        PortalID = '" + strPortalID + "' \
        GROUP BY PortalID;"

       if (intDebugLevel > 5) {
  	     logger.debug(strSQL)
       }       
        var objPosMYLSQLResult = dbConnMYSQL.executeCachedQuery(strSQL)
        var intPosResultCountSize = objPosMYLSQLResult.size()

        if (intPosResultCountSize > 0) {
        	objPosMYLSQLResult.next()
          var strPositiveResults = objPosMYLSQLResult.getString('PositiveResults')
          strMessageText = strMessageText + ', ' + strPositiveResults + ' positive.'
        } else {
          strMessageText = strMessageText + ', 0 positive.'
        } // End If
        
              // Get Repeat Testing results for Covid-19 if any
        strSQL =  "/*qryRepeatCountByPortalID*/ \
        SELECT PortalID, COUNT(CaseNo) as RepeatResults \
        FROM tblTestResult \
        WHERE AlertBatch = (SELECT LAST_INSERT_ID()) AND \
        TestResult = 'PENDING REPEAT TESTING' AND \
        PortalID = '" + strPortalID + "' \
        GROUP BY PortalID;"

       if (intDebugLevel > 5) {
  	     logger.debug(strSQL)
       }       
        var objRepeatMYLSQLResult = dbConnMYSQL.executeCachedQuery(strSQL)
        var intPosResultCountSize = objRepeatMYLSQLResult.size()

        if (intPosResultCountSize > 0) {
        	objRepeatMYLSQLResult.next()
          var strRepeatResults = objRepeatMYLSQLResult.getString('RepeatResults')
          strMessageText = strMessageText + ' ' + strRepeatResults + ' case(s) pending repeat testing.'
        }


      var strEmailSubject = 'MAWD Urgent Result Available, Hospital: ' + strPortalID
      // Send Email
      logger.debug(strMessageText)
      var blEmailStatus
      blEmailStatus = sendEmailMsg('mawdpathology@integration.alertmedia.com','noreply@mawdpathology.com', strEmailSubject,strMessageText)

      intEmailsSuccessfullySent = intEmailsSuccessfullySent + blEmailStatus

      //Since next result is done before for statement, do not go to next result on final loop.
      if ((i + 1) < intResultCountSize) {
        objMYLSQLResult.next()
      }

      
      if (intDebugLevel > 5) {
        logger.debug('Email Send Status:' + blEmailStatus)
      }    
    } //End for

    //Get Batch Number
    var strAlertBatchNo = objMYLSQLResult.getString('AlertBatch')

  // Save Batch Stats to message to use to update status.
  if (intDebugLevel > 0) {
    logger.debug('Successfully sent ' + intEmailsSuccessfullySent + ' emails.')
  } 

  msg.MSH['MSH.3']['MSH.3.1'] = 'SENT'
  msg.MSH['MSH.4']['MSH.4.1'] = intEmailsSuccessfullySent

  var message = SerializerFactory.getSerializer('HL7V2').fromXML(msg)
  return message


} //End if
  }  // End If any results that need message
} catch (err) {
  //GetStringError
  logger.debug("Error Name:" + err.name + " Error Details: " + err + ". SQL:" + strSQL)
  logger.debug("Catch 116")
} finally {
  if (dbConnMYSQL) {
    dbConnMYSQL.close()

  }
}

// Send Email FUnction
//http://javadocs.mirthcorp.com/connect/3.0.0/user-api/com/mirth/connect/server/userutil/SMTPConnection.html 

// Sample code to call function
// sendEmailMsg('info@javascriptshorts.com','HL7guy@me.com', 'Subject','This message was delivered via MIRTH')
function sendEmailMsg(strEmailRecipient,strEmailSender,strSubject, strMessageBody) {
    if (intDebugLevel > 5) {
  	  logger.debug('Email Function Called')
    }

    var blEmailSuccess = 0

    try {
      var smtpConn = ''
      smtpConn = SMTPConnectionFactory.createSMTPConnection()
      smtpConn.setHost('10.24.4.3')
      smtpConn.setPort('25')
      // smtpConn.send(smtpTo, smtpTo, 'mirthAlert@email.com', smtpSubject, smtpBody);
      smtpConn.send(strEmailRecipient,'',strEmailSender,strSubject, strMessageBody)
      blEmailSuccess = 1

    } catch (err) {
      //GetStringError
      logger.debug("Error Sending Email")
      logger.debug("Error Name:" + err.name + " Error Details: " + err + ". SQL:" + strSQL)

    } 
    
    return blEmailSuccess

}