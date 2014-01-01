/* 
 * Adapter for Medialink MWN WAPR300N wireless router.
 * 
 */
function Medialink_mwn_wapr300n(masterView) {

	// Router properties
	this.description = 'ResponseManager for MediaLink MWN_WAPR300N Router';
    this.manufacturer = 'MediaLink';
    this.model = 'MWN-WAPR300N';
    this.firmware_version = 'V5.07.42_en_MDL01';
    this.hardware_version = 'V3.0';
    this.parser_type = 'regex';
    this.comment = "This router's HTML is unparsable because its data is in JavaScript variables and it uses document.write() everywhere.";

	var filterType = null;
	var networkClients = [];

	var baseUrl = "http://192.168.1.1";
	var HttpClient = require('../HttpClient');
	var client = HttpClient();

	// Traffic stats includes info about all active
	// clients, including those with static IP addresses.
	// We don't really care about the stats, but we do
	// want to know the IP addresses of non-DHCP clients.
	function getTrafficStats() {
		var url = baseUrl + "/goform/updateIptAccount";
		client.get(url, null, function(e) {
			var lines = client.client.responseText.split("\n");
			for(var i=0; i < lines.length; i++) {
				var c = lines[i].replace("'", "").replace("\r", "");
				var data = c.split(";");
				var netClient = { 'hostname': 'Unknown Device', 'macAddress': '00:00:00:00:00:00', 'ip4Address': data[0], 'connectionType': data[7] };
				var entryExists = false;
				for(var j=0; j < networkClients.length; j++) {
					if(networkClients[j]['ip4Address'] == netClient['ip4Address']) {
						Ti.API.info("Entry exists for " + netClient['ip4Address']);
						entryExists = true;
						networkClients[j]['connectionType'] = netClient['connectionType'];
					}
				}
				if (entryExists == false) {
					Ti.API.info("Adding new entry for " + netClient['ip4Address']);
					networkClients.push(netClient);
				}				
			}
		});		
	}

	// Most clients are DHCP
	function getDHCPClientList() {
		var url = baseUrl + "/lan_dhcp_clients.asp";
		client.get(url, null, function(e) {
			var reClients = /var dhcpList=new Array\((.*)\);/;
			var clientString = null;
			try { clientString = reClients.exec(client.client.responseText)[1]; }
			catch(ex) {}
			var clientList = clientString.split(',');
			for(var i=0; i < clientList.length; i++) {
				var c = clientList[i].replace("'", "");
				var data = c.split(";");
				var netClient = { 'hostname': data[0], 'ip4Address': data[1], 'macAddress': data[2], 'connectionType': 'Wireless' };
				networkClients.push(netClient);
				Ti.API.info(data[1]);
			}
			getTrafficStats();
		});
	}	

	function getFilterType() {
		Ti.API.info("getFilterType()");
		var filterTypeUrl = baseUrl + "/wireless_filter.asp";
		client.get(filterTypeUrl, null, function(e) {
			var reFilterType = /var filter_mode = "(\w+)"/;
			try { filterType = reFilterType.exec(client.client.responseText)[1]; }
			catch(ex) {}
			Ti.API.info("FilterType = " + filterType);
			//Ti.API.info("Response Status = " + client.client.status);
			//Ti.API.info("Response Text = " + client.client.responseText);
			getDHCPClientList();
		});
	}

	function login (user, password) {
		Ti.API.info("login()");
		var loginUrl = baseUrl + "/LoginCheck";
		var data = {'checkEn': 0,
                	'Username': user,
                	'Password': password};
		client.post(loginUrl, data, function(e){
			var cookie = client.client.getResponseHeader('Set-Cookie');
			Ti.API.info("Cookie = " + cookie);
			getFilterType();
		});
	};

	this.getLoginCredentials = function () {
		Ti.API.info("getLoginCredentials()");
		var credUrl = baseUrl + "/login.asp";
		client.get(credUrl, null, function(e) {
			var user = null;
			var password = null;
			var reUser = /var username1="(.*)"/;
			var rePassword = /var password1="(.*)"/;
			try { user = reUser.exec(client.client.responseText)[1]; }
			catch(ex) {}
			try { password = rePassword.exec(client.client.responseText)[1]; }
			catch(ex) {}
			Ti.API.info("User = " + user);
			Ti.API.info("Password = " + password);
			login(user, password);
		});
	};
	
	return this;	
}

module.exports = Medialink_mwn_wapr300n;