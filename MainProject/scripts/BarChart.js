
// specify the size and padding of svg
const width = 900;
const height = 500;
const margin = { top: 50, right: 30, bottom: 50, left: 80};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

d3.csv("data/Co2Emission.csv").then(function(data) {
    data.forEach(d => {
        //converting data from string to number
        d['gas'] = +d['gas'];
        d['coal'] = +d['coal'];
        d['oil'] = +d['oil'];
    });
    var groupByCountry = d3.group(data, function(d) {
        return d.Country;
    });//group data by its country attribute
    console.log("Group by Country");
    console.log(groupByCountry);

    BarChart(groupByCountry);//Create default barchart
});

function BarChart(groupByCountry)
{
    var title = "CO2 Emissions from gas in China"; //default title
    const yAxisLabel = "Amount of Co2 Emissions (MtCO2)";// y axis label
    const xAxisLabel = "Year"; // x axis label
    var countryRecord = groupByCountry.get("China");// China is the default country
    var selectedEnergy = "gas"; //array of countries chosen
    //appending svg
    const svg = d3.select('#barchart')
                    .append("svg")
                    .attr('width', width)
                    .attr('height', height); 

    var yValue = d => d[selectedEnergy]; //y axis value with be the amount of Co2 emissions
    var xValue = d => d.Year;// x axis value will be the year included in the study


    //scale for year
    var xScale = d3.scaleBand()
                     .domain(countryRecord.map(xValue))
                     .range([0, innerWidth])
                     .padding(0.1);

    //scale for amount of Co2 emissions
    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(countryRecord, function(d)
                        {
                            return d[selectedEnergy];
                        })])
                    .range([innerHeight,margin.top]).nice(); 

    const g = svg.append('g')
                 .attr('transform', `translate(${margin.left},${margin.top})`);
    
    //appending title for the chart
    svg.append("text")
        .attr("class", "title_barchart")
        .attr('y', 40)
        .attr('x', innerWidth/2+65)
        .attr('text-anchor', 'middle')
        .text(title)
        .style('font-size', 30);                    
                 

    const xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
     .attr('transform', `translate(0,${innerHeight})`)
     .attr("class", "xaxis")
     .call(xAxis); //Draw x-axis

    g.append('g').attr('class','yaxis').call(yAxis); //Draw y-axis

    //appending y axis label
    d3.select(".yaxis").append('text')
        .attr('class', 'axis-label')
        .attr('y', -50)
		.attr('x', -innerHeight / 2)
        .style('font-size', 20)
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`) //rotate the label
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);

    //appedning xaxis label
    d3.select(".xaxis").append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2 - 60)
        .attr('y', 40)
        .attr('fill', 'black')
        .style('font-size', 20)
        .text(xAxisLabel);
    var bar = document.getElementsByClassName("bar");
    g.selectAll('rect')
        .data(countryRecord)
        .enter()  
        .append('rect') 
        .attr("class", "bar")            
        .attr('x', function (d,i) {
            return xScale(xValue(d));
        })             
        .attr('y', function(d)
        {
            return yScale(yValue(d));
        })           
        .transition()
        .duration(1000) //this function will implement the transition to rect when they initialize            
        .attr('height', function(d) {
            return innerHeight - yScale(yValue(d));
        })          
        .attr('width', function(d) {
            return xScale.bandwidth();
        })        
        .attr('fill', "#797571");
        bar = document.getElementsByClassName("bar");
    g.selectAll('rect')
      .on("mouseover", function(event, d) {
        var xPosition = parseFloat(d3.select(this).attr("x"))
        var yPosition = parseFloat(d3.select(this).attr("y") )
        
        d3.selectAll(".bar")
            .attr('opacity', 0.4);
        d3.select(this)
            .transition()
            .delay(0)
            .attr('opacity', 1);
        g.append("text")
            .attr("id", "tooltip")
            .attr("x", xPosition + xScale.bandwidth()/2)
            .attr("y", yPosition -10)
            .attr('text-anchor', 'middle')
            .text(d[selectedEnergy] );// when hover over rect, it will display the corresponding figure
        })
     .on("mouseout", function(d){
        d3.select('#tooltip').remove();// remove figure when move the mouse out of bar
        d3.selectAll(".bar")
          .attr('opacity', 1);
        });

    //Get value from radio button
    d3.select('#getData')
        .on('click', () => {
            var countrySelected = d3.select('input[name="Country"]:checked').node().value; //get country from radio button
            var energySelected = d3.select('input[name="Energy"]:checked').node().value; //get energy type from radio button
            if (energySelected != "all") {
                title = "CO2 Emissions from " + energySelected + " in " + countrySelected;//interactive title for bar chart
                ChangeTitle_BarChart(title); 
                RemoveStack();
                DisplayBarChart();
                DrawBar(countrySelected, energySelected);
            }
            else {
                var title = "Overall CO2 Emissions in " + countrySelected;//title for stacked bar chart
                ChangeTitle_BarChart(title);
                HideBarChart();
                RenewBarchart();
                RemoveStack();
                DrawStackedBar(countrySelected);
            }
        }) 




    function DrawBar(countrySelected, energySelected)
    {
        console.log(countrySelected);
        selectedEnergy = energySelected;
        countryRecord = groupByCountry.get(countrySelected); //array of countries chosen
        yValue = d => d[selectedEnergy];
        yScale = d3.scaleLinear()
                    .domain([0, d3.max(countryRecord, yValue)])
                    .range([innerHeight,margin.top]).nice(); 

        yAxis = d3.axisLeft(yScale).ticks(5);
        d3.select('.yaxis').call(yAxis);
        g.selectAll('rect')
        .data(countryRecord)
        .transition()
        .duration(1000)//this function will implement the transition to rect when they initialize 
        .attr("class", "bar")            
        .attr('x', function (d,i) {
            return xScale(xValue(d));
        })             
        .attr('y', function(d)
        {
            return yScale(yValue(d));
        })                      
        .attr('height', function(d) {
            return innerHeight - yScale(yValue(d));
        })          
        .attr('width', function(d) {
            return xScale.bandwidth();
        })        
        //changing bar's color according to type or energy
        .attr('fill', () =>{
            if(selectedEnergy == "coal")
            {
                return "#FFC20A";
            }
            if(selectedEnergy == "gas")
            {
                return "#797571";
            }
            if(selectedEnergy == "oil")
            {
                return "#0C7BDC";
            }
        });

        //implement function when hovering specific rectangle
        g.selectAll('rect')
            .on("mouseover", function(event, d) {
                var xPosition = parseFloat(d3.select(this).attr("x"));
                var yPosition = parseFloat(d3.select(this).attr("y"));
                d3.selectAll(".bar")
                  .attr('opacity', 0.4);//decrease other opacity
                d3.select(this)
                  .transition()
                  .delay(0)
                  .attr('opacity', 1);
                g.append("text")
                  .attr("id", "tooltip")
                  .attr("x", xPosition + xScale.bandwidth()/2)
                  .attr("y", yPosition -10)
                  .attr('text-anchor', 'middle')
                  .text(d[selectedEnergy] );// appending text
        })
            .on("mouseout", function(d){
                //remove the diplayed figures and turn the opacity of all rect to 1
                d3.select('#tooltip').remove();
                d3.selectAll(".bar")
                .attr('opacity', 1);
            });
    }

    //This function will renew bar chart by decreasing the height of all bars to 0
    function RenewBarchart ()
    {
        g.selectAll('rect')
        .data(countryRecord)
        //this function will implement the transition to rect when they initialize 
        .attr("class", "bar")            
        .attr('x', function (d,i) {
            return xScale(xValue(d));
        })             
        .attr('y', function(d)
        {
            return yScale(yValue(d));
        })                      
        .attr('height', 0)          
        .attr('width', function(d) {
            return xScale.bandwidth();
        })        
        .attr('fill', () =>{
            if(selectedEnergy == coal)
            {
                return "#FFC20A";
            }
            if(selectedEnergy == gas)
            {
                return "#797571";
            }
            if(selectedEnergy == oil)
            {
                return "#0C7BDC";
            }
        });

        
    }
    //Draw stacked bar chart
    function DrawStackedBar(countrySelected)
    {
        var countryRecord = groupByCountry.get(countrySelected); //array of countries chosen 
        var stack = d3.stack()
                  .keys([ "coal","oil", "gas"]); //create keys according to categories
        var color = d3.scaleOrdinal()
                    .range(["#FFC20A", "#0C7BDC", "#797571"]); //Colour scale used by using a native scheme
        if(countrySelected == "Japan" || countrySelected == "United States")
        {
            stack = d3.stack()
                  .keys([ "oil","coal", "gas"]); //create keys according to categories
            color = d3.scaleOrdinal()
                  .range(["#0C7BDC","#FFC20A", "#797571"]); //Colour scale used by using a native scheme
        }
        var series = stack(countryRecord);
        console.log(series);
        yScale = yScale.domain([0, d3.max(countryRecord, function(d) {
                            return d.gas + d.coal + d.oil; //Finding max of the total value of apples, oranges and grapes
                        })]).nice();
        yAxis = d3.axisLeft(yScale).ticks(5);
        d3.select('.yaxis').call(yAxis);
        
        
        var groups = g.append("g")
                      .selectAll("g")
                      .data(series) //Bind 3 child arrays to 3 g elements
                      .enter()
                      .append("g")
                      .style("fill", function(d,i)  {
                        return color(i);
                      });
       
        groups.selectAll("rect")
                        .data(function(d) {return d;}) //For each array in series, bind its children to the rectangle elements
                        .enter()
                        .append("rect")
                        .attr('id', 'stack')
                        .attr("x", function(d,i) {
                            return xScale(xValue(d.data)); //Scale the x position of each bar based on year
                        })
                        .attr("y", function(d) {
                            return yScale(d[1]); //Scale the y position of each bar
                        })
                        .transition()
                        .duration(1000) //this function will implement the transition to rect when they initialize  
                        .attr("width", xScale.bandwidth()) //Set the width for each bar
                        .attr("height", function(d) {
                            return yScale(d[0]) - yScale(d[1]); //Set the height for each bar
                        })
        

        //function when hovering   
        //When hovering mouse on a certain rect, it will decrease the opacity of other rect and display coressonding figure           
        d3.selectAll("rect")
            .on("mouseover", function(event, d){
                d3.selectAll("rect")
                    .style("opacity", 0.3);
                d3.select(this)
                    .style("opacity", 1)
                    .append('title')
                    .text((d, i) => d[1] - d[0] + ' MtCO2');

            })
            .on("mouseout", function(event, d){
                d3.selectAll("rect")
                    .style("opacity", 1);
            });   

            // creating legend for stacked bar chart
            g.append("circle").attr("cx",innerWidth -20).attr("id", "stack").attr("cy",0).attr("r", 6).style("fill", "#FFC20A");
            g.append("circle").attr("cx",innerWidth - 20).attr("id", "stack").attr("cy",20).attr("r", 6).style("fill", "#0C7BDC");
            g.append("circle").attr("cx",innerWidth - 20).attr("id", "stack").attr("cy",40).attr("r", 6).style("fill", "#797571");
            g.append("text").attr("x", innerWidth -10).attr("id", "stack").attr("y", 0).text("coal").style("font-size", "20px").attr("alignment-baseline","middle");
            g.append("text").attr("x", innerWidth - 10).attr("id", "stack").attr("y", 20).text("oil").style("font-size", "20px").attr("alignment-baseline","middle");
            g.append("text").attr("x", innerWidth - 10).attr("id", "stack").attr("y", 40).text("gas").style("font-size", "20px").attr("alignment-baseline","middle"); 
    }

    //function to hide bar chart when display stacked bar chart
    function HideBarChart()
    {
        d3.selectAll(".bar").style("display", "none");
    }
    //function to remove stacked bar chart
    function RemoveStack()
    {
        d3.selectAll("#stack").remove();
    }
    //Display bar chart
    function DisplayBarChart()
    {
        d3.selectAll(".bar").style("display", "block");
    }
    //change title when changing chart
    function ChangeTitle_BarChart(new_title)
    {
        d3.select(".title_barchart").remove();
        svg.append("text")
        .attr('text-anchor', 'middle')
        .attr("class", "title_barchart")
        .attr('y', 40)
        .attr('x', innerWidth/2 + 65)
        .text(new_title)
        .style('font-size', 30);     
    }
}

