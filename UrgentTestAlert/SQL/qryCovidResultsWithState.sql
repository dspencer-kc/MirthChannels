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
  AND state_id = 'MO'
  DTINSERTED >= @StartDateTime AND 
  DTINSERTED < @EndDateTime  
GROUP BY TestResult, ClientName, state_id 

Order By ClientName Desc;
/*qryCountByDate */
SELECT Count(CaseNo), TestResult, 'Total Detected/NotDeect' as ClientName FROM UrgentProcedureTracking.tblTestResult WHERE DTINSERTED >= @StartDateTime AND DTINSERTED < @EndDateTime GROUP BY TestResult;
/*qryCountByDate */
SELECT Count(CaseNo), 'Detected Or Not Detect' FROM UrgentProcedureTracking.tblTestResult WHERE DTINSERTED >= @StartDateTime AND DTINSERTED < @EndDateTime;