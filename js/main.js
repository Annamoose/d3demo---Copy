//Using D3 to create a choropleth map
//A Fritz GEOG 575  Lab 2 demo data- October 2019

(function (){
    
    //pseudo-global variables
var attrArray = ["varA", "varB", "varC","varD","varE"];
var expressed  = attrArray[0];


 

//begin script when window loads
window.onload = setMap();

//set up the choropleth map
function setMap(){

    //map frame dimentions before svg container built!
    var width = window.innerWidth * 0.5,
    height = 460;

//create svg container for map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("height", height)
        .attr("width", width);
    
 //create projection ex 2.2 in 2-2 Lesson 2; Drawing Projected Data
    var projection = d3.geoAlbers()
        .center([0, 46.2])
        .rotate([-2, 0])
        .parallels([43,62])
        .scale(2500)
        .translate([width / 2, height / 2]);
    
    var path = d3.geoPath()
        .projection(projection);
    
//load data asynchronously
    d3.queue()
    .defer(d3.csv, "data/unitsData.csv")
    .defer(d3.json, "data/Euromap.topojson")
    .defer(d3.json, "data/france.topojson")
    .await(callback);
    
    function callback (error, csv, europe, france){
        console.log("csv data", csv);
        console.log("europe data", europe);
        console.log("france data", france);
        
    setGraticule(map, path);

        //translate topojson to geojson
        var europeCountries = topojson.feature(europe, europe.objects.EuropeCountries),
            franceRegions = topojson.feature(france, france.objects.FranceRegions).features;
        
            console.log("europe topojson", europeCountries);
            console.log("france topojson", franceRegions);
        
            //add europe countries to map
        var countries = map.append("path")
            .datum(europeCountries)
            .attr("class", "countries")
            .attr("d", path);
        
        //call function joinData to join csv to geojson enumerations units
        franceRegions = joinData(franceRegions, csv);
        
        //create the color scale
        var colorScale = makeColorScale(csv);
        
        //add enumeration units to the map
        setEnumerationUnits(franceRegions, map, path, colorScale);
        
        //add coordinated viz to the map in the form of a chart
        setChart(csv, colorScale);
        console.log("testChart");
        
    }; //end of callback
    
}; //end of setMap
    
function setGraticule(map, path){
        var graticule = d3.geoGraticule()
            .step([5,5]);
        
        var gratBackground = map.append("path")
            .datum(graticule.outline())  //bind graticule background to each element to be created
            .attr("class", "gratBackground")
            .attr("d", path);
         
        //create graticule lines
        var gratLines = map.selectAll(".gratLines")
            .data(graticule.lines())  //bind graticule lines to each element to be created
            .enter()
            .append("path")
            .attr("class", "gratLines")
            .attr("d", path);
         
    };  // end of setGraticule
    
    //function to join csv data to geojson enumerations units
function joinData(franceRegions, csv){
     //loop through each csv to assign each set of csv attributes to geojson regions
        for (i=0; i<csv.length; i++){
            var csvRegion = csv[i];
            var csvKey = csvRegion.adm1_code;
            
            for (var a=0; a<franceRegions.length; a++){
                var geojsonProps = franceRegions[a].properties;
                var geojsonKey = geojsonProps.adm1_code;
                
                if (geojsonKey == csvKey){
                    
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvRegion[attr]);
                        geojsonProps[attr] = val;
                    });
                }; //end of if statement
            }; //end of inner for loop
        }; //end of outer for loop
     return franceRegions;
    }; //end of joinData    
 
   //function to set joined enumeration units to the map
function setEnumerationUnits(franceRegions, map, path, colorScale){
            var regions = map.selectAll(".regions")
            .data(franceRegions)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path)
            .style("fill", function(d) {
                return choropleth(d.properties, colorScale);
            });    
        
    }; //end of setEnumerationUnits

 //function to make Natural Breaks colorscale
function makeColorScale(data){
    var colorClasses = [
        "#D489DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043",
    ];
    
    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);
    
    //build array of all values of expressed attribute so they can be used in the domain
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    }; //end of for loop
    

    
    //cluster data
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    console.log("domain array for colors: ", domainArray);
    
    //remove 1st value from array to create class breakpoints
    domainArray.shift();
    
    //assign array of last 4 cluster mins as domains
    colorScale.domain(domainArray);
    
    return colorScale;
    
}; //end of makeColorScale
    
    //function to test if data has value for colorScale
function choropleth(props, colorScale){
    //verify attribute value is number
    var val = parseFloat(props[expressed]);
    
    //if value exists assign color; otherwise make grey
    if(typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
        } else {
            return "#ccc";
        };
};  //end of choropleth
    
function setChart(csv, colorScale){
    // chart frame dimensions set in global var
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
   
    //chart background
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);   
    
 // change yscale dynamically
    csvmax = d3.max(csv, function(d) { return parseFloat(d[expressed]); });
    
    yScale = d3.scaleLinear()
        .range([chartHeight - 10, 0])
        .domain([0, csvmax * 1.1]);  //csv max value    
   
    //set bars for each province using linear y-scale and adjustable height accordign to values
    var bars = d3.selectAll(".bar")
        .data(csv)
        .enter()
        .append("rect")
        .sort(function(a,b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bars " + d.adm1_code;
        })
        .attr("width", chartInnerWidth / csv.length - 1)
        .attr("x", function(d, i){
            return i * (chartWidth / csv.length);
        })
        .attr("height", function(d){
            return yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d[expressed]));
        })
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });    
    
    var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Number of variable " + expressed[3] + " in each region");
    
    var numbers = chart.selectAll(".numbers")
        .data(csv)
        .enter()
        .append("text")
        .sort(function(a,b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "numbers " + d.adm1_code;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i){
            var fraction = chartWidth / csv.length;
            return i * fraction + (fraction - 1)/2;
        })
        .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d[expressed]))+15;
        })
        .text(function(d){
            return d[expressed];
        });
    
};  //end of setChart

})(); //last line of main.js