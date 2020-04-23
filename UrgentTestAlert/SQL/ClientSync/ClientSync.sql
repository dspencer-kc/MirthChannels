/* Mysql get latest update time*/
select last_updated from tblClientAddress group by last_updated order by last_updated desc limit 1

/*CoPath get all updates sense last updated time*/
select name, intf_link, state_id, city, street1, zip, last_updated from c_d_client where active_flag = 'A' and last_updated > '2020-04-22 00:00:00';

/* Insert each row*/
INSERT INTO UrgentProcedureTracking.tblClientAddress
(name,
intf_link,
state_id,
city,
street1,
zip,
last_updated)
VALUES
(<{name: }>,
<{intf_link: }>,
<{state_id: }>,
<{city: }>,
<{street1: }>,
<{zip: }>,
<{last_updated: CURRENT_TIMESTAMP}>);