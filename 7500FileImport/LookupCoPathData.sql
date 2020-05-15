20-1563 CB

Lookup the following:


var strMRN = '12345'
var strMRNClientID = '99999'
var strLastName = 'B'
var strFirstName = 'CTest'
var strAccNumber = 'CV20-2'
var strProcInst = '1'

mssql:
SELECT c_specimen.specclass_id, c_specimen.specnum_year, c_specimen.specnum_num, r_pat_demograph.lastname, r_pat_demograph.firstname, First(r_medrec.medrec_num) AS FirstOfmedrec_num, First(c_d_client.intf_link) AS FirstOfintf_link
FROM ((r_pat_demograph INNER JOIN r_medrec ON r_pat_demograph.patdemog_id = r_medrec.patdemog_id) INNER JOIN c_specimen ON r_pat_demograph.patdemog_id = c_specimen.patdemog_id) INNER JOIN c_d_client ON r_medrec.client_id = c_d_client.id
GROUP BY c_specimen.specclass_id, c_specimen.specnum_year, c_specimen.specnum_num, r_pat_demograph.lastname, r_pat_demograph.firstname
HAVING (((c_specimen.specclass_id)="CV") AND ((c_specimen.specnum_year)=2020) AND ((c_specimen.specnum_num)=1563));

sybase
SELECT TOP 1 c_specimen.specclass_id, c_specimen.specnum_year, c_specimen.specnum_num, r_pat_demograph.lastname, r_pat_demograph.firstname, r_medrec.medrec_num, c_d_client.intf_link
FROM ((r_pat_demograph INNER JOIN r_medrec ON r_pat_demograph.patdemog_id = r_medrec.patdemog_id) INNER JOIN c_specimen ON r_pat_demograph.patdemog_id = c_specimen.patdemog_id) INNER JOIN c_d_client ON r_medrec.client_id = c_d_client.id
WHERE (((c_specimen.specclass_id)="CV") AND ((c_specimen.specnum_year)=2020) AND ((c_specimen.specnum_num)=1563));
