SELECT 
       c_specimen.specclass_id, 
       c_specimen.specnum_formatted, 
       c_specimen.accession_date, 
	   p_part.part_description, 
       c_specimen.signout_date, 
       p_special_proc.sp_inst, 
       c_d_sprotype.NAME, 
       p_special_proc.order_date as procorderdate, 
       p_special_proc.signout_date 
      FROM   c_specimen 
       LEFT OUTER JOIN p_special_proc 
                    ON c_specimen.specimen_id = p_special_proc.specimen_id 
       LEFT OUTER JOIN c_d_sprotype 
                    ON p_special_proc.sprotype_id = c_d_sprotype.id 
		LEFT OUTER JOIN  p_pathologist 
                    ON c_specimen.specimen_id = p_pathologist.specimen_id 
		LEFT OUTER JOIN  p_part 
                    ON c_specimen.specimen_id = p_part.specimen_id 
       WHERE  c_specimen.signout_date = NULL 
		   AND ( p_pathologist.person_id = 'mwd51451') 		   
		   AND ( p_pathologist.person_id = 'mwd51451') 
		   AND ( c_specimen.specnum_year > 2018) 
       UNION 
       SELECT 
        c_specimen.specclass_id, 
        c_specimen.specnum_formatted, 
        c_specimen.accession_date, 
	   p_part.part_description, 
        c_specimen.signout_date, 
        p_special_proc.sp_inst, 
        c_d_sprotype.NAME, 
        p_special_proc.order_date as procorderdate, 
        p_special_proc.signout_date 
      FROM   c_specimen 
       LEFT OUTER JOIN p_special_proc 
                    ON c_specimen.specimen_id = p_special_proc.specimen_id 
       LEFT OUTER JOIN c_d_sprotype 
                    ON p_special_proc.sprotype_id = c_d_sprotype.id 
	  LEFT OUTER JOIN  p_path_spproc 
                    ON c_specimen.specimen_id = p_path_spproc.specimen_id 
	  LEFT OUTER JOIN  p_part 
             ON c_specimen.specimen_id = p_part.specimen_id 
       WHERE  p_special_proc.signout_date = NULL 
		   AND ( p_path_spproc.person_id = 'mwd51451') 		   
		   AND ( p_path_spproc.person_id LIKE 'mwd51451') 
		   AND ( c_specimen.specnum_year > 2018)
    UNION
    SELECT 
        c_specimen.specclass_id, 
        c_specimen.specnum_formatted, 
        c_specimen.accession_date, 
	      '' as p_part, 
        c_specimen.signout_date, 
        p_special_proc.sp_inst, 
        c_d_sprotype.NAME, 
        p_special_proc.order_date as procorderdate, 
        p_special_proc.signout_date 
      FROM   c_specimen 
    LEFT OUTER JOIN p_special_proc 
                    ON c_specimen.specimen_id = p_special_proc.specimen_id 
    LEFT OUTER JOIN c_d_sprotype 
                    ON p_special_proc.sprotype_id = c_d_sprotype.id 
	  LEFT OUTER JOIN  p_path_spproc 
                    ON c_specimen.specimen_id = p_path_spproc.specimen_id 
    LEFT OUTER JOIN  c_spec_worklist 
             ON c_specimen.specimen_id = c_spec_worklist.specimen_id  
       WHERE ( c_spec_worklist.person_id = 'mwd51451') 	
       AND ( c_spec_worklist.link_inst = p_special_proc.sp_inst) 	;
