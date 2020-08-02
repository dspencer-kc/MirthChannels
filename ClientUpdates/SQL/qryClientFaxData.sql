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
    (IF c_d_client.enable_chute='Y' THEN c_d_reportchute.phone
  ELSE ''
  END), 
   c_d_reportchute.phone,
   c_d_reportchute.output_specs
  from c_d_client
  LEFT JOIN c_d_reportchute ON c_d_client.chute_id = c_d_reportchute.id
  where c_d_client.active_flag = 'A'