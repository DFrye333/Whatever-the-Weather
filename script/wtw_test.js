// wtw_test.js
// Author: David Frye

// Webpage testing code.
function tests_run()
{
	console.log(LOG_INFORMATION + "Initializing testing...");

	// Add QUnit fixture to body.
	$('body').append("<div id=\"qunit\"></div>");
	$('body').append("<div id=\"qunit-fixture\"></div>");

	// Run unit tests after a delay (to hopefully allow for all normal initialization callbacks to complete before modifying anything further).
	setTimeout(
		function()
		{
			console.log(LOG_INFORMATION + "Running test #0...");
			test_get_weather_0();
			// Ensure that HTML5 Local Storage is available before testing it.
			if (local_storage)
			{
				console.log(LOG_INFORMATION + "Running test #1...");
				test_history_add_0();
			}
			// Ensure that HTML5 Local Storage is available before testing it.
			if (local_storage)
			{
				console.log(LOG_INFORMATION + "Running test #2...");
				test_history_clear_0();
			}

			console.log(LOG_INFORMATION + "Testing complete!");
		},
		5000
	);
}

// Test get_weather button click handling functionality.
function test_get_weather_0()
{
	var test_place = "Birmingham, UK";
	var test_date = "2015-05-12";

	var expected_place = test_place;
	var expected_date = 1431388800 + (new Date().getTimezoneOffset() * 60);
	var expected_location_latitiude = 52.4774376;
	var expected_location_longitude = -1.8636315;

	$('#place').val(test_place);
	$('#date').val(test_date);

	$('#get_weather').trigger('click');

	setTimeout(
		function()
		{
			QUnit.test("\"Get Weather\" button click",
				function(assert)
				{
					assert.equal(user_place, expected_place, "Expected value: \"" + expected_place + "\"");
					assert.equal(user_date, expected_date, "Expected value: \"" + expected_date + "\"");
					assert.equal(Math.round(forecast["latitude"] * 10) / 10, Math.round(expected_location_latitiude * 10) / 10, "Expected (approximate) value: \"" + Math.round(expected_location_latitiude * 10) / 10 + "\"");
					assert.equal(Math.round(forecast["longitude"] * 10) / 10, Math.round(expected_location_longitude * 10) / 10, "Expected (approximate) value: \"" + Math.round(expected_location_longitude * 10) / 10 + "\"");
				}
			);
		},
		1000
	);
}

// Test user search history adding functionality.
function test_history_add_0()
{
	var test_place = "Los Angeles, CA";
	var test_date = 1183766400;

	var expected_html = "<button class=\"history_list_entry\" value=\"Los_Angeles,_CA|1183766400\"><strong>Address:</strong> Los Angeles, CA<span class=\"history_list_entry_date\"><strong>	Date:</strong> 7/6/2007</span></button>"

	history_add(test_place, test_date);

	var new_entry = $('#history_list li:nth-child(1)');

	QUnit.test("\"History Add\"",
		function(assert)
		{
			assert.equal(new_entry.html(), expected_html, "Expected value: \"" + expected_html + "\"");
		}
	);
}

// Test user search history clearing functionality.
function test_history_clear_0()
{
	var test_place = "Antarctica";
	var test_date = 1321009871;

	history_add(test_place, test_date);
	var entry_count_before = $('#history_list li').length;

	history_clear();
	var entry_count_after = $('#history_list li').length

	QUnit.test("\"History Clear\"",
		function(assert)
		{
			assert.notEqual(entry_count_before, 0, "Expected value: !0");
			assert.equal(entry_count_after, 0, "Expected value: 0")
		}
	);
}