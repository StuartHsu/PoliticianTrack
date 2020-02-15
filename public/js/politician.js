const filters = document.querySelectorAll('.filter');
const filterItems = document.querySelectorAll('.filterItems');
const mainFilter = document.querySelector('.mainFilter');
const partyList = document.querySelector('.partyList');
const regionList = document.querySelector('.regionList');

const people = document.querySelectorAll('.person');
const issues = document.querySelectorAll('.issue');
const parties = document.querySelectorAll('.party');
const regions = document.querySelectorAll('.region');

const appendNews = document.getElementById("appendNews");
const appendPols = document.getElementById('appendPols');


// const tagJudge = document.getElementsByClassName("content")[0].offsetWidth;

let name = '';
let issueName = '';

// sidenav 選擇處理
filters.forEach(filter => filter.addEventListener('click', function(event) {
  let chooseFilter = event.target.id;
  // polsEvent(); // 點擊 sidenav 時載入 pols 監聽事件
  if(this.classList.contains("highlight")) {

    this.classList.remove("highlight");
    switch(chooseFilter) {
      case "main":
        mainFilter.style.display = "none";
        // 主選單取消時全收合
        // filterItems.forEach(r => r.style.display = "none");
        // filters.forEach(r => r.classList.remove("highlight"));
        break;
      case "party":
        partyList.style.display = "none";
        break;
      case "region":
        regionList.style.display = "none";
        break;
      default:
    }
    tagShow()
  } else {
    // filters.forEach(r => r.classList.remove("highlight"));
    this.classList.add("highlight");
    // filterItems.forEach(filterItem => filterItem.style.display = "none");
    switch(chooseFilter) {
      case "main":
        mainFilter.style.display = "flex";
        break;
      case "party":
        partyList.style.display = "block";
        break;
      case "region":
        regionList.style.display = "block";
        break;
      default:
    }
    tagShow()
  }
}));

// 人物選擇處理
people.forEach(person => person.addEventListener('click', function(event) {  
  if(this.classList.contains("innerHighlight")) {
    this.classList.remove("innerHighlight");
  } else {
    people.forEach(r => r.classList.remove("innerHighlight"));
    this.classList.add("innerHighlight");
  }
  name = toggle(name, event);
  getData(name, issueName);
}));

// 議題選擇處理
issues.forEach(issue => issue.addEventListener('click', function(event) {
  if(this.classList.contains("innerHighlight")) {
    this.classList.remove("innerHighlight");
  } else {
    issues.forEach(r => r.classList.remove("innerHighlight"));
    this.classList.add("innerHighlight");
  }
  issueName = toggle(issueName, event);
  getData(name, issueName);
}));

// 新聞旁標籤點選切換
function tagCallPol(name) {
  getData(name, issueName);
}

function tagCallIssue(issueName) {
  getData('', issueName);
}


childFilter(parties);
childFilter(regions);

// 子 filter 處理
function childFilter(items) {
  items.forEach(item => item.addEventListener('click', function() {
    if(this.classList.contains("innerHighlight")) {
      this.classList.remove("innerHighlight");
    } else {
      this.classList.add("innerHighlight");
    }
  }));
}

// DB 取資料
function getData(name, issueName) {
  $.ajax({
    url: `/api/news/listtag?name=${name}\&issue=${issueName}`,
    method: "GET",
    // data: name,
    dataType: 'json',
    contentType: "application/json",
    success: function(resp) {
      // console.log(resp);
      removeData();
      changeTitle(name);
      changeIssue(issueName);
      dataForm(name, resp);
      tagShow()
    }
  });
}

// 移除重複點擊
function toggle(condition, events) {
  if(!condition) {
    condition = event.target.innerText;
  } else {
    if(condition === event.target.innerText) {
      condition = '';
    } else {
      condition = event.target.innerText;
    }
  }
  return condition;
}

function changeTitle(name) {
  var titleName = document.getElementById("titleName");
  titleName.innerHTML = name;
}

function changeIssue(issueName) {
  var titleIssue = document.getElementById("titleIssue");
  titleIssue.innerHTML = issueName;
}

function dataForm(name, results) {
  document.getElementById('oncomingNews').style.display = "none";

  for (let i = 0; i < results.data.length; i ++) {
    var li = document.createElement("li");

    // timeline
    var timelineDiv = document.createElement("div");
    timelineDiv.className = "timeline";

    var time = new Date(results.data[i].pubTime);

    var yearP = document.createElement("p");
    var monthP = document.createElement("p");
    yearP.className = "year";
    monthP.className = "month";

    if(i > 0) {
      var preTime = new Date(results.data[i - 1].pubTime);

      var preTimeY = preTime.getFullYear();
      var preTimeM = preTime.getMonth();
      var curTimeY = time.getFullYear();
      var curTimeM = time.getMonth();

      if(preTimeY !== curTimeY && preTimeM !== curTimeM) {
        yearP.innerHTML = time.getFullYear();
        monthP.innerHTML = (time.getMonth() < 10 ? '0' : '') + (time.getMonth() + 1);
      } else if (preTimeY == curTimeY && preTimeM !== curTimeM) {
        yearP.innerHTML = "";
        monthP.innerHTML = (time.getMonth() < 10 ? '0' : '') + (time.getMonth() + 1);
      } else {
        yearP.innerHTML = "";
        monthP.innerHTML = "";
      }
    } else {
      yearP.innerHTML = time.getFullYear();
      monthP.innerHTML = (time.getMonth() < 10 ? '0' : '') + (time.getMonth() + 1);
    }

    timelineDiv.appendChild(yearP);
    timelineDiv.appendChild(monthP);

    // news
    var newsDiv = document.createElement("div");
    newsDiv.className = "news";

    var newsContentDiv = document.createElement("div");
    newsContentDiv.className = "news-content";

    var link = document.createElement("a");
    link.setAttribute("href", `${results.data[i].href}`);
    link.setAttribute("target", "_blank");

    var titleDiv = document.createElement("div");
    titleDiv.className = "title";
    titleDiv.innerHTML = results.data[i].title;

    var publisherDiv = document.createElement("div");
    publisherDiv.className = "publisher";
    publisherDiv.innerHTML = results.data[i].publisher;

    var pubTimeDiv = document.createElement("div");
    pubTimeDiv.className = "pubTime";
    pubTimeDiv.innerHTML = results.data[i].pubTime;

    var descDiv = document.createElement("div");
    descDiv.className = "desc";

    var descP = document.createElement("p");
    descP.innerHTML = results.data[i].description;

    descDiv.appendChild(descP);
    link.appendChild(titleDiv);
    link.appendChild(publisherDiv);
    link.appendChild(pubTimeDiv);
    link.appendChild(descDiv);

    newsContentDiv.appendChild(link);
    newsDiv.appendChild(newsContentDiv);

    // tags
    var tagsDiv = document.createElement("div");
    tagsDiv.className = "newsTags";

    var tagUl = document.createElement("ul");

    for(let j = 0; j < results.data[i].tag.length && j < 5; j++) {
      var tagLi = document.createElement("li");
      if(results.data[i].tag[j].tagName != name) {
        tagLi.innerHTML = results.data[i].tag[j].tagName;
        if(results.data[i].tag[j].tagType === "NRP") {
          tagLi.className = "polTag";
          tagLi.setAttribute("onclick", `tagCallPol("${results.data[i].tag[j].tagName}")`);
        } else {
          tagLi.className = "issueTag";
          tagLi.setAttribute("onclick", `tagCallIssue("${results.data[i].tag[j].tagName}")`);
        }
        tagUl.appendChild(tagLi);
      }
    }
    tagsDiv.appendChild(tagUl);

    // 組合
    li.appendChild(timelineDiv);
    li.appendChild(newsDiv);
    li.appendChild(tagsDiv);

    appendNews.appendChild(li);
  }
}

function removeData() {
  var child = appendNews.lastElementChild;
  while(child) {
    appendNews.removeChild(child);
    child = appendNews.lastElementChild;
  }
}

function tagShow() {

  let tagJudge = document.getElementsByClassName("content")[0].offsetWidth;
  let tagsShow = document.querySelectorAll(".newsTags");
  let renderTagsShow = document.querySelectorAll(".renderTags");

  if(document.querySelectorAll(".newsTags") && tagJudge > 1150) {
    tagsShow.forEach(tagShow => tagShow.style.display = "block");
  } else if (document.querySelectorAll(".newsTags") && tagJudge < 1151) {
    tagsShow.forEach(tagShow => tagShow.style.display = "none");
  }
  if(document.querySelectorAll(".renderTags") && tagJudge > 1150) {
    renderTagsShow.forEach(tagShow => tagShow.style.display = "block");
  } else if (document.querySelectorAll(".renderTags") && tagJudge < 1151) {
    renderTagsShow.forEach(tagShow => tagShow.style.display = "none");
  }
}
