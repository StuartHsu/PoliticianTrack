const filters = document.querySelectorAll('.filter');
const mainFilter = document.querySelector('.mainFilter');
const partyList = document.querySelector('.partyList');
const switchButton = document.querySelector('.switch');

let people = document.querySelectorAll('.person');
let issues = document.querySelectorAll('.issue');

const appendNews = document.getElementById("appendNews");
const filIssues = document.querySelector(".issueList .inner");

const tips = document.getElementById("tips");
const noContent = document.querySelector(".noContent");
const personTitle = document.querySelector(".personTitle");
const issueTitle = document.querySelector(".issueTitle");

// Pol, Issue record
let param = {
  politician: [],
  issue: [],
  party: []
}

let strictMode = false;

// people eventListener use
let firstPolName;
let firstPolClass;
let oldFirstPolName;
let oldFirstPolClass;

let newsLists;

//------------ User click ------------

// sidenav 選擇處理
filters.forEach(filter => filter.addEventListener('click', function(event) {
  let chooseFilter = event.target.id;

  if(this.classList.contains("highlight")) { // 關掉 sidenav

    this.classList.remove("highlight");
    switch(chooseFilter) {
      case "main":
        mainFilter.style.display = "none";
        break;
      case "party":
        partyList.style.display = "none";
        break;
      default:
    }
  } else { // 該點擊項目尚未被選擇
    this.classList.add("highlight");
    switch(chooseFilter) {
      case "main":
        mainFilter.style.display = "flex";
        break;
      case "party":
        partyList.style.display = "block";
        break;
      default:
    }
  }
}));

// 人物選擇處理
people.forEach(person => person.addEventListener('click', function(event) {
  param.politician = []; // 清空
  let compTitleName1 = document.getElementById("compTitleName1");
  let compTitleName2 = document.getElementById("compTitleName2");
  if(this.classList.contains("innerHighlight")) {
    if(this.innerText === oldFirstPolName) {
      this.classList.remove("innerHighlight");
      oldFirstPolName = "";
      firstPolName = "";
    } else {
      this.classList.remove("innerHighlight");
      firstPolName = oldFirstPolName;
      firstPolClass = oldFirstPolClass;
    }
  } else {
    if(firstPolName) {
      oldFirstPolName = firstPolName;
      oldFirstPolClass = firstPolClass;
      people.forEach(r => r.classList.remove("innerHighlight"));
      firstPolClass.add("innerHighlight");
      this.classList.add("innerHighlight");
    } else {
      this.classList.add("innerHighlight");
    }
    firstPolName = event.target.innerText;
    firstPolClass = event.target.classList;
  }

  people.forEach(function(person) {
    if(person.classList.contains("innerHighlight")) {
      param.politician.push(person.innerText);
    }
  });

  if(param.politician[0] && param.politician[1]) {
    compTitleName1.innerHTML = param.politician[0];
    compTitleName2.innerHTML = param.politician[1];
    compTitleName1.classList.remove("point");
    compTitleName2.classList.remove("point");
  } else if(param.politician[0] && !param.politician[1]) {
    compTitleName1.innerHTML = param.politician[0];
    compTitleName2.innerHTML = "人物二";
    compTitleName1.classList.remove("point");
    compTitleName2.classList.add("point");
  } else {
    compTitleName1.innerHTML = "人物一";
    compTitleName2.innerHTML = "人物二";
    compTitleName1.classList.add("point");
    compTitleName2.classList.add("point");
  }
  polIssue(param);

  if(param.politician.length === 2 && param.issue.length === 1) {
    tips.style.display = "none";
    appSide.scrollTop = 0;
    if(strictMode === false) {
      getCompare(param);
    } else {
      getCompareLess(param);
    }
  } else {
    removeData(appendNews);
    tips.style.display = "block";
    noContent.style.display = "none";
    appendNews.style.display = "none";
  }
}));

// 議題選擇處理
issues.forEach(issue => issue.addEventListener('click', function(event) {
  param.issue = []; // 清空
  let compTitleIssue = document.getElementById("compTitleIssue");
  if(this.classList.contains("innerHighlight")) {
    this.classList.remove("innerHighlight");
    compTitleIssue.innerHTML = "比較議題";
    compTitleIssue.classList.add("point");
  } else {
    issues.forEach(r => r.classList.remove("innerHighlight"));
    this.classList.add("innerHighlight");
    compTitleIssue.innerHTML = this.innerHTML;
    compTitleIssue.classList.remove("point");
  }

  issues.forEach(function(issue) {
    if(issue.classList.contains("innerHighlight")) {
      param.issue.push(issue.innerText);
    }
  });

  if(param.politician.length === 2 && param.issue.length === 1) {
    tips.style.display = "none";
    appSide.scrollTop = 0;
    if(strictMode === false) {
      getCompare(param);
    } else {
      getCompareLess(param);
    }
  } else {
    removeData(appendNews);
    tips.style.display = "block";
    noContent.style.display = "none";
    appendNews.style.display = "none";
  }
}));

switchButton.addEventListener('click', function(event) {

  if(param.politician.length === 2 && param.issue.length === 1) {
    tips.style.display = "none";
    appSide.scrollTop = 0;
    if(strictMode === false) {
      getCompareLess(param);
      strictMode = true;
      document.querySelector('.switchTitle').style.color = "#424242";
    } else {
      getCompare(param);
      strictMode = false;
      document.querySelector('.switchTitle').style.color = "#CDCDCD";
    }
  } else {
    removeData(appendNews);
    tips.style.display = "block";
    appendNews.style.display = "none";
  }
});

// filter - 人物標題處理
personTitle.addEventListener('click', function(event) {
  people.forEach(r => r.classList.remove("innerHighlight"));
  param.politician = [];
  firstPolName = "";
  oldFirstPolName = "";
  compTitleName1.innerHTML = "人物一";
  compTitleName2.innerHTML = "人物二";
  compTitleName1.classList.add("point");
  compTitleName2.classList.add("point");
  polIssue(param);

  if(param.politician.length === 2 && param.issue.length === 1) {
    tips.style.display = "none";
    appSide.scrollTop = 0;
    if(strictMode === false) {
      getCompare(param);
    } else {
      getCompareLess(param);
    }
  } else {
    removeData(appendNews);
    tips.style.display = "block";
    noContent.style.display = "none";
    appendNews.style.display = "none";
  }
});

// filter - 議題標題處理
issueTitle.addEventListener('click', function(event) {
  issues = document.querySelectorAll('.issue');
  issues.forEach(r => r.classList.remove("innerHighlight"));
  param.issue = [];
  compTitleIssue.innerHTML = "比較議題";
  compTitleIssue.classList.add("point");

  if(param.politician.length === 2 && param.issue.length === 1) {
    tips.style.display = "none";
    appSide.scrollTop = 0;
    if(strictMode === false) {
      getCompare(param);
    } else {
      getCompareLess(param);
    }
  } else {
    removeData(appendNews);
    tips.style.display = "block";
    noContent.style.display = "none";
    appendNews.style.display = "none";
  }
});

//------------ Server ------------

// Get compare DB data
function getCompare(param) {
  $.ajax({
    url: "api/news/getNews/normal",
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      removeData(appendNews);
      if(resp.data) {
        if(resp.data.news.length < 1){ // 無資料
          noContent.style.display = "block";
          appendNews.style.display = "none";
        } else {
          noContent.style.display = "none";
          appendNews.style.display = "block";
        }
        newsCount(resp.data.id1Count, resp.data.id2Count);
        dataCompareForm(resp.data.news, param.politician);
        page = 0;
        next_paging = resp.data.next_paging;
        appSide.scrollTop =  0;
      }
    }
  });
}

// Get compare DB data - paging
function getComparePage(param, page) {
  scrollStatus = false;
  $.ajax({
    url: `api/news/getNews/normal?paging=${page}`,
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      if(resp.data) {
        if(resp.data.news.length < 1){ // 無資料
          noContent.style.display = "block";
          appendNews.style.display = "none";
        } else {
          noContent.style.display = "none";
          appendNews.style.display = "block";
        }
        dataCompareForm(resp.data.news, param.politician);
        next_paging = resp.data.next_paging;
        scrollStatus = true;
      }
    }
  });
}

// DB 取資料 - 標題 mode
function getCompareLess(param) {
  $.ajax({
    url: "api/news/getNews/accurate",
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      removeData(appendNews);
      newsCount(resp.data.id1Count, resp.data.id2Count);
      dataCompareForm(resp.data.news, param.politician);
      page = 0;
      next_paging = resp.data.next_paging;
      appSide.scrollTop =  0;
    }
  });
}

// DB 取資料 - 標題 mode - page
function getCompareLessPage(param, page) {
  scrollStatus = false;
  $.ajax({
    url: `api/news/getNews/accurate?paging=${page}`,
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      dataCompareForm(resp.data.news, param.politician);
      next_paging = resp.data.next_paging;
      scrollStatus = true;
    }
  });
}

// DB 取資料 - 人物影響議題
function polIssue(param) {
  $.ajax({
    url: `api/getIssuesByPolitician`,
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      removeData(filIssues);
      filIssuesForm(resp);
    }
  });
}

//------------ Function ------------

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

// Compare data 組裝
function dataCompareForm(respData, politician) {

  for (let i = 0; i < respData.length; i ++) {
    // timeDivide
    var timeDivideDiv = document.createElement("div");
    timeDivideDiv.className = "timeDivide";

    var timeDivideSpan = document.createElement("span");

    var time = new Date(respData[i].pubTime);

    if(i > 0) {
      var preRawTime = new Date(respData[i - 1].pubTime);

      var preTime = preRawTime.getFullYear() + " / " + (preRawTime.getMonth() < 10 ? '0' : '') + (preRawTime.getMonth() + 1);
      var curTime = time.getFullYear() + " / " + (time.getMonth() < 10 ? '0' : '') + (time.getMonth() + 1);

      if(preTime !== curTime) {
        timeDivideSpan.innerHTML = curTime;
        timeDivideDiv.appendChild(timeDivideSpan);
      } else {
        timeDivideDiv.style.display = "none";
      }
    } else {
      timeDivideSpan.innerHTML = time.getFullYear() + " / " + (time.getMonth() < 10 ? '0' : '') + (time.getMonth() + 1);
      timeDivideDiv.appendChild(timeDivideSpan);
    }

    appendNews.appendChild(timeDivideDiv);

    var li = document.createElement("li");
    var positionDiv = document.createElement("div");

    // news
    var newsDiv = document.createElement("div");

    if(respData[i].tag_id === politician[0]) {
      positionDiv.className = "left click";
      newsDiv.className = "news leftnews";
    } else if (respData[i].tag_id === politician[1]) {
      positionDiv.className = "right click";
      newsDiv.className = "news rightnews";
    } else {
      positionDiv.className = "center click";
      newsDiv.className = "news centernews";
    }
    newsDiv.setAttribute("onclick", "readMore()");

    var newsContentDiv = document.createElement("div");
    newsContentDiv.className = "news-content";

    var titleDiv = document.createElement("div");
    titleDiv.className = "title hidden";
    titleDiv.innerHTML = respData[i].title;

    var publisherDiv = document.createElement("div");
    publisherDiv.className = "publisher hidden";
    publisherDiv.innerHTML = respData[i].publisher;

    var pubTimeDiv = document.createElement("div");
    pubTimeDiv.className = "pubTime hidden";
    pubTimeDiv.innerHTML = respData[i].pubTime;

    var contentDiv = document.createElement("div");
    contentDiv.className = "mainContent hidden";
    var contentP = document.createElement("p");
    let modContent = respData[i].content.replace(/(\u3002\u300d)/g, '。」<br><br>').replace(/(\u3002)(?!\u300d)/g, '。<br><br>')
    contentP.innerHTML = modContent;

    var urlA = document.createElement("a");
    urlA.className = "url hidden";
    urlA.innerHTML = `新聞來源：${respData[i].href}`;
    urlA.setAttribute("href", `${respData[i].href}`);
    urlA.setAttribute("target", "_blank");

    contentDiv.appendChild(contentP);
    newsContentDiv.appendChild(titleDiv);
    newsContentDiv.appendChild(publisherDiv);
    newsContentDiv.appendChild(pubTimeDiv);
    newsContentDiv.appendChild(contentDiv);
    newsContentDiv.appendChild(urlA);

    newsDiv.appendChild(newsContentDiv);

    // 組合
    positionDiv.appendChild(newsDiv);
    li.appendChild(positionDiv);

    appendNews.appendChild(li);
    appendNews.style.display = "block";
  }
}

// filter-issue 組裝
function filIssuesForm(respData) {
  let dataLength = respData.length;

  for(let i = 0; i < dataLength; i++) {
    var polGetIssLi = document.createElement("li");
    polGetIssLi.className = "issue";
    polGetIssLi.innerHTML = respData[i].name;

    // 建立 child 監聽
    polGetIssLi.addEventListener('click', function() {
      param.issue = [];
      appIssues = document.querySelectorAll('.issue');
      if(this.classList.contains("innerHighlight")) {
        this.classList.remove("innerHighlight");
        param.issue = [];
        compTitleIssue.innerHTML = "比較議題";
        compTitleIssue.classList.add("point");
      } else {
        appIssues.forEach(r => r.classList.remove("innerHighlight"));
        this.classList.add("innerHighlight");
        compTitleIssue.innerHTML = this.innerHTML;
        compTitleIssue.classList.remove("point");
      }

      appIssues.forEach(function(issue) {
        if(issue.classList.contains("innerHighlight")) {
          param.issue.push(issue.innerHTML);
        }
      });

      if(param.politician.length === 2 && param.issue.length === 1) {
        tips.style.display = "none";
        appSide.scrollTop = 0;
        if(strictMode === false) {
          getCompare(param);
        } else {
          getCompareLess(param);
        }
      } else {
        removeData(appendNews);
        tips.style.display = "block";
        noContent.style.display = "none";
        appendNews.style.display = "none";
      }
    });
    filIssues.appendChild(polGetIssLi);
    filterHL(param);
  }

}

// 移除子項目
function removeData(item) {
  var child = item.lastElementChild;
  while(child) {
    item.removeChild(child);
    child = item.lastElementChild;
  }
}

// filter tag refresh
function filterHL(param) {
  issues = document.querySelectorAll('.issue');

  issues.forEach(r => r.classList.remove("innerHighlight"));

  for(let i = 0; i < issues.length; i++) {
    let issueContent = issues[i].innerText;
    if (issueContent.indexOf(param.issue[0]) != -1) {
      issues[i].classList.add("innerHighlight");
    }
  }
}

function readMore() {
  let parentTarget = event.currentTarget.childNodes[0];
  if(parentTarget.classList.contains("openFlag")) {
    parentTarget.classList.remove("openFlag");
    parentTarget.childNodes.forEach(child => child.classList.add("hidden"));
  } else {
    parentTarget.classList.add("openFlag");
    parentTarget.childNodes.forEach(child => child.classList.remove("hidden"));
  }
  // 取得當下點開的是第幾子元素
  var child = event.currentTarget.parentNode.parentNode
  var h = 0; // 第幾個子元素
  var k = 0; // 前面有幾個展開
  var l = 0; // 前面有幾個展開的日期
  var hl = 0; // 前面有幾個共同項目
  let height = 0;
  while((child = child.previousSibling) != null) {
    h++;
  }
  for(let i = 1; i < h; i = i + 2) {
    if(event.currentTarget.parentNode.parentNode.parentNode.childNodes[i].childNodes[0].childNodes[0].childNodes[0].classList.contains("openFlag")) { // 有展開的項目
      height += event.currentTarget.parentNode.parentNode.parentNode.childNodes[i].childNodes[0].childNodes[0].offsetHeight + 20 // 20(margin)
    } else { // 無展開的項目
      if(event.currentTarget.parentNode.parentNode.parentNode.childNodes[i].childNodes[0].childNodes[0].classList.contains("centernews")) {
        hl++;
      } else {
        k++;
      }
    }
  }
  for(let i = 0; i < h; i = i + 2) {
    if(event.currentTarget.parentNode.parentNode.parentNode.childNodes[i].childNodes.length === 1) { // 有展開的項目
      l++;
    }
  }
  // for appendNews & oncomingNews
  appSide.scrollTop = height + (k * 99) + (l * 51) + (hl * 103) + 16; // 16(頂端 padding)
}

let page = 0;
let next_paging = 0;
let scrollStatus = true;

let appSide = document.querySelector("#appendNews");

function paging(cond) {
  if(scrollStatus === false) { // waiting for next page
    return;
  }
  let x = appSide.scrollHeight - appSide.scrollTop;
  if(x < 1100 && next_paging !== undefined) {
    page++;
    if(strictMode === false) {
      getComparePage(param, page);
    } else {
      getCompareLessPage(param, page);
    }
  }
}

function newsCount(id1_count, id2_count) {
  if(id1_count === undefined) {
    id1_count = 0;
  }
  if(id2_count === undefined) {
    id2_count = 0;
  }
  if(param.politician.length === 2 && param.issue.length === 1) {
    document.querySelector(".newsCount.right").style.display = "block";
    document.querySelector(".newsCount.left").style.display = "block";
    document.querySelector(".newsCount.right").innerHTML = id1_count;
    document.querySelector(".newsCount.left").innerHTML = id2_count;
  } else {
    document.querySelector(".newsCount.right").style.display = "none";
    document.querySelector(".newsCount.left").style.display = "none";
  }
}
