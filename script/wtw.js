// wtw.js
// Author: David Frye

// Application name.
const APPLICATION_NAME = "Whatever the Weather";
// Application version.
const APPLICATION_VERSION = "0.1";
// Application author.
const APPLICATION_AUTHOR = "David Frye";

// Log (information) prefix.
const LOG_INFORMATION = "(Whatever the Weather | Information): ";
// Log (error) prefix.
const LOG_ERROR = "(Whatever the Weather | Error): "

// Debug flag.
const DEBUG = false;
// Test flag. Ensure that QUnit CSS and JS dependencies are included in HTML to run the tests.
const TEST = false;

// Default weather place.
const DEFAULT_PLACE = "Seattle, WA";
// Default display mode.
const DEFAULT_DISPLAY_MODE = "temperature";
// Default range mode.
const DEFAULT_RANGE_MODE = "hourly";
// Path to a text file containing a valid Forecast.io API key.
const PATH_API_KEY = "resource/api_key.html";
// Path to a JSON file containing a test forecast.
const PATH_FORECAST_TEST = "resource/example_forecast.json";
// const PATH_FORECAST_TEST = "resource/example_forecast_specific.json";

// Google Map.
var map;
// Google Geocoder.
var geocoder;

// Last-queried forecast.
var forecast;

// Forecast canvas.
var forecast_canvas;
// Forecast context.
var forecast_context;

// Forecast chart.
var forecast_chart;
// Chart input data.
var visualization_data;
// Forecast chart display mode.
var display_mode;
// Forecast chart range mode.
var range_mode;

// User-inputted place.
var user_place;
// User-inputted location.
var user_location;
// User-inputted date.
var user_date;

// HTML5 local storage.
var local_storage;

// Update the data display chart.
function display_update()
{
	// Process forecast into chart input.
	visualization_data = process_forecast(forecast);
	// Update chart visuals.
	visualize(visualization_data, display_mode);
}

// Script setup of map, geocoder, callbacks, etc..
function initialize()
{
	console.log(LOG_INFORMATION + APPLICATION_NAME + " v" + APPLICATION_VERSION + " by " + APPLICATION_AUTHOR + " initializing...");

	// Initialize Google Map and Geocoder.
	var map_options = 
	{
		zoom : 15,
	};
	map = new google.maps.Map($('#map')[0], map_options);
	geocoder = new google.maps.Geocoder();

	// Initialize forecast chart.
	forecast_chart = null;
	forecast_canvas = $('#forecast_chart')[0];
	forecast_context = forecast_canvas.getContext("2d");

	// Initialize display to current location.
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(
			function(position)
			{
				var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				// Update the user's place with the browser's reverse-geocoded location.
				geocoder.geocode({'latLng': location},
					function(geocoder_result, status)
					{
						// Ensure that reverse-geocoding was successful.
						if (status == google.maps.GeocoderStatus.OK)
						{
							user_place = geocoder_result[0].formatted_address;
							// Update the user's location with the browser location.
							location_update(location);
						}
					}
				);
			}
		);
	}
	// Initialize display to default location.
	else
	{
		geocode(DEFAULT_PLACE);
	}

	// Check for availability of HTML5 Local Storage.
	if (Modernizr.localstorage)
	{
		local_storage = window.localStorage;
	}
	// If HTML5 Local Storage is not available, null "local_storage" and hide the "clear_history" button.
	else
	{
		local_storage = null;
		$('#clear_history').hide();
	}

	// Initialize display to default mode.
	display_mode = DEFAULT_DISPLAY_MODE;
	$('#display_mode_' + DEFAULT_DISPLAY_MODE).addClass('selected');

	// Initialize range to default mode.
	range_mode = DEFAULT_RANGE_MODE;
	$('#range_mode_' + DEFAULT_RANGE_MODE).addClass('selected');

	// Update user history list.
	history_update();

	// Initialize all object callbacks.
	initialize_callbacks();

	// Run testing code (if available).
	if (TEST)
	{
		if (typeof tests_run === 'function')
		{
			tests_run();
		}
	}
}

// Geocode a "place" string.
function geocode(place)
{
	var geocoder_request = 
	{
		"address" : place,
	}

	geocoder.geocode(geocoder_request, 
		function(geocoder_result, status)
		{
			// Ensure that geocoding was successful.
			if (status == google.maps.GeocoderStatus.OK)
			{
				user_place = place;
				location_update(geocoder_result[0].geometry.location);
			}
		}
	);
}

// Update the user's current forecast location.
function location_update(location)
{
	user_location = location;
	map.setCenter(user_location);
	get_weather(user_location);
}

// Get a weather forecast for the given location.
function get_weather(location)
{
	// Grab Forecast.io API key from a local file.
	$.ajax({
		url : PATH_API_KEY,
		dataType : 'text',
		success : function(api_key)
		{
			if (DEBUG)
			{
				// Grab example forecast from local file "example_forecast.json".
				$.getJSON(PATH_FORECAST_TEST,
					function(data)
					{
						// Update the last-queried forecast.
						forecast = data;
						// Update visual chart from forecast data.
						display_update();
					}
				);
			}
			else
			{
				// Create Forecast.io URL.
				var forecast_url = "https://api.forecast.io/forecast/" + api_key + "/" + location.lat() + "," + location.lng();
				if (user_date != undefined && !isNaN(user_date))
				{
					forecast_url += "," + user_date;
				}
				console.log(LOG_INFORMATION + "Calling Forecast.io with: " + forecast_url);
				// Grab forecast JSON from Forecast.io API.
				$.ajax({
					url : forecast_url,
					dataType : 'jsonp',  //use jsonp data type in order to perform cross domain ajax
					crossDomain : true,
					success : function(data)
					{
						// Update the last-queried forecast.
						forecast = data;
						// Update visual chart from forecast data.
						display_update();
					},
					error : function(error)
					{
						console.log(LOG_ERROR + "Error calling Forecast.io.");
					}
				});
			}
		},
		error : function(error)
		{
			console.log(LOG_ERROR + "Error obtaining Forecast.io API key.");
		}
	});
}

// Process the forecast JSON into chart input.
function process_forecast(forecast)
{
	var visualization_data = 
	{
		temperature_data : {},
		precipitation_data : 
		{
			labels : [],
			datasets : 
			[
				{
					label : "Precipitation Probability",
					fillColor :"rgba(128, 128, 200, 0.2)",
					strokeColor : "rgba(128, 128, 200, 1)",
					pointColor : "rgba(128, 128, 200, 1)",
					pointStrokeColor : "#FFFFFF",
					pointHighlightFill : "#FFFFFF",
					pointHighlightStroke : "rgba(128, 128, 200, 1)",
					data: []
				}
			]
		},
		wind_data : 
		{
			labels : [],
			datasets : 
			[
				{
					label : "Wind Speed",
					fillColor :"rgba(127, 255, 212, 0.5)",
					strokeColor : "rgba(127, 255, 212, 1)",
					pointColor : "rgba(127, 255, 212, 1)",
					pointStrokeColor : "#FFFFFF",
					pointHighlightFill : "#FFFFFF",
					pointHighlightStroke : "rgba(127, 255, 212, 1)",
					data: [],
				}
			]
		},
		summary : "",
	}

	// Only allow daily range mode as an option if more than one daily data point exists (the Forecast.io API time-specific call returns only one daily data point).
	if (forecast["daily"]["data"].length > 1)
	{
		$('#range_mode_daily').show();
	}
	else
	{
		$('#range_mode_daily').hide();

		// Revert range to default mode.
		range_mode = DEFAULT_RANGE_MODE;
		$('.range_mode').removeClass('selected');
		$('#range_mode_' + DEFAULT_RANGE_MODE).addClass('selected');
	}

	// Hourly range.
	if (range_mode == "hourly")
	{
		// Initialize chart input.
		visualization_data["temperature_data"]["labels"] = [];
		visualization_data["temperature_data"]["datasets"] = 
		[
			{
				"label" : "Temperature",
				"fillColor" :"rgba(220, 120, 120, 0.2)",
				"strokeColor" : "rgba(220, 120, 120, 1)",
				"pointColor" : "rgba(220, 120, 120, 1)",
				"pointStrokeColor" : "#FFFFFF",
				"pointHighlightFill" : "#FFFFFF",
				"pointHighlightStroke" : "rgba(220, 120, 120, 1)",
				data: [],
			},
		];
		// Label the chart by hour of the day, and fill data for the temperature line.
		for (var i = 0; i <  forecast["hourly"]["data"].length; ++i)
		{
			visualization_data["temperature_data"]["labels"][i] = new Date(forecast["hourly"]["data"][i]["time"] * 1000).toLocaleString();
			visualization_data["temperature_data"]["datasets"][0]["data"][i] = Math.round(forecast["hourly"]["data"][i]["temperature"]);
		}

		// Extract the hourly weather summary.
		visualization_data["summary"] = forecast["hourly"]["summary"];
	}
	// Daily range.
	else if (range_mode == "daily")
	{
		// Initialize chart input.
		visualization_data["temperature_data"]["labels"] = [];
		visualization_data["temperature_data"]["datasets"] = 
		[
			{
				"label" : "High Temperature",
				"fillColor" :"rgba(220, 120, 120, 0.2)",
				"strokeColor" : "rgba(220, 120, 120, 1)",
				"pointColor" : "rgba(220, 120, 120, 1)",
				"pointStrokeColor" : "#FFFFFF",
				"pointHighlightFill" : "#FFFFFF",
				"pointHighlightStroke" : "rgba(220, 120, 120, 1)",
				data: [],
			},
			{
				"label" : "Low Temperature",
				"fillColor" : "rgba(0, 255, 255, 0.4)",
				"strokeColor" : "rgba(0, 255, 255, 1)",
				"pointColor" : "rgba(0, 255, 255, 1)",
				"pointStrokeColor" : "#FFFFFF",
				"pointHighlightFill" : "#FFFFFF",
				"pointHighlightStroke" : "rgba(0, 255, 255, 1)",
				data: [],
			},
		];

		// Label the chart by day of the week, and fill data for the high/low temperature lines.
		for (var i = 0; i < forecast["daily"]["data"].length; ++i)
		{
			visualization_data["temperature_data"]["labels"][i] = new Date(forecast["daily"]["data"][i]["time"] * 1000).toDateString();
			visualization_data["temperature_data"]["datasets"][0]["data"][i] = Math.round(forecast["daily"]["data"][i]["temperatureMax"]);
			visualization_data["temperature_data"]["datasets"][1]["data"][i] = Math.round(forecast["daily"]["data"][i]["temperatureMin"]);
		}

		// Extract the hourly weather summary.
		visualization_data["summary"] = forecast["daily"]["summary"];
	}

	// Label the chart with the time range, and fill data for the precipitation probability line.
	for (var i = 0; i < forecast[range_mode]["data"].length; ++i)
	{
		visualization_data["precipitation_data"]["labels"][i] = new Date(forecast[range_mode]["data"][i]["time"] * 1000).toLocaleString();
		visualization_data["precipitation_data"]["datasets"][0]["data"][i] = forecast[range_mode]["data"][i]["precipProbability"];
	}

	// Label the chart with the time range, and fill data for the wind speed line.
	for (var i = 0; i < forecast[range_mode]["data"].length; ++i)
	{
		visualization_data["wind_data"]["labels"][i] = new Date(forecast[range_mode]["data"][i]["time"] * 1000).toLocaleString();
		visualization_data["wind_data"]["datasets"][0]["data"][i] = Math.round(forecast[range_mode]["data"][i]["windSpeed"]);
	}

	return visualization_data;
}

// Create the forecast visualizaton.
function visualize(visualization_data, display_mode)
{
	// Options for temperature chart.
	var temperature_options = 
	{
		multiTooltipTemplate : "<%= value %> F",
		pointHitDetectionRadius : 13,
		tooltipTemplate : "<%if (label){%><%=label%>: <%}%><%= value %> F",
	};
	// Options for precipitation chart.
	var precipitation_options = 
	{
		pointHitDetectionRadius : 13,
		tooltipTemplate : "<%if (label){%><%=label%>: <%}%><%= value %> %",
	};
	// Options for wind chart.
	var wind_options = 
	{
		multiTooltipTemplate : "<%= value %> MPH",
		pointHitDetectionRadius : 13,
		tooltipTemplate : "<%if (label){%><%=label%>: <%}%><%= value %> MPH",
	};

	// Clear currently-displayed chart.
	if (forecast_chart != null)
	{
		forecast_chart.destroy();
	}

	// Display precipitation chart.
	if (display_mode == "precipitation")
	{
		forecast_chart = new Chart(forecast_context).Line(visualization_data["precipitation_data"], precipitation_options);
	}
	// Display wind chart.
	else if (display_mode == "wind")
	{
		forecast_chart = new Chart(forecast_context).Line(visualization_data["wind_data"], wind_options);
	}
	// Display temperature chart by default.
	else
	{
		forecast_chart = new Chart(forecast_context).Line(visualization_data["temperature_data"], temperature_options);
	}

	// Display updated visual chart.
	forecast_chart.update();

	// Display weather summary.
	$('#forecast_summary').html("<strong>Forecast Summary: </strong>" + visualization_data["summary"]);

	// Display weather place.
	$('#forecast_place').html("<strong>Place: </strong>" + user_place);
}

// Add query to user history.
function history_add(place, date)
{
	// Ensure that HTML5 Local Storage is available before using it.
	if (local_storage)
	{
		// Check the validity of the given date before adding it to the database.
		var entry = place;
		if (new Date(parseInt(date)) != "Invalid Date")
		{
			entry += "|" + date;
		}

		console.log(LOG_INFORMATION + "Adding to user history: " + entry + ".");
		local_storage.setItem(new Date(), entry);

		// Update user history list.
		history_update();
	}
}

// Update the history display list.
function history_update()
{
	// Ensure that HTML5 Local Storage is available before using it.
	if (local_storage)
	{
		// Clear the history list.
		$('#history_list').empty();

		// Fill the history list.
		for (var i = 0; i < local_storage.length; ++i)
		{
			// Split the database entry into address/date pairs.
			var value = local_storage.getItem(local_storage.key(i));
			var splitValue = value.split("|");

			// Create the history list entry from the address/date pairs.
			var history_list_entry = "<li><button class=\"history_list_entry\" value=" + value.split(" ").join("_") + "><strong>Address:</strong> " + splitValue[0];

			// If a date is included in the database entry, add it to the list entry.
			if (splitValue.length == 2)
			{
				history_list_entry += "<span class=\"history_list_entry_date\"><strong>\tDate:</strong> " + new Date(parseInt(splitValue[1]) * 1000).toLocaleDateString() + "</span>";
			}

			// Finalize and add the new entry to the history list.
			history_list_entry += "</button></li>";
			$('#history_list').prepend(history_list_entry);
		}

		// Fill the history box with a default message when there is no user history.
		if (local_storage.length == 0)
		{
			$('#history_list').append("<h3>History is empty. Why not search for forecasts now?</h3>");
		}

		// Autofill input boxes from user history. This callback (apparently) must be rebound every time the history list is updated.
		$('.history_list_entry').dblclick(
			function()
			{
				history_autofill($(this).val().split("_").join(" "));
			}
		);
	}
	// If HTML5 Local Storage is not available, fill the history box with an error message for the user.
	else
	{
		$('#history_list').append("<h3>HTML5 Local Storage is not supported by your browser. Sorry!</h3>");
	}
}

// Autofill input fields with previous search query.
function history_autofill(query)
{
	// Ensure that HTML5 Local Storage is available before using it.
	if (local_storage)
	{
		// Autofill the "Place" input box.
		var splitQuery = query.split("|");
		$('#place').val(splitQuery[0]);

		// Autofill the "Date" input box with either a valid given date, or a default value. Convert back from the local timezone offset to UTC, as the date input works in UTC.
		if (splitQuery.length == 2)
		{
			var local_date = new Date(parseInt(splitQuery[1] * 1000));
			$('#date').val(new Date((splitQuery[1] * 1000) - (local_date.getTimezoneOffset() * 60)).toISOString().slice(0, 10));
		}
		else
		{
			$('#date').val("");
		}
		$('#date').trigger('change');
	}
}

// Clear entire user history.
function history_clear()
{
	// Ensure that HTML5 Local Storage is available before using it.
	if (local_storage)
	{
		console.log(LOG_INFORMATION + "Clearing user search history.");
		local_storage.clear();

		// Update user history list.
		history_update();
	}
}

// Initialize all object callback settings.
function initialize_callbacks()
{
	// Google Maps double-click callback.
	google.maps.event.addListener(map, "dblclick",
		function(e)
		{
			// Reverse-geocode the double-clicked location and fill the "Place" box with the result.
			geocoder.geocode({'latLng': e.latLng},
				function(geocoder_result, status)
				{
					// Ensure that reverse-geocoding was successful.
					if (status == google.maps.GeocoderStatus.OK)
					{
						$('#place').val(geocoder_result[0].formatted_address);
					}
				}
			);
		}
	);

	// Update the user's current forecast place and location when the "Get Weather" button is clicked.
	$('#get_weather').click(
		function()
		{
			// Translate the UTC input date into a local datetime.
			var utc_date = new Date($('#date').val());
			user_date = (utc_date.getTime() / 1000) + (utc_date.getTimezoneOffset() * 60);

			// Geocode and update the user location.
			var place = $('#place').val();
			if (place === "")
			{
				place = DEFAULT_PLACE
			}
			geocode(place);

			// Add this search to the user's search history.
			history_add(place, user_date);
		}
	);

	// Change the display mode when a display mode button is clicked.
	$('.display_mode').click(
		function()
		{
			if (!$(this).hasClass('selected'))
			{
				display_mode = $(this).val();
				$('.display_mode').removeClass('selected');
				$(this).addClass('selected');

				display_update();
			}
		}
	);

	// Change the range mode when a range mode button is clicked.
	$('.range_mode').click(
		function()
		{
			if (!$(this).hasClass('selected'))
			{
				range_mode = $(this).val();
				$('.range_mode').removeClass('selected');
				$(this).addClass('selected');

				display_update();
			}
		}
	);

	// Allow search submission via Enter/Return key.
	$('#place').keypress(
		function(event)
		{
			if (event.keyCode == 13)
			{
				$('#get_weather').trigger('click');
			}
		}
	);

	// clear_history button click callback.
	$('#clear_history').click(history_clear);
}

// Launch into initialization after page load.
$(document).ready(initialize);