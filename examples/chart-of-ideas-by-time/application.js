var margin = [20, 20, 20, 20],
    width = 960 - margin[1] - margin[3],
    height = 500 - margin[0] - margin[2];

var xScale = d3.time.scale().range([0, width]),
    yScale = d3.scale.linear().range([height, 0]),
    xAxis = d3.svg.axis().scale(xScale).tickSubdivide(true),
    yAxis = d3.svg.axis().scale(yScale).ticks(4).orient("right");
    
var date1_formatter = d3.time.format("%d/%m/%Y %H:%M:%S"),
    date2_formatter = d3.time.format("%b %e, %Y %I:%M:%S %p"),
    date_output_formatter = d3.time.format("%a %H:%M %Y-%m-%d");
    
var parsed_csv_data = [],
    table_data = [],
    column_titles = [],
    column_types = {},
    first_date, last_date, xdomain;
    
var table, th, tbody, tr, td,
    chart, svg, tooltip, tooltip_content,
    idea_circle, idea_dragged;

//
// Right now we need to create two different date format parsing functions
// because there are two different formats in the CSV data
//
// d3.time.format("%d/%m/%Y %H:%M:%S").parse("5/13/2011 12:25:36")
// => Wed Jan 05 2011 12:25:36 GMT-0500 (EST)
// d3.time.format("%b %e, %Y %I:%M:%S %p").parse("May 19, 2011 1:40:38 PM")
// => Thu May 19 2011 13:40:38 GMT-0400 (EDT) 
//
    
function processCSVRows(rows) {
  parsed_csv_data = rows;
  table_data = parsed_csv_data.map(function(e) { 
    return { 
      date: parseDateString(e["Timestamp Idea Created"]), 
      idea: e["Idea Text"],
      y: Math.random()*5
    } 
  });
  column_types = columnTypes(table_data[0]);
  column_titles = rowProperties(table_data[0]);
  first_date = d3.min(table_data, function(d) { return d.date });
  last_date = d3.max(table_data, function(d) { return d.date });
  xdomain = [first_date, last_date];
  xScale.domain(xdomain);
  ydomain = [0, 5];
  yScale.domain(ydomain);
  generateChartOfIdeas();
}

function parseDateString(datestr) {
  var d;
  d = date1_formatter.parse(datestr) || date2_formatter.parse(datestr);;
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
}

function createChartOfIdeas() {
  chart = d3.select("#chart");
  
  tooltip = chart.append("div")
      .attr("class", "tooltip")
      .style("opacity", 1e-6);
  
  tooltip_content = tooltip.append("p")
  
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
  svg.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Add the y-axis.
  svg.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);

  // add the data
  idea_circle = svg.append("svg:g").selectAll("circle")
      .data(table_data, function(d) { return d })

  idea_circle.enter().append("circle")
        .attr("cx",    function(d) { return xScale(d.date); })
        .attr("cy",    function(d) { return yScale(d.y); })
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

