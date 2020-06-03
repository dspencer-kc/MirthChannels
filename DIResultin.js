// Get results
/*
if (msg['OBX']['OBX.5']['OBX.5.1'].toString() === 'Negative') {
  msg['OBX']['OBX.5']['OBX.5.1'] = "SARS-CoV-2 (COVID-19) RNA NOT DETECTED"
 } else {
   msg['MSH']['MSH.11']['MSH.11.1'] = 'E'
 }
*/

// Get results
if (msg['OBX']['OBX.5']['OBX.5.1'].toString() === 'Negative') {
  msg['OBX']['OBX.5']['OBX.5.1'] = "SARS-CoV-2 (COVID-19) RNA NOT DETECTED"
 } else if (msg['OBX']['OBX.5']['OBX.5.1'].toString() === 'POSITIVE') {
   msg['OBX']['OBX.5']['OBX.5.1'] = "SARS-CoV-2 (COVID-19) DETECTED"
 } else {
   msg['MSH']['MSH.11']['MSH.11.1'] = 'E'
 }

var strCompleteDate = DateUtil.getCurrentDate('yyyyMMddHHmmss')
msg['OBR']['OBR.22']['OBR.22.1'] = strCompleteDate