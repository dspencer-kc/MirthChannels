/*qryResultCountByPortalID*/
SELECT PortalID, COUNT(CaseNo) as ResultsAvailable
FROM tblTestResult
WHERE AlertBatch = (SELECT LAST_INSERT_ID())
GROUP BY PortalID;
/*qryPositiveCountByPortalID*/
SELECT PortalID, COUNT(CaseNo) as PositiveResults
FROM tblTestResult
WHERE AlertBatch = (SELECT LAST_INSERT_ID()) AND
TestResult = 'DETECTED'
GROUP BY PortalID;