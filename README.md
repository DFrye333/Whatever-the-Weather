Whatever the Weather
===
**Author: David Frye**  
**Date: 05-11-2015**  
**Version: 0.1**  

***Overview:***  
	*Whatever the Weather* allows users to retrieve targeted weather forecast 
	information for display on a visual line chart. This chart can be set 
	to display temperature, precipitation, or wind data on a scale of hours 
	or days (dependent upon date specification in the search, specific dates 
	lack the daily scale for technical reasons related to the Forecast.io 
	API). Users can save their search information (contingent upon, at the 
	time of this writing, HTML5 Local Storage availability from the user's 
	web browser) and use it for reference or to replicate a past search. 
	Google Maps integration allows users to search via pinpointed locations 
	on a map (a double-click autofills the search form), as well as manually 
	through the provided text entry form.

***Installation:***  
	*Whatever the Weather* is a purely-client-side web application. Aside from 
	normal webpage setup (serving from a user-facing web server, etc.), the 
	only extra requirement is the provision of a valid Forecast.io API key. 
	*Whatever the Weather* looks for this key in `resource/api_key.txt` by 
	default, so filling that file with a key will allow *Whatever the Weather* 
	to query the Forecast.io API to get weather data.

	Whatever the Weather - Default Directory Structure:
		Whatever the Weather
		|-------html
		|        |-------wtw.html
		|
		|-------resource
		|        |-------api_key.txt
		|        |-------example_forecast.json
		|        |-------example_forecast_specific.json
		|        |-------favicon.png
		|
		|-------script
		|        |-------chart.min.js
		|        |-------modernizr.js
		|        |-------wtw.js
		|        |-------wtw_test.js
		|
		|-------style
		         |-------wtw.css
		         |-------wtw.css.map
		         |-------wtw.scss

***Libraries/Dependencies/Preprocessors/Tools:***  
* Google Maps
* Forecast.io
* jQuery
* Chart.js
* Modernizr.js
* Google Fonts
* QUnit
* SCSS
* HTML5 Local Storage

***Google Maps:***  
The *Google Maps API* is used for geocoding and reverse-geocoding, 
allowing for the user to have a map that centers on their forecast 
search location, as well as allowing the user to specify forecast 
locations through the map itself by double-clicking on a location to 
autofill their search box.

***Forecast.io:***  
*Forecast.io* provides all weather data through their API, sourcing 
weather from dozens of different weather monitoring facilities around 
the globe. This allows for forecast data to be provided to nearly any 
location on the planet at nearly any specified date.

***jQuery:***  
*jQuery* is very useful for DOM manipulation, callback binding, and AJAX 
calls (such as when querying the Forecast.io API).

***Chart.js:***  
*Chart.js* is used to make an eye-catching-yet-informative line chart of 
forecast data. This chart allows for visual representation of 
temperature, precipitation, and wind data on a scale of hours of days 
(dependent on whether a date was specified with the search or not). The 
chart is also labeled with place and forecast summary information.

***Modernizr.js:***  
*Modernizr.js* is used sparingly (at the time of this writing, only once) 
to determine if HTML5 Local Storage is available in the execution 
environment before attempting to use it.

***Google Fonts:***  
*Google Fonts* is used to style much of the text on the Whatever the 
Weather webpage.

***QUnit:***  
*QUnit* unit testing is currently in-place for `wtw.js`. While testing was
done after-the-fact rather than in a TDD manner, I still tried to get 
someunit tests done in the time that I had to work on this project. 
Ideally, test coverage would be greatly extended, but the unit testing 
integration is there. Aside from unit testing, most testing was pseudo-
usability testing done with myself as the user (not great, but better 
than nothing).

***SCSS:***  
The *SASS (Syntactically Awesome Style Sheets)* CSS preprocessor is used 
for its SCSS syntax. This developer tool is used to make writing CSS 
easier by providing extra functionality atop the CSS language.

***HTML5 Local Storage:***  
While less of a full-on database than a simple key-value store, 
*HTML5 Local Storage* was chosen as the client-side data storage solution 
because of the simple nature of the data storage requirements. By 
storing timestamp keys and address + date value strings, a simple user 
search history has been created that integrates very easily with 
JavaScript and stores all user searches locally through the user's own 
browser.

***Important Notes:***  
* As Forecast.io API access requires an API key, `wtw.js` sources an API 
key from the file `resource/api_key.txt` by default. This file is a 
plain text file that holds nothing more than a valid Forecast.io API 
key. For obvious reasons, this key file is not provided with this 
package and must be provided by the webpage administrator.
* The `DEBUG` flag in `wtw.js` allows *Whatever the Weather* to pull forecast 
data from aJSON file holding a Forecast.io forecast object. This allows 
for debugging or other forms of testing while avoiding metered calls to 
the actual Forecast.io API. The URL points to the local file 
`resource/example_forecast.json` by default, as defined in `wtw.js`. 
There is also a commented-out line below the above string that points to 
`resource/example_forecast_specific.json`, an example forecast object 
that represents forecast data for a specific time.
* The `TEST` flag in `wtw.js` runs associated QUnit tests from `test.js`.
* The words "place" and "location" mean distinctly different things in 
*Whatever the Weather*. While "place" denotes a human-friendly address 
(whether it be an official street address, city name, or anything else), 
a "location" specifically denotes a latitude/longitude pair.