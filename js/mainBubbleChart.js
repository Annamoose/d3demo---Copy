//Using D3 to create a choropleth map
//A Fritz GEOG 575  Lab 2 demo data- October 2019

// data path https://github.com/uwcartlab/19_g575/tree/master/unit-3/Module-8/data/EuropeCountries.geojson
// data path https://github.com/uwcartlab/19_g575/tree/master/unit-3/Module-8/data/FranceRegions.geojson
// data path https://github.com/uwcartlab/19_g575/tree/master/unit-3/Module-8/data/unitsData.csv

/*svg dimension in variables*/
  var w = 900, h = 500;  

//execute script when window is loaded and style block

window.onload = function(){
    
      var container = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "container")
        .style("background-color", "rbga(0,0,0,0.2)");

    //innerRect block
      var innerRect = container.append("rect") 
        .datum(400)
        .attr("width", function(d) {
            return d * 2;   //rectangle width
        }) 
        .attr("height", function(d){
            return d;       //rectangle height 
        }) 
        .attr("class", "innerRect")
        .attr("x", 50)
        .attr("y", 50)
        .style("fill", "#FFFFFF");

    //begin to add the data

    var cityPop = [
        { 
            city: 'Bismarck',
            population: 73112
        },
        {
            city: 'Grand Forks',
            population: 56948
        },
        {
            city: 'Minot',
            population: 47370
        },
        {
            city: 'Williston',
            population: 27096
        }
    ];

    var x = d3.scaleLinear()
        .range([90,800])
        .domain([0,3]);

        //find minimum population for axes scale
    var minPop = d3.min(cityPop, function(d){
        return d.population;
        });

        //find max population
    var maxPop = d3.max(cityPop, function(d){
        return d.population;
        });

    var y = d3.scaleLinear()
        .range([440,80])
        .domain([minPop,maxPop
        ]);

    //color scale specs    
    var color = d3.scaleLinear()
        .range([
            "#48a5d2",
            "#d1d248"
        ])
        .domain([
            minPop,
            maxPop
        ]);

        //2-1 Lesson 2; example 2.5, 2.6. and incorporating population data, 2.8
    var circles = container.selectAll(".circles")
        .data(cityPop)
        .enter()
        .append("circle")
        .attr("class", "circles")
        .attr("id", function(d){
            return d.city;
        })

    //radius of circle is function of population
        .attr("r", function(d){ 
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI);
        })

    //plot the data center x, cx and center y, cy coordinates  
        .attr("cx", function(d,i){
            return x(i);
        })
        .attr("cy", function(d){
            return y(d.population);
        })  

    // fill bubbles with graduated color according to population, black outline
        .style("fill", function(d,i){
        return color(d.population);
        })
        .style("stroke", "#000")

    //create axis generator 2-1 Lesson 3.3 Axes, examples 3.7-3.9
    var yAxis = d3.axisLeft(y);
/*        .scale(y)
        .orient("left")*/

    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50,0)")
        .call(yAxis);

    //create title 2-1 lesson 3-3 example 3.12
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("Population of Selected ND Cities");
    
    //create new container for circle labels, 2-1 Lesson 3-4, examples 3.14-3.17
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function(d){
            return y(d.population) + 2;
        });
    
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function(d,i){
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .text(function(d){
            return d.city;
        });
    
    //format generator, example 3.17
    var format = d3.format(",");
    
    //second line of label with fine tuning from ex. 3.15
    var popLine = labels. append("tspan")
        .attr("class", "popLine")
        .attr("x", function(d,i){
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .attr("dy", "15")
        .text(function(d){
            return "Pop. " + format(d.population);
        });
   
};