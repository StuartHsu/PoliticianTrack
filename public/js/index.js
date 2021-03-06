anychart.onDocumentReady(function() {
  $.ajax({
    url: "/tagCount",
    type: "GET",
    success: function(resp) {
      let data = dataForm(resp.data);
      drawCloud(data);
    }
  });
});

function dataForm(data) {
  let cloudData = [];
  let dataLength = data.length;
  let max = data[0].count;
  let min = 1;
  let justfyRatio = (900 / (max - min));
  for(let i = 0; i < dataLength; i++) {
    if(data[i].count > min) {
      let body = {
        x: data[i].name,
        value: data[i].count * justfyRatio,
        tag: data[i].type
      }
      cloudData.push(body);
    }
  }
  return cloudData;
}

function drawCloud(data) {
  // create a tag (word) cloud chart
  var chart = anychart.tagCloud(data);
  // set an array of angles at which the words will be laid out
  chart.angles([0])
  // set color present type
  var customColorScale = anychart.scales.ordinalColor();
  // chart.scale(anychart.scales.log(4));
  customColorScale.ranges([
    {less: 200},
    {from: 200, to: 300},
    {from: 300, to: 400},
    {from: 400, to: 500},
    {from: 500, to: 600},
    {from: 600, to: 700},
    {from: 700, to: 800},
    {from: 800, to: 900},
    {greater: 900}
  ]);
  customColorScale.colors(["#707070", "#606060", "#505050", "#404040", "#383838", "#303030", "#282828", "#181818", "#000000"]);
  chart.colorScale(customColorScale);
  // 去除滑鼠移到標籤上的資訊
  chart.tooltip().format("{%yPercentOfTotal}%");
  chart.hovered().fill("#FF9300");

  // set the chart container
  chart.container("wordCloud");
  chart.draw();

  let param = {
    politician: [],
    issue: []
  }
  // add an event listener
  chart.listen("pointClick", function(e){
      // console.log(e.point.get("x"));
      let apiUrl;
      let clickTag = e.point.get("tag");
      if(clickTag === "NRP") {
        apiUrl = "/politician?politician="
      } else {
        apiUrl = "/politician?issue="
      }
    let url = apiUrl + e.point.get("x");
    window.open(url, "_self");
  });
}
