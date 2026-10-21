// NYC Parks Active and Passive Recreation (NYC Open Data, kcqe-vnci)
// only ask for the 4 columns we need, and raise the row limit above the 2,936 rows
const url = "https://data.cityofnewyork.us/resource/kcqe-vnci.csv?$select=borough,acres,active_acres,passive_acres&$limit=5000";

d3.csv(url).then(function(data) {

  data.forEach(function(d) {
    d.acres = +d.acres;
    d.active_acres = +d.active_acres;
    d.passive_acres = +d.passive_acres;
  });

  const boroughNames = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];

  // for each borough: add up the acres of all its parks, then turn them into percents
  const boroughs = boroughNames.map(function(name) {
    const parks = data.filter(function(d) {
      return d.borough === name;
    });

    const totalAcres = d3.sum(parks, function(d) { return d.acres; });
    const activeAcres = d3.sum(parks, function(d) { return d.active_acres; });
    const passiveAcres = d3.sum(parks, function(d) { return d.passive_acres; });

    return {
      borough: name,
      active: activeAcres / totalAcres * 100,
      passive: passiveAcres / totalAcres * 100
    };
  });

  const width = 500;
  const height = 500;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("font-family", "sans-serif");

  const xScale = d3.scalePoint()
    .domain(boroughNames)
    .range([50, 450])
    .padding(0.5);

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([450, 50]);

  // blue dots = percent passive
  svg.selectAll(".passive")
    .data(boroughs)
    .join("circle")
    .attr("class", "passive")
    .attr("cx", function(d) {
      return xScale(d.borough);
    })
    .attr("cy", function(d) {
      return yScale(d.passive);
    })
    .attr("r", 6)
    .attr("fill", "#1f6fd1")
    .append("title")
    .text(function(d) {
      return d.borough + ": " + d.passive.toFixed(1) + "% passive";
    });

  // red dots = percent active
  svg.selectAll(".active")
    .data(boroughs)
    .join("circle")
    .attr("class", "active")
    .attr("cx", function(d) {
      return xScale(d.borough);
    })
    .attr("cy", function(d) {
      return yScale(d.active);
    })
    .attr("r", 6)
    .attr("fill", "#d62728")
    .append("title")
    .text(function(d) {
      return d.borough + ": " + d.active.toFixed(1) + "% active";
    });

  svg.append("g")
    .attr("transform", "translate(0, 450)")
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .attr("transform", "translate(50, 0)")
    .call(d3.axisLeft(yScale));

  // y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -250)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Percent of park area");

  // legend
  svg.append("circle").attr("cx", 330).attr("cy", 25).attr("r", 6).attr("fill", "#1f6fd1");
  svg.append("text").attr("x", 342).attr("y", 29).attr("font-size", 12).text("Passive");
  svg.append("circle").attr("cx", 400).attr("cy", 25).attr("r", 6).attr("fill", "#d62728");
  svg.append("text").attr("x", 412).attr("y", 29).attr("font-size", 12).text("Active");

});
