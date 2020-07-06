const strSybaseUserName = configurationMap.get('SybaseUserName')
const strSybasePassword = configurationMap.get('SybasePassword')
const strSybaseJDBCConnection = configurationMap.get('SybaseJDBCConnection')
// const strSybaseJDBCConnection = configurationMap.get('TESTSybaseJDBCConnection')
const strSybaseJDBCDriver = configurationMap.get('SybaseJDBCDriver')
var strSQL = ''
var result
var strSampleName = msg['row']['samplename'].toString()
var strResult = msg['row']['result'].toString()
var stPatientInitials = 'unset'
var strPatientInitialsCompare = 'Initialized'
var strAccessionID = ''
var strCaseNumberOnly = ''
var strDateTime = DateUtil.getCurrentDate('yyyyMMddHHmmss')
tmp['PID']['PID.5']['PID.5.5'] = ''
tmp['MSH']['MSH.10']['MSH.10.1'] = DateUtil.getCurrentDate('yyyyMMddHHmmssSSSSSS')
tmp['MSH']['MSH.7']['MSH.7.1'] = strDateTime

var blPatientInitials = 'unset'

strSampleName = strSampleName.trim()

//See if initials are there
if (strSampleName.indexOf(' ') >= 0) {
  blPatientInitials = 'Y'
} else {
  logger.debug('No Patient initials')
  blPatientInitials = 'N'
}
// s.indexOf(' ') >= 0

// Cleanup Sample Name

if (blPatientInitials === 'Y') {
  stPatientInitials = strSampleName.slice(-2)
}

logger.debug(stPatientInitials)

// Add CV if no specimen prefix, and remove initials
// If Sample Name starts with Number, then add CV
if (strSampleName.length === 1 && strSampleName.match(/[a-z]/i)) {
  strAccessionID = strSampleName
} else {
  strAccessionID = 'CV' + strSampleName
}

if (blPatientInitials === 'Y') {
  strAccessionID = strAccessionID.substring(0, strAccessionID.length-3)
}

logger.debug(strAccessionID)
strCaseNumberOnly = strAccessionID.split('-')[1]
logger.debug(strCaseNumberOnly)

strSQL = " \
  SELECT \
  TOP 1 c_specimen.specclass_id, \
  c_specimen.specnum_year, \
  c_specimen.specnum_num, \
  r_pat_demograph.lastname, \
  r_pat_demograph.firstname, \
  r_medrec.medrec_num, \
  c_d_client.intf_link \
FROM \
  (\
    (\
      r_pat_demograph \
      INNER JOIN r_medrec ON r_pat_demograph.patdemog_id = r_medrec.patdemog_id\
    ) \
    INNER JOIN c_specimen ON (\
      c_specimen.client_id = r_medrec.client_id\
    ) \
    INNER JOIN c_d_client ON (\
      r_medrec.client_id = c_d_client.id\
    ) \
    AND (\
      r_pat_demograph.patdemog_id = c_specimen.patdemog_id\
    )\
  ) \
WHERE \
  (\
    (\
      (c_specimen.specclass_id)= 'CV'\
    ) \
    AND (\
      (c_specimen.specnum_year)= 2020\
    ) \
    AND (\
      (c_specimen.specnum_num)= " + strCaseNumberOnly + "\
    ) \
    AND (\
      c_specimen.client_id = r_medrec.client_id \
      OR r_medrec.client_id = 'co4'\
    )\
  )"

// logger.debug("JS Writer:" + strSQL1);
try {
  dbConnCoPath = DatabaseConnectionFactory.createDatabaseConnection(strSybaseJDBCDriver, strSybaseJDBCConnection, strSybaseUserName, strSybasePassword)
  result = dbConnCoPath.executeCachedQuery(strSQL)

  result.next()
  
  var strLastName = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(result.getString('LastName'))
  logger.debug(strLastName)
  var strFirstName = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(result.getString('FirstName'))
  logger.debug(strFirstName)
  var strMRN = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(result.getString('medrec_num'))
  logger.debug(strMRN)
  var strMRNClientID = SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString(result.getString('intf_link'))
  logger.debug(strMRNClientID)
  



} catch (err) {
  logger.debug("ERROR- sybase query" + err.name + " Error Details: " + err + "SQL: " + strSQL )
} finally {
  if (dbConnCoPath) {
    dbConnCoPath.close()
  }
}

// Compare initials with Looked Up First and Last Name
strPatientInitialsCompare = strFirstName.substring(0, 1) + strLastName.substring(0, 1)
// logger.debug('strPatientInitials: ' + stPatientInitials + 'strPatientInitialsCompare: ' + strPatientInitialsCompare)

if (blPatientInitials === 'Y') {
  // If patient initials do not match, invalidate HL7 message (will not parse in to CoPath)
  if (stPatientInitials !== strPatientInitialsCompare) {
    tmp['MSH']['MSH.11']['MSH.11.1'] = 'X'
  }
}

// var strAccessionID = 'CV20-2'
var strProcInst = '1'
// var strCompleteDate = '201108121640'
var strCompleteDate = DateUtil.getCurrentDate('yyyyMMddHHmmss')
var strProcID = '2019'

//AccessionID $ Proc Inst $ ? $ Part Type
// 'CV20-1$1$201108121640$2019'

var strCaseAndProc = strAccessionID + '$' + strProcInst + '$' + strCompleteDate + '$' + strProcID
// strCaseAndProc = 'CV20-1563$1$201108121640$2019'
// strResult = 'TEST Result'

if ( msg['row']['result'].toString() === 'NOT DETECTED') {
// strResult = "SARS-CoV-2 (COVID-19) RT-PCR\.br\SARS-CoV-2 (COVID-19) RNA     NOT DETECTED               (Ref: Not Detected)\.br\\.br\\.br\The SARS-CoV-2 (COVID-19) RT-PCR procedure performed at MAWD Molecular Laboratory is a real-time RT-PCR test intended for the qualitative detection of SARS-CoV-2 specific nucleic acid from upper respiratory tract specimens (nasopharyngeal or oropharyngeal swabs).  The performance of this test has not been established for monitoring treatment of SARS-CoV-2 infection. This test was developed and its performance characteristics determined by the MAWD Molecular Laboratory. This test was developed for use as a part of a response to the public health emergency declared to address the outbreak of COVID-19.  This test has not been reviewed by the Food and Drug Administration. The FDA has determined that such clearance or approval is not necessary. This test is used for clinical purposes. It should not be regarded as investigational or for research. This laboratory is certified under the Clinical Laboratory Improvement Act of 1988 (CLIA-88) as qualified to perform high complexity  clinical laboratory testing.\.br\\.br\A positive result is indicative of the presence of SARS-CoV-2 RNA but does not rule out bacterial infection or co-infection with other viruses.  Laboratories within the United States and its territories are required to report all positive results to the appropriate public health authorities.\.br\A negative result does not definitively rule out SARS-CoV-2 infection and should be combined with clinical observations, patient history, and epidemiological information when making clinical decisions. \.br\Performed by: MAWD Pathology Group, 9705 Lenexa Drive, Lenexa, KS 66215, CLIA 17D2154812\.br"	
  strResult = "SARS-CoV-2 (COVID-19) RNA NOT DETECTED"
}  // Add else if statement here for positive result


tmp['PID']['PID.3']['PID.3.1'] = strMRN
tmp['PID']['PID.3']['PID.3.4'] = strMRNClientID
tmp['PID']['PID.5']['PID.5.1'] = strLastName
tmp['PID']['PID.5']['PID.5.2'] = strFirstName
tmp['ORC']['ORC.3']['ORC.3.1'] = strCaseAndProc
tmp['OBR']['OBR.3']['OBR.3.1'] = strCaseAndProc
tmp['OBR']['OBR.22']['OBR.22.1'] = strCompleteDate
// tmp['ORC']['ORC.3'] = strCaseAndProc
// tmp['OBR']['OBR.3'] = strCaseAndProc
tmp['OBX'][0]['OBX.5']['OBX.5.1'] = strResult

function EscapeApostrophe(txt)  {
  return (txt + "").replace(/\'/g, "''")
}
function SanitizeVariableNoLeadingAndTrailingApostrophiesNullAsEmptyString (txt) {
  if (txt == null) {
      return ""
  } else {
      return EscapeApostrophe(txt)
  }
}