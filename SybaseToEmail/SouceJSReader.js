//  Not - be sure to change data types to Raw under Channel Summary.

var dbConnCoPath
var dbConnMYSQL
var strSQL
var result
var intDebugLevel = 1
// var msg = <HL7Message/>

//  Get Reports
strSQL = "SELECT \
       c_specimen.specclass_id, \
       c_specimen.specnum_formatted, \
       c_specimen.accession_date, \
	   p_part.part_description, \
       c_specimen.signout_date, \
       p_special_proc.sp_inst, \
       c_d_sprotype.NAME, \
       p_special_proc.order_date as procorderdate, \
       p_special_proc.signout_date \
      FROM   c_specimen \
       LEFT OUTER JOIN p_special_proc \
                    ON c_specimen.specimen_id = p_special_proc.specimen_id \
       LEFT OUTER JOIN c_d_sprotype \
                    ON p_special_proc.sprotype_id = c_d_sprotype.id \
		LEFT OUTER JOIN  p_pathologist \
                    ON c_specimen.specimen_id = p_pathologist.specimen_id \
		LEFT OUTER JOIN  p_part \
                    ON c_specimen.specimen_id = p_part.specimen_id \
       WHERE  c_specimen.signout_date = NULL \
		   AND ( p_pathologist.person_id = 'mwd51451') 		   \
		   AND ( p_pathologist.person_id = 'mwd51451') \
		   AND ( c_specimen.specnum_year > 2018) \
       UNION \
       SELECT \
        c_specimen.specclass_id, \
        c_specimen.specnum_formatted, \
        c_specimen.accession_date, \
	   p_part.part_description, \
        c_specimen.signout_date, \
        p_special_proc.sp_inst, \
        c_d_sprotype.NAME, \
        p_special_proc.order_date as procorderdate, \
        p_special_proc.signout_date \
      FROM   c_specimen \
       LEFT OUTER JOIN p_special_proc \
                    ON c_specimen.specimen_id = p_special_proc.specimen_id \
       LEFT OUTER JOIN c_d_sprotype \
                    ON p_special_proc.sprotype_id = c_d_sprotype.id \
	  LEFT OUTER JOIN  p_path_spproc \
                    ON c_specimen.specimen_id = p_path_spproc.specimen_id \
	  LEFT OUTER JOIN  p_part \
             ON c_specimen.specimen_id = p_part.specimen_id \
       WHERE  p_special_proc.signout_date = NULL \
		   AND ( p_path_spproc.person_id = 'mwd51451') 		   \
		   AND ( p_path_spproc.person_id LIKE 'mwd51451') \
       AND ( c_specimen.specnum_year > 2018) \
    UNION \
       SELECT \
       c_specimen.specclass_id, \
       c_specimen.specnum_formatted, \
       c_specimen.accession_date, \
       '' as p_part, \
       c_specimen.signout_date, \
       p_special_proc.sp_inst, \
       c_d_sprotype.NAME, \
       p_special_proc.order_date as procorderdate, \
       p_special_proc.signout_date \
     FROM   c_specimen \
   LEFT OUTER JOIN p_special_proc \
                   ON c_specimen.specimen_id = p_special_proc.specimen_id \
   LEFT OUTER JOIN c_d_sprotype \
                   ON p_special_proc.sprotype_id = c_d_sprotype.id \
   LEFT OUTER JOIN  p_path_spproc \
                   ON c_specimen.specimen_id = p_path_spproc.specimen_id \
   LEFT OUTER JOIN  c_spec_worklist \
            ON c_specimen.specimen_id = c_spec_worklist.specimen_id  \
      WHERE ( c_spec_worklist.person_id = 'mwd51451') 	\
      AND ( c_spec_worklist.link_inst = p_special_proc.sp_inst) 	\
		//logger.debug(strSQL)"
try {
  var intResultSize = 0

	dbConnCoPath = DatabaseConnectionFactory.createDatabaseConnection('net.sourceforge.jtds.jdbc.Driver','jdbc:jtds:sybase://10.24.4.18:5000/coplive','report','report')
	result = dbConnCoPath.executeCachedQuery(strSQL);	
  
  if (intDebugLevel > 5) {
    logger.debug("SQL Result:" + result.toString())
  }


     intResultSize = result.size()
     var strEmailBody = "<tr> \
      <td> \
        Specimen Class\
      </td> \
      <td> \
        Accession ID\
      </td> \
      <td> \
        Accession Date\
      </td> \
      <td> \
        Part Description\
      </td> \
      <td> \
        Procedure Name (applies to molecular)\
      </td> \
      <td> \
        Procedure Order Date\
      </td> \
      </tr>"
     
     for (var i = 0; i < intResultSize; i++) {
     result.next()   

     //Sanitize variables
     var strPartDescription  = result.getString('part_description')
     var strProcName = result.getString('NAME')    
     var strSanitizedPartDescription = SanitizeVariableAddLeadingAndTrailingApostrophies(strPartDescription)
     var strSanitizedProcName = SanitizeVariableAddLeadingAndTrailingApostrophies(strProcName)

     // Put results on channel
     strEmailBody = strEmailBody + "<tr> \
      <td> \
        " + result.getString('specclass_id') + "\
      </td> \
      <td> \
        " + result.getString('specnum_formatted') + "\
      </td> \
      <td> \
      " + result.getString('accession_date') + "\
      </td> \
      <td> \
      " + strSanitizedPartDescription + "\
      </td> \
      <td> \
      " + strSanitizedProcName + "\
      </td> \
      <td> \
      " + result.getString('procorderdate') + "\
      </td> \
      </tr>"
     
     
     // '\\n' + i + result.getString('specclass_id') + ' ' + result.getString('specnum_formatted')
     
     //	channelMap.put ("strSpecclassID", result.getString('specclass_id'));
	//	channelMap.put ("strSpecNumFormatted", result.getString('specnum_formatted'));
	//	channelMap.put ("strAccessionDate", result.getString('accession_date'));
	//	channelMap.put ("strPartDescription", strSanitizedPartDescription);
	//	channelMap.put ("strSpecclassID", strSanitizedProcName);
	//	channelMap.put ("strProcOrderDate", result.getString('p_special_proc.order_date'));
	//	channelMap.put ("strSignoutDate", result.getString('p_special_proc.signout_date'));       
    }  // end for
                
    if (intDebugLevel > 5) {
      logger.debug(strEmailBody)
      logger.debug('END')
    }

    // Only process if there is a result.
    if (intResultSize > 0) {
      return(strEmailBody)
    }


}
catch(err) {
        logger.debug("Error Name:" + err.name + " Error Details: " + err + ". SQL:" + strSQL);
        
        }

 finally {
	if (dbConnCoPath) { 
		dbConnCoPath.close();
	}
}

function SanitizeVariableAddLeadingAndTrailingApostrophies(txt)  {
  if (txt == null) {
      return "null"
  } else {
      return "'" + EscapeApostrophe(txt) + "'"
  }
}
function EscapeApostrophe(txt)  {
  return (txt + "").replace(/\'/g, "''")
}

