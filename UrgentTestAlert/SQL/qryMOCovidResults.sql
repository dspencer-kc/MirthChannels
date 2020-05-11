SET @StartDateTime = '2020-01-01 00:00';
SET @EndDateTime = timestamp(current_date);
/*qryCountByClient */
SELECT Count(CaseNo) as 'Detected Results', 
   DATE(DTInserted)
FROM UrgentProcedureTracking.tblTestResult,
  tblClientAddress
WHERE 
  concat(intf_link, '_2019') = PortalID AND
  (state_id = 'MO' OR PatientStateOfResidence = 'MO')  AND
  DTInserted >= @StartDateTime AND 
  DTInserted < @EndDateTime AND
  TestResult = 'Detected'
GROUP BY DATE(DTInserted)
ORDER BY DATE(DTInserted) DESC;
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
ORDER BY DATE(DTInserted) DESC;
 