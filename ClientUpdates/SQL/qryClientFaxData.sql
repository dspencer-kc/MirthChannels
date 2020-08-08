SELECT c_d_client.id, c_d_client.name, c_d_client.enable_chute, c_d_reportchute.phone, c_d_reportchute.output_specs
FROM c_d_client LEFT JOIN c_d_reportchute ON c_d_client.chute_id = c_d_reportchute.id;

 /*CoPath get all updates sense last updated time*/
  select name, intf_link, state_id, city, street1, zip, last_updated, id, c_d_client.enable_chute, c_d_reportchute.phone, c_d_reportchute.output_specs
  from c_d_client
  LEFT JOIN c_d_reportchute ON c_d_client.chute_id = c_d_reportchute.id
  where active_flag = 'A' and last_updated > '"+ strLastUpdate + "'""

  
  /*CoPath get all updates sense last updated time*/
  select c_d_client.name, intf_link, state_id, city, street1, zip, c_d_client.last_updated, c_d_client.id, c_d_client.enable_chute, c_d_reportchute.phone, c_d_reportchute.output_specs
  from c_d_client
  LEFT JOIN c_d_reportchute ON c_d_client.chute_id = c_d_reportchute.id
  where c_d_client.active_flag = 'A and c_d_client.last_updated > '"+ strLastUpdate + "'"';

  if (c_d_client.enable_chute = 'A') {
      str
  }
 (IF Price<1000 THEN 1
  ELSE 2
  END) 

   /*CoPath get all updates sense last updated time*/
  select c_d_client.name,
   intf_link, 
   state_id, 
   city, 
   street1, 
   zip, 
   c_d_client.last_updated,
   c_d_client.id,
   c_d_client.enable_chute,
   substr(c_d_reportchute.output_specs, 6, 1) as DistrMethod,
    CASE
      WHEN (c_d_client.enable_chute = 'Y' AND 1=1)
      THEN c_d_reportchute.phone
    ELSE ''
    END, 
   c_d_reportchute.phone,
   c_d_reportchute.output_specs
  from c_d_client
  LEFT JOIN c_d_reportchute ON c_d_client.chute_id = c_d_reportchute.id
  where c_d_client.active_flag = 'A';

     /*CoPath get all updates since last updated time*/
  select c_d_client.name,
   intf_link, 
   state_id, 
   city, 
   street1, 
   zip, 
   c_d_client.last_updated,
   c_d_client.id,
    CASE
      WHEN (c_d_client.enable_chute = 'Y' AND RIGHT(LEFT(c_d_reportchute.output_specs, 6),1) ='F')
      THEN c_d_reportchute.phone
    ELSE null
    END as 'Fax1', 
    CASE
      WHEN (c_d_client.enable_chute = 'Y' AND RIGHT(LEFT(c_d_reportchute.output_specs, 6),1) ='P')
      THEN 'Y'
    ELSE null
    END as 'Print'
  from c_d_client
  LEFT JOIN c_d_reportchute ON c_d_client.chute_id = c_d_reportchute.id
  where c_d_client.active_flag = 'A';