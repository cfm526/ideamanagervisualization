var margin = [20, 60, 40, 20],
    width = 960 - margin[1] - margin[3],
    height = 500 - margin[0] - margin[2];

var xScale = d3.time.scale().range([0, width]),
    yScale = d3.scale.linear().range([height, 0]),
    xAxis = d3.svg.axis().scale(xScale),
    yAxis = d3.svg.axis().scale(yScale),
    xdomain, ydomain;
    
var date1_input_formatter = d3.time.format("%d/%m/%Y %H:%M:%S"),
    date2_input_formatter = d3.time.format("%b %e, %Y %I:%M:%S %p"),
    date_output_formatter = d3.time.format("%a %H:%M:%S %Y-%m-%d"),
    date_24H_output_formatter = d3.time.format("%H:%M %Y-%m-%d"),
    day2ms = 86400000;

//
// Right now we need to create two different date format parsing functions
// because there are two different formats in the CSV data
//
// d3.time.format("%d/%m/%Y %H:%M:%S").parse("5/13/2011 12:25:36")
// => Wed Jan 05 2011 12:25:36 GMT-0500 (EST)
// d3.time.format("%b %e, %Y %I:%M:%S %p").parse("May 19, 2011 1:40:38 PM")
// => Thu May 19 2011 13:40:38 GMT-0400 (EDT) 
//
 
var parsed_csv_data = [],
    table_data = [],
    workgroup_data = [],
    selected_data = [],
    column_titles = [],
    column_types = {};
    
var table, th, tbody, tr, td,
    chart, svg, tooltip, tooltip_content,
    idea_circle, idea_dragged;

var workgroup_selector = document.getElementById("workgroup-selector");

function processCSVRows(rows) {
  parsed_csv_data = rows;
  table_data = parsed_csv_data.map(function(e) { 
    var date = parseDateString(e["Timestamp Idea Created"])
    return { 
      date: date, 
      idea: e["Idea Text"],
      workgroup: +e["Workgroup Id"],
      time: (date - d3.time.day(date)) / day2ms * 24
    } 
  });
  workgroup_data = d3.nest().key(function(d) { return d.workgroup }).sortKeys(d3.ascending).entries(table_data)
  workgroup_data.unshift({ 
    key: "All " + workgroup_data.length + " Workgroups", 
    values: table_data 
  });
  selected_data = table_data;
  column_types = columnTypes(table_data[0]);
  column_titles = rowProperties(table_data[0]);
  generateChartOfIdeas();
}

function parseDateString(datestr) {
  var d;
  d = date1_input_formatter.parse(datestr) || date2_input_formatter.parse(datestr);;
  if (d) {
    return d
  } else {
    return "error parsing: " + datestr
  }
}

function rowProperties(row) {
  var properties = [];
  for(var property in row) {
    properties.push(property)
  }
  return properties;
}

function rowValues(row) {
  var values = [];
  for(var property in row) {
    values.push(row[property])
  }
  return values;
}

function columnTypes(row) {
  var types = {};
  for(var property in row) {
    types[property] = row[property].constructor.toString().match(/function (\w+)/)[1]
  }
  return types;
}

function generateChartOfIdeas() {
  createChartOfIdeas();
  redrawChartOfIdeas();
}

function createChartOfIdeas() {
  chart = d3.select("#chart");
  
  tooltip = chart.append("div")
      .attr("class", "tooltip")
      .style("opacity", 1e-6);
  
  tooltip_content = tooltip.append("p")
  
  workgroup_selector.onchange = function() {
    selected_data = workgroup_data.filter(function(o) { 
      return o.key == workgroup_selector.value 
    })[0].values;
    redrawAxes();
    redrawChartOfIdeas();
  };

  d3.select(workgroup_selector).selectAll("option")
      .data(workgroup_data, function(d) { return d })
    .enter().append("option")
        .attr("value", function(d, i) { return workgroup_data[i].key })
        .text(function(d, i) { return workgroup_data[i].key });


  // Add an SVG element with the desired dimensions and margin.
  svg = chart.append("svg")
            .attr("width",  width + margin[1] + margin[3])
            .attr("height", height + margin[0] + margin[2])
          .append("svg:g")
            .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

  // Add the clip path.
  svg.append("svg:clipPath")
     .attr("id", "clip");

  svg.append("svg:rect")
     .attr("width", width)
     .attr("height", height);
       
  // Add the x-axis.
  setupXAxis();
  svg.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Add the y-axis.
  setupYAxis();
  svg.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);
}

function redrawAxes() {
  redrawXAxis();
  redrawYAxis()
}

function redrawXAxis() {
  setupXAxis();
  svg.select("g.x").call(xAxis);
}

var xScale = d3.time.scale().range([0, width]),
    yScale = d3.scale.linear().range([height, 0]),
    xAxis = d3.svg.axis().scale(xScale).tickSubdivide(true),
    yAxis = d3.svg.axis().scale(yScale).ticks(4).orient("right");


function setupXAxis() {
  xdomain = d3.extent(selected_data, function(d) { return d.date });
  xScale.domain(xdomain);
  xAxis.scale(xScale)
}

function redrawYAxis() {
  setupYAxis();
  svg.select("g.y").call(yAxis);      
}

function setupYAxis() {
  ydomain = d3.extent(selected_data, function(d) { return d.time });
  yScale.domain(ydomain).nice();
  yAxis.scale(yScale)
    .orient("right")
    .tickFormat(yTickTimeOfDayFormatter);
}

var two_digit_formatter = d3.format("02.0f");

function yTickTimeOfDayFormatter(decimal_hours) {
  var hours   = Math.floor(decimal_hours);
  var decimal_minutes = 60 * (decimal_hours - hours);
  var minutes = Math.floor(decimal_minutes);
  var decimal_seconds = 60 * (decimal_minutes - minutes);
  var seconds = Math.floor(decimal_seconds);
  var result = two_digit_formatter(hours) + ':' +
               two_digit_formatter(minutes) + ':' +
               two_digit_formatter(seconds);
  return result
}

function redrawChartOfIdeas() {
  svg.selectAll("circle").remove();

  // add the data
  idea_circle = svg.append("svg:g").selectAll("circle")
      .data(selected_data, function(d) { 
        return d })

  idea_circle.enter().append("circle")
        .attr("cx",    function(d) { return xScale(d.date); })
        .attr("cy",    function(d) { return yScale(d.time); })
        .attr("r", 6.0)
        .on("mousedown", function(d) { 
          ideaMouseDown(d) 
          })
        .on("mouseout",  function(d) { ideaMouseOut(d) });   
}

function ideaMouseDown(d) {
  tooltip.style("opacity", 1)
         .style("left", (d3.event.pageX + 6) + "px")
         .style("top", (d3.event.pageY - 30) + "px")
         .transition().duration(250);
  tooltip_content.text(date_output_formatter(d.date) + ': '+ stripSpaces(d.idea));
}

function ideaMouseMOve(d) {
}

function ideaMouseOut() {
  tooltip.style("opacity", 1e-6);
}

function stripSpaces(str) {
  return str.replace(/(^\s+|\s+$)/g, '')
}

// import the CSV data
d3.csv("../../IdeaManagerDSJS.csv", processCSVRows)

