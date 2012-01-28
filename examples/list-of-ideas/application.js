var date1_formatter = d3.time.format("%d/%m/%Y %H:%M:%S"),
    date2_formatter = d3.time.format("%b %e, %Y %I:%M:%S %p")
    parsed_csv_data = [],
    stepCreatedOn = [];


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
  stepCreatedOn = parsed_csv_data.map(function(e) { return { idea: e["Idea Text"], date: parseDateString(e["Timestamp Idea Created"]) } });
  renderListOfIdeas()
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

function renderListOfIdeas() {
  var dl = d3.select("body").append("div").selectAll("dl")
      .data(stepCreatedOn)
    .enter().append("dl")
    
  var dt = dl.selectAll("dt")
      .data(function(d) { return [d]; })
    .enter().append("dt")
      .text(function(d) { return d.date })
  
  var dd = dl.selectAll("dd")
      .data(function(d) { return [d]; })
    .enter().append("dd")
      .text(function(d) { return d.idea })
}

// import the CSV data
d3.csv("../../data-exports/IdeaManagerDSJS.csv", processCSVRows)
