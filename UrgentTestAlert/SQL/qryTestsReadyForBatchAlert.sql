/*qryTestsReadyForBatchAlert */

SELECT CaseNo
FROM 
    SELECT CaseNo, DTInserted as subDTInserted
    FROM tblTestResult
    WHERE AlertBatch = NUll
WHERE AlertBatch = NUll



SELECT CaseNo, MAX(DTInserted)
    FROM tblTestResult
    WHERE AlertBatch = NUll

SELECT Cases
FROM
    SELECT COUNT(CaseNo) as Cases,
     MAX(DTInserted) as MostRecentResultNotAlerted
    FROM tblTestResult
    WHERE AlertBatch is NUll
WHERE MostRecentResultNotAlerted <= NOW() - 15

/*qryCasesReadyForBatch*/
SELECT Cases
FROM
    (SELECT COUNT(CaseNo) as Cases,
     MAX(DTInserted) as MostRecentResultNotAlerted
    FROM tblTestResult
    WHERE AlertBatch is NUll) as CasesReadyForBatch
WHERE CasesReadyForBatch.MostRecentResultNotAlerted <= (NOW() - INTERVAL 15 MINUTE);