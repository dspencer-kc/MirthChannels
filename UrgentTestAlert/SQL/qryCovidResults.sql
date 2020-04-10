/*qryCountByClient */
SELECT Count(CaseNo), TestResult, ClientName FROM UrgentProcedureTracking.tblTestResult WHERE DTINSERTED > '2020-04-09' GROUP BY TestResult, ClientName Order By ClientName Desc;
/*qryCountByDate */
SELECT Count(CaseNo), TestResult, 'Total Detected/NotDeect' as ClientName FROM UrgentProcedureTracking.tblTestResult WHERE DTINSERTED > '2020-04-09' GROUP BY TestResult;
/*qryCountByDate */
SELECT Count(CaseNo), 'Detected Or Not Detect' FROM UrgentProcedureTracking.tblTestResult WHERE DTINSERTED > '2020-04-09';