function HttpClient(options){
	
	var opts = options || { timeout: 3000, onerror: this.onError };
	var client = Ti.Network.createHTTPClient(opts);
	
	this.onError = function (e) {
		Ti.API.debug("STATUS: " + client.status);
		Ti.API.debug("TEXT:   " + client.responseText);
		Ti.API.debug("ERROR:  " + e.error);
		alert('Error communicating with router: ' + e.error);
	};
	
	this.dumpResponse = function (e){
		Ti.API.info("STATUS: " + client.status);		
		Ti.API.info("TEXT:   " + client.responseText);			
	};
	
	this.get = function (url, data, callback) {
		client.onload = callback;
		client.open("GET", url);
		client.send(data);
	};
	
	this.post = function (url, data, callback) {
		client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		client.onload = callback;
		client.open("POST", url);
		client.send(data);		
	};

	return this;
}

module.exports = HttpClient;