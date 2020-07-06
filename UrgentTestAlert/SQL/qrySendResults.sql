SELECT Cases 
  FROM 
      (SELECT COUNT(CaseNo) as Cases, 
      MAX(DTInserted) as MostRecentResultNotAlerted,
      MIN(DTInserted) as OldestResultNotAlerted
      FROM tblTestResult 
      WHERE AlertBatch is NUll) as CasesReadyForBatch 
  WHERE (CasesReadyForBatch.MostRecentResultNotAlerted <= (NOW() - INTERVAL 5 MINUTE) OR OldestResultNotAlerted <= (NOW() - INTERVAL 120 MINUTE))  ;

SELECT Cases 
  FROM 
      (SELECT COUNT(CaseNo) as Cases, 
      MAX(DTInserted) as MostRecentResultNotAlerted, 
      MIN(DTInserted) as OldestResultNotAlerted 
      FROM tblTestResult 
      WHERE AlertBatch is NUll) as CasesReadyForBatch 
  WHERE (CasesReadyForBatch.MostRecentResultNotAlerted <= (NOW() - INTERVAL 5 MINUTE) OR OldestResultNotAlerted <= (NOW() - INTERVAL 35 MINUTE));