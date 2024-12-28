document.addEventListener("DOMContentLoaded", function () {
    Promise.all([
        fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
            .then(response => response.json()),
        fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
            .then(response => response.json())
    ]).then(([educationData, countyData]) => {
        const educationMap = {};
        educationData.forEach(d => {
            educationMap[d.fips] = {
                education: d.bachelorsOrHigher,
                area_name: d.area_name
            };
        });

        const svg = d3.select("body")
            .append("svg")
            .attr("width", 900)
            .attr("height", 600);

        svg.selectAll(".county")
            .data(topojson.feature(countyData, countyData.objects.counties).features)
            .enter()
            .append("path")
            .attr("class", "county")
            .attr("data-fips", d => d.id)
            .attr("data-education", d => educationMap[d.id]?.education || 0)
            .attr("fill", d => {
                const education = educationMap[d.id]?.education || 0;
                return education <= 15 ? "#d73027" :
                       education <= 30 ? "#fc8d59" :
                       education <= 45 ? "#fee08b" :
                       education <= 60 ? "#d9ef8b" : "#91cf60";
            })
            .attr("d", d3.geoPath())
            .on("mouseover", function (event, d) {
                const [x, y] = d3.pointer(event);
                const education = educationMap[d.id]?.education || 0;
                const countyName = educationMap[d.id]?.area_name || "Unknown";

                d3.select("#tooltip")
                    .html(`County: ${countyName}<br>Education: ${education}%`)
                    .attr("data-education", education)
                    .style("display", "block")
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", function () {
                d3.select("#tooltip").style("display", "none");
            });

        const colorScale = d3.scaleThreshold()
            .domain([15, 30, 45, 60])
            .range(["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60"]);

        const legend = d3.select("#legend")
            .selectAll("div")
            .data(colorScale.range())
            .enter()
            .append("div")
            .attr("class", "legend-item");

        legend.append("svg")
            .attr("width", 20)
            .attr("height", 20)
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", d => d); 

        legend.append("span")
            .text((d, i) => {
                const thresholds = colorScale.domain();
                return i === 0
                    ? `0% - ${thresholds[0]}%`
                    : i === thresholds.length
                        ? `>${thresholds[thresholds.length - 1]}%`
                        : `${thresholds[i - 1]}% - ${thresholds[i]}%`;
            });
    });
});
