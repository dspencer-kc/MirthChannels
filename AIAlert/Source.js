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
var strAlertGroup = '99998'
var AcceptableNotDistributed = 75
var strPrevHoursForAlert = '2'
var blAlertTriggered = '0'
var msg = <HL7Message/>;

if (intDebugLevel > 5) {
  	  logger.debug('AI Test Alert Start')
}

strSQL = "select ( \
  select count(SampleName) as DetectedImportedResults \
  from tblCDCResults \
  where DateTimeInserted between DATE_ADD(NOW(), INTERVAL - " + strPrevHoursForAlert + " hour) AND DATE_ADD(NOW(), INTERVAL -20 minute) and \
  ResultValue like 'Not Detected' \
  )  \
    - \
  (  \
  select count(CaseNo) as DetectedDistributedResults \
  from tblTestResult \
  where DTInserted > DATE_ADD(NOW(), INTERVAL - " + strPrevHoursForAlert + " hour) and \
  TestResult like 'Not Detected' \
  ) as PotentialNotDistributed;"

  if (intDebugLevel > 9) {
  	  logger.debug(strSQL)
}

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

    objMYLSQLResult.next()
    var PotentialNotDistributed = objMYLSQLResult.getString('PotentialNotDistributed')
      if (parseInt(PotentialNotDistributed) >= AcceptableNotDistributed) 
      {
        msg.MSH['MSH.3']['MSH.3.1'] = 'Alert Triggered'
        var blAlertTriggered = '1'
        var strEmailSubject = 'MAWD Urgent Result Available, Hospital: ' + strAlertGroup
        var strMessageText = 'AI potentially not running based on ' + PotentialNotDistributed + ' NOT Detected instrument results that are potentially not distributed in the last ' + strPrevHoursForAlert + ' hours. \
          Threshold set at: ' + AcceptableNotDistributed + '.'

        // Send Email
        logger.debug(strMessageText)
        var blEmailStatus
        blEmailStatus = sendEmailMsg('mawdpathology@service.alertmedia.com','noreply@mawdpathology.com', strEmailSubject,strMessageText)
  
        intEmailsSuccessfullySent = intEmailsSuccessfullySent + blEmailStatus
      } else {
        msg.MSH['MSH.3']['MSH.3.1'] = 'Alert Criteria Not Met'
      }



  // Batch needs created and sent
  //Create Batch
  strSQL_2 = "INSERT INTO UrgentProcedureTracking.tblLISAlertBatches \
  (Status) \
  VALUES \
  ( \
  'STARTED');"

  if (intDebugLevel > 5) {
  	  logger.debug(strSQL_2)
  }

  mySQLresult = dbConnMYSQL.executeUpdate(strSQL_2)
  // Get ID that was just inserted

  strSQL = " \
    SELECT AlertBatch \
    FROM tblLISAlertBatches \
    WHERE (AlertBatch = (SELECT LAST_INSERT_ID())) \
    GROUP BY AlertBatch;"
    
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

    //Get Batch Number
    var strAlertBatchNo = objMYLSQLResult.getString('AlertBatch')

  // Save Batch Stats to message to use to update status.
  if (intDebugLevel > 0) {
    logger.debug('Successfully sent ' + intEmailsSuccessfullySent + ' emails.')
  } 

  msg.MSH['MSH.4']['MSH.4.1'] = blAlertTriggered

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