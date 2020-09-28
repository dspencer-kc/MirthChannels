// Write to DB
var intDebugLevel = 11 // 11 is all messages, 1 is critical only
const strMYSQLUserName = configurationMap.get('MYSQLUserName')
const strMYSQLPassword = configurationMap.get('MYSQLPassword')
const strMYSQLJDBCConnection = configurationMap.get('URGENTPROCTRACKINGMYSQLJDBCConnection')
const strMYSQLJDBCDriver = configurationMap.get('MYSQLJDBCDriver')

UploadToDB($('LName'), $('FName'), $('DOB'), $('Sex'), $('InsuranceName'), $('Client'), $('DOS'), $('OrderID'), $('ADDRESS'), $('CITY'), $('STATE'), $('ZIP'), $('Guarantor'), $('SSN'), 
$('Relationship'), $('Phone'), $('InsuranceAddress'), $('InsuranceCity'), $('InsuranceState'), $('InsuranceZip'), $('InsuranceGroupName'), $('InsurancePolicyNumber'), $('SecondaryInsuranceName'), 
$('Secondary Insurance Address'), $('Secondary InsuranceCity'), $('Secondary InsuranceState'), $('Secondary InsuranceZip'), $('Secondary InsuranceGroupName'), $('Secondary InsurancePolicyNumber'), 
$('SubmittingPhysicianNPI'), $('SubmittingPhysicianFName'), $('SubmittingPhysicianLName'), $('DXCodes'), $('OrderDate'), $('InsuranceGroupNumber'), $('SecondaryInsuranceGroupNumber'))

var strFileNameForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString($('originalFilename'))

function UploadToDB (strLocalLname, strLocalFname, strLocalDOB, strLocalSex, strLocalInsuranceName, strLocalClient, strLocalDOS,strLocalORDERID) {
  var blValid = true
  var blDBUpload = true

  if (blValid) {
    // Insert to DB
    if (blDBUpload) {
      try {
        // DBConnection
        dbConnMYSQL = DatabaseConnectionFactory.createDatabaseConnection(strMYSQLJDBCDriver, strMYSQLJDBCConnection, strMYSQLUserName, strMYSQLPassword)
        // var strSampleNameForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalLname)
        // var strResultValueForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalFname)
        // var strN1CTForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalDOB)
        // var strN2CTForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalSex)
        // var strRPCTForDB = SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalInsuranceName)

        strSQL = "INSERT INTO UrgentProcedureTracking.tblOrderInsuranceExtract02 \
          (LName, \
          FName, \
          DOB, \
          Sex, \
          InsuranceName, \
          Client, \
          DOS, \
          OrderID)\
          VALUES\
          (" + SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalLname) + ",\
          " + SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalFname) + ",\
          " + SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalDOB) + ",\
          " + SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalSex) + ",\
          " + SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalInsuranceName) + ",\
          " + SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalClient) + ",\
          " + SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalDOS) + ",\
          " + SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString(strLocalORDERID) + ");"

        result = dbConnMYSQL.executeUpdate(strSQL)
        PrintToDebugLog(5, strSQL)
      } catch (err) {
        logger.debug('ERROR- MYSQL:' + err.name + ' Error Details: ' + err + '. SQL: ' + strSQL)
      } finally {
        if (dbConnMYSQL) {
          dbConnMYSQL.close()
        }
      }
    }

    PrintToDebugLog(5, strSQL)
  }
}
function SanitizeVariableAddLeadingAndTrailingApostrophiesNullAsEmptyString (txt) {
  if (txt == null) {
    return ""
  } else {
    return "'" + EscapeApostrophe(txt) + "'"
  }
}
function EscapeApostrophe (txt)  {
  return (txt + "").replace(/\'/g, "''")
}
// return(strResultTextFile)
function PrintToDebugLog (intHowImportant, strDebugMsg) {
  if (intDebugLevel > intHowImportant) {
    logger.debug(intHowImportant + ' ' + strDebugMsg)
  }
}
