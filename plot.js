"use-strict";

let data = "";
let svgContainer = ""; // keep SVG reference in global scope
let popChartContainer = "";
const msm = {
    width: 1200,
    height: 800,
    marginAll: 50,
    marginLeft: 50,
}
const small_msm = {
    width: 500,
    height: 500,
    marginAll: 50,
    marginLeft: 80
}

// load data and make scatter plot after window loads
window.onload = function () {
    svgContainer = d3.select("#chart")
        .append('svg')
        .attr('width', msm.width)
        .attr('height', msm.height);
    popChartContainer = d3.select("#popChart")
        .append('svg')
        .attr('width', msm.width)
        .attr('height', msm.height);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("HDI.csv")
        .then((d) => makeScatterPlot(d))
}

// make scatter plot with trend line
function makeScatterPlot(csvData) {
    // assign data as global variable; filter out unplottable values
    data = csvData.filter((data) => {return data["Life expectancy"] != "NA" && data["Gross national income (GNI) per capita"] != "NA"})

    let dropDown = d3.select("#filter").append("select")
        .attr("name", "year");

    // get arrays of fertility rate data and life Expectancy data
    let life_data = data.map((row) => parseFloat(row["Life expectancy"]));
    let income_data = data.map((row) => parseFloat(row["Gross national income (GNI) per capita"]));

    // find data limits
    let axesLimits = findMinMax(income_data, life_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Gross national income (GNI) per capita", "Life expectancy", svgContainer, msm);

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels(svgContainer, msm, "Countries by Life Expectancy and Gross National Income per Capita",'Gross National Income (GNI) per Capita', 'Life Expectancy');

}

// make title and axes labels
function makeLabels(svgContainer, msm, title, x, y) {
    svgContainer.append('text')
        .attr('x', (msm.width - 2 * msm.marginAll) / 2 - 90)
        .attr('y', msm.marginAll / 2 + 10)
        .style('font-size', '10pt')
        .text(title);

    svgContainer.append('text')
        .attr('x', (msm.width - 2 * msm.marginAll) / 2 - 30)
        .attr('y', msm.height - 10)
        .style('font-size', '10pt')
        .text(x);

    svgContainer.append('text')
        .attr('transform', 'translate( 15,' + (msm.height / 2 + 30) + ') rotate(-90)')
        .style('font-size', '10pt')
        .text(y);
}

function makeLabels2(svgContainer, msm, title, x, y) {
    svgContainer.append('text')
        .attr('x', (msm.width - 2 * msm.marginAll) / 2 - 40)
        .attr('y', msm.marginAll / 2)
        .style('font-size', '10pt')
        .text(title);

    svgContainer.append('text')
        .attr('x', (msm.width - 2 * msm.marginAll) / 2 + 30)
        .attr('y', msm.height - 10)
        .style('font-size', '10pt')
        .text(x);

    svgContainer.append('text')
        .attr('transform', 'translate(15,' + (msm.height / 2 + 30) + ') rotate(-90)')
        .style('font-size', '10pt')
        .text(y);
}
// plot all the data points on the SVG
// and add tooltip functionality
function plotData(map) {
    // get population data as array
    curData = data.filter((row) => {
        return row['Life expectancy'] != "NA" && row['Gross national income (GNI) per capita'] != 0
    })

    // make size scaling function for population
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // let toolTipChart = div.append("div").attr("id", "tipChart")
    let toolChart = div.append('svg')
        .attr('width', small_msm.width)
        .attr('height', small_msm.height)

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
        .data(curData)
        .enter()
        .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 5)
        .attr('stroke', "#69b3a2")
        .attr('stroke-width', 2)
        .attr('fill', 'white')
        .attr("class", "circles")
        // add tooltip functionality to points
        .on("mouseover", (d) => {
            toolChart.selectAll("*").remove()
            div.transition()
                .duration(200)
                .style("opacity", .9);
            plotLifeBySex(d.Country, toolChart)
            div//.html("Fertility:       " + d.fertility + "<br/>" +
                    // "Life Expectancy: " + d.life_expectancy + "<br/>" +
                    // "Population:      " + numberWithCommas(d["population"]) + "<br/>" +
                    // "Year:            " + d.year + "<br/>" +
                    // "Country:         " + d.country)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            
        })
        .on("mouseout", (d) => {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function plotLifeBySex(country, toolChart) {
    let countryData = data.filter((row) => {return row.Country == country})
    let female = countryData.map((row) => parseInt(row["Life expectancy at birth Female"]));
    let male = countryData.map((row) => parseInt(row["Life expectancy at birth Male"]));
    let year = countryData.map((row) => parseInt(row["year"]));
    let life_data = countryData.map((row) => parseFloat(row["Life expectancy"]));

    let yMin = d3.min(life_data);
    let yMax = d3.max(life_data);
    let mapFunctions = drawAxes2(yMin, yMax, "Life expectancy", toolChart, small_msm);
    
    const yScale = d3.scaleLinear()
    .range([500, 0])
    .domain([0, 100]);


    var y = d3.scaleLinear()
          .range([500, 0]);
          
    toolChart.selectAll(".bar")
        .data(countryData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .style("fill", "A62C23")
        .attr("x", mapFunctions.xScale("Female") + 75)
        .attr("width", 100)
        .attr("y", function(d) { return mapFunctions.yScale(d["Life expectancy at birth Female"]); })
        .attr("height", function(d) { return 450 - mapFunctions.yScale(d["Life expectancy at birth Female"]);});

    toolChart.selectAll(".bar2")
        .data(countryData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .style("fill", "steelblue")
        .attr("x", mapFunctions.xScale("Male") + 75)
        .attr("width", 100)
        .attr("y", function(d) { return mapFunctions.yScale(d["Life expectancy at birth Male"]); })
        .attr("height", function(d) { return 450 - mapFunctions.yScale(d["Life expectancy at birth Male"]);});

    makeLabels2(toolChart, small_msm, "Life Expectancy For " + country, "Sex", "Life Expectancy");
}

// draw the axes and ticks
function drawAxes(limits, x, y, svgContainer, msm) {
    // return x value from a row of data
    let xValue = function (d) {
        return +d[x];
    }

    // function to scale x value
    let xScale = d3.scaleLinear()
        .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
        .range([0 + msm.marginAll, msm.width - msm.marginAll])

    // xMap returns a scaled x value from a row of data
    let xMap = function (d) {
        return xScale(xValue(d));
    };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
        .attr('transform', 'translate(0, ' + (msm.height - msm.marginAll) + ')')
        .call(xAxis);

    // return y value from a row of data
    let yValue = function (d) {
        return +d[y]
    }

    // function to scale y
    let yScale = d3.scaleLinear()
        .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
        .range([0 + msm.marginAll, msm.height - msm.marginAll])

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) {
        return yScale(yValue(d));
    };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
        .attr('transform', 'translate(' + msm.marginAll + ', 0)')
        .call(yAxis);

    // return mapping and scaling functions
    return {
        x: xMap,
        y: yMap,
        xScale: xScale,
        yScale: yScale
    };
}

//axes for plot inside tooltip
function drawAxes2(yMin, yMax, y, svgContainer, msm) {
    // return x value from a row of data
    let xValue = function (d) {
        return +d[x];
    }
    let xScale = d3.scaleBand()
    .domain(["Female", "Male"]) // give domain buffer room
    .range([0 + msm.marginAll, msm.width - msm.marginAll])
    // function to scale x value
    /*let xScale = d3.scaleLinear()
        .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
        .range([0 + msm.marginAll, msm.width - msm.marginAll])
*/
    // xMap returns a scaled x value from a row of data
    let xMap = function (d) {
        return xScale(xValue(d));
    };

    // plot x-axis at bottom of SVG



    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
        .attr('transform', 'translate(25, ' + (msm.height - msm.marginAll) + ')')
        .call(xAxis);
    // return y value from a row of data
    let yValue = function (d) {
        return +d[y]
    }


    // function to scale y
    let yScale = d3.scaleLinear()
        .domain([yMax + 5, yMin- 5]) // give domain buffer
        .range([0 + msm.marginAll, msm.height - msm.marginAll])

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) {
        return yScale(yValue(d));
    };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
        .attr('transform', 'translate(' + 80 + ', 0)')
        .call(yAxis);

    // return mapping and scaling functions
    return {
        y: yMap,
        x: xMap,
        xScale: xScale,
        yScale: yScale
    };
}

// find min and max for arrays of x and y
function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
    }
}
