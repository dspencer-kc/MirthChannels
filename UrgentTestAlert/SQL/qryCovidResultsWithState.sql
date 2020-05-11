SET @StartDateTime = '2020-04-13 00:00';
SET @EndDateTime = timestamp(current_date);
/*qryCountByClient */
SELECT Count(CaseNo), 
  TestResult, 
  ClientName,  state_id
FROM UrgentProcedureTracking.tblTestResult,
  tblClientAddress
WHERE 
  concat(intf_link, '_2019') = PortalID AND
  (state_id = 'MO' OR PatientStateOfResidence = 'MO')  AND
  DTSignedOut >= @StartDateTime AND 
  DTSignedOut < @EndDateTime  
GROUP BY TestResult, ClientName, state_id 

Order By ClientName Desc;
/*qryCountByDate */
SELECT Count(CaseNo), TestResult, 'Total Detected/NotDeect' as ClientName FROM UrgentProcedureTracking.tblTestResult WHERE DTINSERTED >= @StartDateTime AND DTINSERTED < @EndDateTime GROUP BY TestResult;
/*qryCountByDate */
SELECT Count(CaseNo), 'Detected Or Not Detect' FROM UrgentProcedureTracking.tblTestResult WHERE DTINSERTED >= @StartDateTime AND DTINSERTED < @EndDateTime;

SET @StartDateTime = '2020-04-23 00:00';
SET @EndDateTime = timestamp(current_date);
/*qryCountByClient */
SELECT Count(CaseNo), 
  TestResult, 
   DATE(DTSignedOut)
FROM UrgentProcedureTracking.tblTestResult,
  tblClientAddress
WHERE 
  concat(intf_link, '_2019') = PortalID AND
  (state_id = 'MO' OR PatientStateOfResidence = 'MO')  AND
  DTSignedOut >= @StartDateTime AND 
  DTSignedOut < @EndDateTime  
GROUP BY TestResult, DATE(DTSignedOut)

MO Detected:

SET @StartDateTime = '2020-01-01 00:00';
SET @EndDateTime = timestamp(current_date);
/*qryCountByClient */
SELECT Count(CaseNo), 
  TestResult, 
   DATE(DTInserted)
FROM UrgentProcedureTracking.tblTestResult,
  tblClientAddress
WHERE 
  concat(intf_link, '_2019') = PortalID AND
  (state_id = 'MO' OR PatientStateOfResidence = 'MO')  AND
  DTInserted >= @StartDateTime AND 
  DTInserted < @EndDateTime AND
  TestResult = 'Detected'
GROUP BY TestResult, DATE(DTInserted)
/*qryTotalResults*/
SELECT Count(CaseNo) as 'TotalTests', 
   DATE(DTInserted) as 'Date'
FROM UrgentProcedureTracking.tblTestResult,
  tblClientAddress
WHERE 
  concat(intf_link, '_2019') = PortalID AND
  (state_id = 'MO' OR PatientStateOfResidence = 'MO')  AND
  DTInserted >= @StartDateTime AND 
  DTInserted < @EndDateTime AND
  (TestResult = 'Detected' or TestResult = 'NOT DETECTED')
GROUP BY DATE(DTInserted)