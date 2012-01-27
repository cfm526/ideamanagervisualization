var date1_formatter = d3.time.format("%d/%m/%Y %H:%M:%S"),
    date2_formatter = d3.time.format("%b %e, %Y %I:%M:%S %p"),
    date_output_formatter = d3.time.format("%a %H:%M %Y-%m-%d"),
    parsed_csv_data = [],
    table_data = [],
    column_titles = [],
    column_types = {},
    table, th, tbody, tr, td;

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
    return { date: parseDateString(e["Timestamp Idea Created"]), idea: e["Idea Text"] } 
  });
  column_types = columnTypes(table_data[0]);
  column_titles = rowProperties(table_data[0]);
  generateTableOfIdeas();
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

function generateTableOfIdeas() {
  createTableOfIdeas();
  redrawTableOfIdeas();
}

function createTableOfIdeas() {
  table = d3.select("body").append("table")
  th = table.append("thead").append("tr").selectAll("th")
          .data(column_titles)
        .enter().append("th")
            .text(function(t) { return t })
            .attr("onclick", function (d, i) { 
              return "sortTable('" + d + "')";
            })
  tbody = table.append("tbody")
}

function redrawTableOfIdeas() {
  tbody.selectAll("tr").remove();
  
  tr = tbody.selectAll("tr").data(table_data).enter().append("tr")
  
  td = tr.selectAll("td")
           .data(function(row) { return rowValues(row) })
         .enter().append("td")
           .text(function(d) {
              if (d instanceof Date) {
                return date_output_formatter(d)
              } else {
                return d
              }
            })
}

function sortTable(property) {
  switch(column_types[property]) {
    case "Date":
      table_data.sort(function(a, b) { return b[property] - a[property]});
      break;
    
    case "Number":
      table_data.sort(function(a, b) { return b[property] - a[property]});
      break;

    default:
      table_data.sort(function(a, b) { 
        if (b[property] === a[property]) {
          return 0
        } else {
          return b[property] > a[property]
        }
      });
      break;
  }
  redrawTableOfIdeas(); 
}

// import the CSV data
d3.csv("../../IdeaManagerDSJS.csv", processCSVRows)

