SET @StartDateTime = '2020-06-3 00:00';
SET @EndDateTime = timestamp(current_date);
/*qryCountByClient */
SELECT  
  CaseNo,
  TestResult, 
  ClientName, PortalID,  state_id, SendingFacility
FROM UrgentProcedureTracking.tblTestResult,
  tblClientAddress
WHERE 
  concat(intf_link, '_2019') = PortalID AND
  (state_id = 'LA' OR PatientStateOfResidence = 'LA')  AND
  DTSignedOut >= @StartDateTime AND 
  DTSignedOut < @EndDateTime   AND
  TestResult = 'DETECTED' AND
  SendingFacility = 'MAWD'