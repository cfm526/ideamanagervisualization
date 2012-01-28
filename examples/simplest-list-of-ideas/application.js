var format = d3.time.format("%d/%m/%Y %H:%M:%S"),
    parsed_csv_data = [],
    stepCreatedOn = [];

function processCSVRows(rows) {
  parsed_csv_data = rows;
  stepCreatedOn = parsed_csv_data.map(function(e) { return [ e["Idea Text"], format.parse(e["Timestamp Idea Created"])] });
  renderListOfIdeas()
}

function renderListOfIdeas() {
  d3.select("#step-Created-On").selectAll("li")
      .data(stepCreatedOn)
    .enter().append("li")
      .text(function(d) { return d[0] })
}

// import the CSV data
d3.csv("../../data-exports/IdeaManagerDSJS.csv", processCSVRows)
