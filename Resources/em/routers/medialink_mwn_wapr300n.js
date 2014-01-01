/* 
 * Adapter for Medialink MWN WAPR300N wireless router.
 * 
 */
function Medialink_mwn_wapr300n() {

	// Router properties
	this.description = 'ResponseManager for MediaLink MWN_WAPR300N Router';
    this.manufacturer = 'MediaLink';
    this.model = 'MWN-WAPR300N';
    this.firmware_version = 'V5.07.42_en_MDL01';
    this.hardware_version = 'V3.0';
    this.parser_type = 'regex';
    this.comment = "This router's HTML is unparsable because its data is in JavaScript variables and it uses document.write() everywhere.";

	var baseUrl = "http://192.168.1.1";
	var HttpClient = require('../HttpClient');
	var client = HttpClient();

	this.getLoginCredentials = function () {
		client.get(baseUrl, null, client.dumpResponse);
	};

	return this;	
}

module.exports = Medialink_mwn_wapr300n;