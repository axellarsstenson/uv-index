// Copyright 2018 Axel Stenson. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

// This is an alternate version of the UV Index API that provides hourly
// measurements. It requests index info once a day.

var url = "";
var user_zip = 55406;
var full_days_log = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

function get_daily_uv_info(){
  var url = ('https://iaspub.epa.gov/enviro/efservice/getEnvirofactsUVHOURLY/ZIP/' + user_zip + '/json');
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if (xhr.readyState == 4) {
      var uv_json = JSON.parse(xhr.responseText);
      var i = 0;
      for (i = 0; i < 21; i++){
        full_days_log[((i + 6) % 24)] = uv_json[i].UV_VALUE;
      }
      set_updated_badge_text();
    }
  }
  xhr.open("GET", url, true);
  xhr.send();
} // end get_daily_uv_info()

function reload_info(){
  	get_daily_uv_info();
    set_updated_badge_text();
}

function set_updated_badge_text(){  
  var curr_Date = new Date();
  var hour = curr_Date.getHours();
  var next_hour = (hour + 1) % 24;
  var minutes = (curr_Date.getMinutes() + 1) / 60;
  
  // Get two values for this hour and the coming hour.
  var uv_value_this = full_days_log[hour];
  var uv_value_next = full_days_log[next_hour];
  
  // Calculate the likely UV Index by weighting the two values by minutes into the hour.
  var uv_value_long = (uv_value_this * minutes) + (uv_value_next * (1 - minutes));
  var uv_value = +uv_value_long.toFixed(1);

  chrome.browserAction.setBadgeText({text: (uv_value + "")});
  set_updated_badge_color(uv_value);
} // end set_updated_badge_text()

function set_updated_badge_color(uv_value){
  if (uv_value < 3.0) {
    chrome.browserAction.setBadgeBackgroundColor({color: '#33b841'});
  }
  else if (uv_value < 6.0) {
    chrome.browserAction.setBadgeBackgroundColor({color: '#fec54b'});
  }
  else if (uv_value < 8.0) {
    chrome.browserAction.setBadgeBackgroundColor({color: '#ff7243'});
  }
  else if (uv_value < 11.0) {
    chrome.browserAction.setBadgeBackgroundColor({color: '#fd0122'});
  }
  else {
    chrome.browserAction.setBadgeBackgroundColor({color: '#8773f6'});
  }
} // end set_updated_badge_color()


function get_location() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(loc_success, loc_error);
  }
} // end getLocation()

function loc_success(position) {
  let zip = position.coords.postalCode;
  user_zip = zip;
  chrome.browserAction.setBadgeText({text: (zip + "")});
} // end loc_success()

function loc_error() {
    console.log("Location error in UV Helper");
} // end loc_error()


get_location();
chrome.browserAction.setBadgeBackgroundColor({color: '#535860'});
chrome.browserAction.setBadgeText({ text: "~" });
reload_info();

setInterval(set_updated_badge_text, 600000);
setInterval(reload_info, 7200000);
setInterval(get_location, 7200000);
