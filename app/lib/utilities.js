/**
 * Returns the distance in kilometers between two lat/long points
 * @param {Float} lat1
 * @param {Float} lon1
 * @param {Float} lat2
 * @param {Float} lon2
 */

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}
exports.getDistanceFromLatLonInKm = getDistanceFromLatLonInKm;

/**
 * Returns the distance in miles between two lat/long points
 * @param {Float} lat1
 * @param {Float} lon1
 * @param {Float} lat2
 * @param {Float} lon2
 */

function getDistanceFromLatLonInMiles(lat1,lon1,lat2,lon2) {
  return kilometersToMiles(getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2));
}
exports.getDistanceFromLatLonInMiles = getDistanceFromLatLonInMiles;

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function kilometersToMiles(km){
	return km / 1.609344;
}
