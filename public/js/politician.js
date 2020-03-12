const filters = document.querySelectorAll('.filter');
const mainFilter = document.querySelector('.mainFilter');
const partyFilter = document.querySelector('.partyList');
const switchButton = document.querySelector('.switch');

let people = document.querySelectorAll('.person');
let issues = document.querySelectorAll('.issue');
const parties = document.querySelectorAll('.party');

const appendNews = document.getElementById("appendNews");
const filPols = document.querySelector(".politician .inner");
const filIssues = document.querySelector(".issueList .inner");

const oncNoContent = document.querySelector(".appNoContent");
const appNoContent = document.querySelector(".appNoContent");
const personTitle = document.querySelector(".personTitle");
const issueTitle = document.querySelector(".issueTitle");
const boxBorder = document.querySelector(".box-border");

// Pol, Issue record
let param = {
  politician: [],
  issue: [],
  party: []
}

// 檢查是否來自 index/hots
if(getQueryStringValue("politician")) {
  param.politician = [getQueryStringValue("politician")];
}
if(getQueryStringValue("issue")) {
  param.issue = [getQueryStringValue("issue")];
}

let strictMode = false;

//------------ User click ------------

// sidenav 選擇處理
filters.forEach(filter => filter.addEventListener('click', function(event) {
  const chooseFilter = event.target.id;

  if(this.classList.contains("highlight")) { // 關掉 sidenav

    this.classList.remove("highlight");
    switch(chooseFilter) {
      case "main":
        mainFilter.style.display = "none";
        break;
      case "party":
        partyFilter.style.display = "none";
        break;
      default:
    }
    tagShow()
  } else { // 該點擊項目尚未被選擇
    this.classList.add("highlight");
    switch(chooseFilter) {
      case "main":
        mainFilter.style.display = "flex";
        break;
      case "party":
        partyFilter.style.display = "block";
        break;
      default:
    }
    tagShow()
  }
}));

// 人物選擇處理
people.forEach(person => person.addEventListener('click', function(event) {
  param.politician = [];
  if(this.classList.contains("innerHighlight")) {
    this.classList.remove("innerHighlight");
    param.politician = [];
  } else {
    people.forEach(r => r.classList.remove("innerHighlight"));
    this.classList.add("innerHighlight");
  }

  people.forEach(function(person) {
    if(person.classList.contains("innerHighlight")) {
      param.politician.push(person.innerText);
    }
  });
  appSide.scrollTop = 0;

  getIssuesByPolitician(param);
  if(strictMode === false) {
    getNews(param);
  } else {
    getNewsLess(param);
  }
  filterHL(param);

  if(param.politician.length === 0) {
    personTitle.innerHTML = "人物";
    personTitle.style.color = "#FFFFFF"
  } else {
    personTitle.innerHTML = param.politician;
    personTitle.style.color = "#FFD479"
  }
}));

// 議題選擇處理
issues.forEach(issue => issue.addEventListener('click', function(event) {
  param.issue = []; // 清空
  if(this.classList.contains("innerHighlight")) {
    this.classList.remove("innerHighlight");
  } else {
    issues.forEach(r => r.classList.remove("innerHighlight"));
    this.classList.add("innerHighlight");
  }

  issues.forEach(function(issue) {
    if(issue.classList.contains("innerHighlight")) {
      param.issue.push(issue.innerText);
    }
  });
  appSide.scrollTop = 0;

  if(strictMode === false) {
    getNews(param);
  } else {
    getNewsLess(param);
  }
  filterHL(param);

  if(param.issue.length === 0) {
    issueTitle.innerHTML = "議題";
    issueTitle.style.color = "#FFFFFF"
  } else {
    issueTitle.innerHTML = param.issue;
    issueTitle.style.color = "#FFD479"
  }
}));

// 政黨選擇處理
parties.forEach(party => party.addEventListener('click', function(event) {
  param.party = [];
  if(this.classList.contains("innerHighlight")) {
    this.classList.remove("innerHighlight");
  } else {
    parties.forEach(r => r.classList.remove("innerHighlight"));
    this.classList.add("innerHighlight");
  }

  parties.forEach(function(party) {
    if(party.classList.contains("innerHighlight")) {
      param.party.push(party.innerText);
    }
  });
  getPoliticiansByParty(param);
  filterHL(param);
}));

// mode switch
switchButton.addEventListener('click', function(event) {
  if(strictMode === false) {
    getNewsLess(param);
    strictMode = true;
    document.querySelector('.switchTitle').style.color = "#424242";
  } else {
    getNews(param);
    strictMode = false;
    document.querySelector('.switchTitle').style.color = "#CDCDCD";
  }
});

// 人物標題處理
personTitle.addEventListener('click', function(event) {
  appPols = document.querySelectorAll('.person');
  if(param.politician.length !== 0) {
    appPols.forEach(r => r.classList.remove("innerHighlight"));
    personTitle.innerHTML = "人物";
    personTitle.style.color = "#FFFFFF"
    param.politician = [];
    getIssuesByPolitician(param);
    if(strictMode === false) {
      getNews(param);
    } else {
      getNewsLess(param);
    }
    filterHL(param);
  }
});

// 議題標題處理
issueTitle.addEventListener('click', function(event) {
  appIssues = document.querySelectorAll('.issue');
  if(param.issue.length !== 0) {
    appIssues.forEach(r => r.classList.remove("innerHighlight"));
    issueTitle.innerHTML = "議題";
    issueTitle.style.color = "#FFFFFF"
    param.issue = [];
    getIssuesByPolitician(param);
    if(strictMode === false) {
      getNews(param);
    } else {
      getNewsLess(param);
    }
    filterHL(param);
  }
});

// 新聞旁標籤點選切換
function tagCall(tagName, cond) {
  param = {
    politician: [],
    issue: [],
    party: []
  }
  if(cond === "politician") {
    param.politician = [tagName]
  } else {
    param.issue = [tagName]
  }
  getPoliticiansByParty(param);
  getIssuesByPolitician(param);
  appSide.scrollTop = 0;
  if(strictMode === false) {
    getNews(param);
  } else {
    getNewsLess(param);
  }
  filterHL(param);

  if(param.politician.length === 0) {
    personTitle.innerHTML = "人物";
    personTitle.style.color = "#FFFFFF"
  } else {
    personTitle.innerHTML = param.politician;
    personTitle.style.color = "#FFD479"
  }

  if(param.issue.length === 0) {
    issueTitle.innerHTML = "議題";
    issueTitle.style.color = "#FFFFFF"
  } else {
    issueTitle.innerHTML = param.issue;
    issueTitle.style.color = "#FFD479"
  }
}

//------------ Server ------------

// DB 取資料
function getNews(param) {
  $.ajax({
    url: `api/news/getNews/normal`,
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      removeData(appendNews);
      changeTitle(param.politician, param.issue);
      if(resp.data) {
        if(resp.data.news.length < 1){ // 無資料
          appNoContent.style.display = "block";
          appendNews.style.display = "none";
        } else {
          appNoContent.style.display = "none";
          appendNews.style.display = "block";
        }
        dataForm(resp.data.news, param);
        tagShow();
        page = 0;
        next_paging = resp.data.next_paging;
        appSide.scrollTop =  0;
        onSide.scrollTop =  0;
      }
    }
  });
}

// DB 取資料 - paging
function getNewsPage(param, page, cond) {
  scrollStatus = false;
  $.ajax({
    url: `api/news/getNews/normal?paging=${page}`,
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      if(resp.data) {
        dataForm(resp.data.news, param, cond);
        tagShow();
        next_paging = resp.data.next_paging;
      }
      scrollStatus = true;
    }
  });
}

// DB 取資料 - 政黨影響人物
function getPoliticiansByParty(param) {
  $.ajax({
    url: `api/getPoliticiansByParty`,
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      removeData(filPols);
      filPolsForm(resp.data);
    }
  });
}

// DB 取資料 - 人物影響議題
function getIssuesByPolitician(param) {
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

// DB 取資料 - 標題 mode
function getNewsLess(param) {
  $.ajax({
    url: "api/news/getNews/accurate",
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      removeData(appendNews);
      changeTitle(param.politician, param.issue);
      if(resp.data) {
        if(resp.data.news.length < 1) {
          appNoContent.style.display = "block";
          appendNews.style.display = "none";
        } else {
          appNoContent.style.display = "none";
          appendNews.style.display = "block";
        }
        dataForm(resp.data.news, param);
        tagShow();
        page = 0;
        next_paging = resp.data.next_paging;
        appSide.scrollTop =  0;
        onSide.scrollTop =  0;
      }
    }
  });
}

// DB 取資料 - 標題 mode - paging
function getNewsLessPage(param, page, cond) {
  scrollStatus = false;
  $.ajax({
    url: `api/news/getNews/accurate?paging=${page}`,
    type: "POST",
    data: JSON.stringify(param),
    contentType: "application/json; charset=utf-8",
    success: function(resp) {
      if(resp.data) {
        dataForm(resp.data.news, param, cond);
        tagShow();
        next_paging = resp.data.next_paging;
      }
      scrollStatus = true;
    }
  });
}

//------------ Function ------------

// 更改原始標題
function changeTitle(polName, issueName) {
  const titleName = document.getElementById("titleName");
  const titleIssue = document.getElementById("titleIssue");
  if(polName.length === 0 && issueName.length === 0) {
    titleName.innerHTML = "總覽";
    titleIssue.innerHTML = "";
  } else if(polName.length === 2) {
    titleName.innerHTML = polName[0] + " " + polName[1];
    titleIssue.innerHTML = issueName;
  } else if(polName.length === 0) {
    titleName.innerHTML = issueName;
    titleIssue.innerHTML = "";
  } else {
    titleName.innerHTML = polName;
    titleIssue.innerHTML = issueName;
  }
}

// Data 組裝
function dataForm(respData, param, cond) {

  for (let i = 0; i < respData.length; i ++) {
    const li = document.createElement("li");

    // timeline
    const timelineDiv = document.createElement("div");
    timelineDiv.className = "timeline";

    const time = new Date(respData[i].pubTime);

    const yearP = document.createElement("p");
    const monthP = document.createElement("p");
    yearP.className = "year";
    monthP.className = "month";

    if(i > 0) {
      const preTime = new Date(respData[i - 1].pubTime);

      const preTimeY = preTime.getFullYear();
      const preTimeM = preTime.getMonth();
      const curTimeY = time.getFullYear();
      const curTimeM = time.getMonth();

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
    const newsDiv = document.createElement("div");
    newsDiv.className = "news";
    newsDiv.setAttribute("onclick", `readMore()`)

    const newsContentDiv = document.createElement("div");
    newsContentDiv.className = "news-content";

    const titleDiv = document.createElement("div");
    titleDiv.className = "title";
    titleDiv.innerHTML = respData[i].title;

    const publisherDiv = document.createElement("div");
    publisherDiv.className = "publisher";
    publisherDiv.innerHTML = respData[i].publisher;

    const pubTimeDiv = document.createElement("div");
    pubTimeDiv.className = "pubTime";
    pubTimeDiv.innerHTML = respData[i].pubTime;

    const descDiv = document.createElement("div");
    descDiv.className = "desc";
    const descP = document.createElement("p");
    descP.innerHTML = respData[i].content;

    const contentDiv = document.createElement("div");
    contentDiv.className = "mainContent hidden";
    const contentP = document.createElement("p");
    const modContent = respData[i].content.replace(/(\u3002\u300d)/g, '。」<br><br>').replace(/(\u3002)(?!\u300d)/g, '。<br><br>')
    contentP.innerHTML = modContent;

    const urlA = document.createElement("a");
    urlA.className = "url hidden";
    urlA.innerHTML = `新聞來源：${respData[i].href}`;
    urlA.setAttribute("href", `${respData[i].href}`);
    urlA.setAttribute("target", "_blank");

    descDiv.appendChild(descP);
    contentDiv.appendChild(contentP);
    newsContentDiv.appendChild(titleDiv);
    newsContentDiv.appendChild(publisherDiv);
    newsContentDiv.appendChild(pubTimeDiv);
    newsContentDiv.appendChild(descDiv);
    newsContentDiv.appendChild(contentDiv);
    newsContentDiv.appendChild(urlA);

    newsDiv.appendChild(newsContentDiv);

    // tags
    const tagsDiv = document.createElement("div");
    tagsDiv.className = "newsTags";

    const tagUlPol = document.createElement("ul");
    tagUlPol.className = "ulPol";
    const tagUlIsu = document.createElement("ul");
    tagUlIsu.className = "ulIsu";

    let polTagC = 0;
    let isuTagC = 0;
    // for(let j = 0; j < respData[i].tag.length && j < 10; j++) {
    for(let j = 0; j < respData[i].tag.length && polTagC < 8 && isuTagC < 8; j++) {
      const tagLiPol = document.createElement("li");
      const tagLiIsu = document.createElement("li");
      // if(respData[i].tag[j].tagName != name) {
      if(param.politician.indexOf(respData[i].tag[j].tagName) == -1 && param.issue.indexOf(respData[i].tag[j].tagName) == -1) {
        tagLiPol.innerHTML = respData[i].tag[j].tagName;
        tagLiIsu.innerHTML = respData[i].tag[j].tagName;
        if(respData[i].tag[j].tagType === "NRP") {
          tagLiPol.className = "polTag";
          tagLiPol.setAttribute("onclick", `tagCall("${respData[i].tag[j].tagName}", "politician")`);
          tagUlPol.appendChild(tagLiPol);
          polTagC++;
        } else {
          tagLiIsu.className = "issueTag";
          tagLiIsu.setAttribute("onclick", `tagCall("${respData[i].tag[j].tagName}", "issue")`);
          tagUlIsu.appendChild(tagLiIsu);
          isuTagC++;
        }
      }
    }
    tagsDiv.appendChild(tagUlPol);
    tagsDiv.appendChild(tagUlIsu);

    // 組合
    li.appendChild(timelineDiv);
    li.appendChild(newsDiv);
    li.appendChild(tagsDiv);

    if(cond === "oncoming" || cond === "index" || cond === "hots") {
      onSide.appendChild(li);
    } else {
      appendNews.appendChild(li);
      document.getElementById('oncomingNewsP').style.display = "none";
      document.getElementById('appendNewsP').style.display = "flex";
    }
  }
}

// Data 組裝 Less
function dataFormLess(respData, politician) {
  document.getElementById('oncomingNewsP').style.display = "none";
  document.getElementById('appendNewsP').style.display = "flex";

  for (let i = 0; i < respData.length; i ++) {
    const li = document.createElement("li");

    // timeline
    const timelineDiv = document.createElement("div");
    timelineDiv.className = "timeline";

    const time = new Date(respData[i].pubTime);

    const yearP = document.createElement("p");
    const monthP = document.createElement("p");
    yearP.className = "year";
    monthP.className = "month";

    if(i > 0) {
      const preTime = new Date(respData[i - 1].pubTime);

      const preTimeY = preTime.getFullYear();
      const preTimeM = preTime.getMonth();
      const curTimeY = time.getFullYear();
      const curTimeM = time.getMonth();

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
    const newsDiv = document.createElement("div");
    newsDiv.className = "news";
    newsDiv.setAttribute("onclick", "readMore()");

    const newsContentDiv = document.createElement("div");
    newsContentDiv.className = "news-content";

    const titleDiv = document.createElement("div");
    titleDiv.className = "title";
    titleDiv.innerHTML = respData[i].title;

    const publisherDiv = document.createElement("div");
    publisherDiv.className = "publisher";
    publisherDiv.innerHTML = respData[i].publisher;

    const pubTimeDiv = document.createElement("div");
    pubTimeDiv.className = "pubTime";
    pubTimeDiv.innerHTML = respData[i].pubTime;

    const descDiv = document.createElement("div");
    descDiv.className = "desc";
    const descP = document.createElement("p");
    descP.innerHTML = respData[i].description;

    const contentDiv = document.createElement("div");
    contentDiv.className = "mainContent hidden";
    const contentP = document.createElement("p");
    const modContent = respData[i].content.replace(/(\u3002\u300d)/g, '。」<br><br>').replace(/(\u3002)(?!\u300d)/g, '。<br><br>')
    contentP.innerHTML = modContent;

    const urlA = document.createElement("a");
    urlA.className = "url hidden";
    urlA.innerHTML = `新聞來源：${respData[i].href}`;
    urlA.setAttribute("href", `${respData[i].href}`);
    urlA.setAttribute("target", "_blank");

    descDiv.appendChild(descP);
    contentDiv.appendChild(contentP);
    newsContentDiv.appendChild(titleDiv);
    newsContentDiv.appendChild(publisherDiv);
    newsContentDiv.appendChild(pubTimeDiv);
    newsContentDiv.appendChild(descDiv);
    newsContentDiv.appendChild(contentDiv);
    newsContentDiv.appendChild(urlA);

    newsDiv.appendChild(newsContentDiv);

    // 組合
    li.appendChild(timelineDiv);
    li.appendChild(newsDiv);

    appendNews.appendChild(li);
  }
}

// filter-pols 組裝
function filPolsForm(respData) {

  const dataLength = respData.length;
  for(let i = 0; i < dataLength; i++) {
    const filPolLi = document.createElement("li");
    filPolLi.className = "person";
    filPolLi.innerHTML = respData[i].name;

    // 建立 child-pols 監聽
    filPolLi.addEventListener('click', function() {
      // polList = [];
      param.politician = [];
      appPols = document.querySelectorAll('.person');
      if(this.classList.contains("innerHighlight")) {
        this.classList.remove("innerHighlight");
        param.politician = [];
      } else {
        appPols.forEach(r => r.classList.remove("innerHighlight"));
        this.classList.add("innerHighlight");
      }

      appPols.forEach(function(person) {
        if(person.classList.contains("innerHighlight")) {
          param.politician.push(person.innerHTML);
        }
      });

      appSide.scrollTop = 0;
      if(strictMode === false) {
        getNews(param);
      } else {
        getNewsLess(param);
      }
      getIssuesByPolitician(param);
      // pol filter 標題改
      if(param.politician.length === 0) {
        personTitle.innerHTML = "人物";
        personTitle.style.color = "#FFFFFF"
      } else {
        personTitle.innerHTML = param.politician;
        personTitle.style.color = "#FFD479"
      }
    });
    filPols.appendChild(filPolLi);
    filterHL(param);
  }
}

// filter-issue 組裝
function filIssuesForm(respData) {
  const dataLength = respData.length;

  for(let i = 0; i < dataLength; i++) {
    const polGetIssLi = document.createElement("li");
    polGetIssLi.className = "issue";
    polGetIssLi.innerHTML = respData[i].name;

    // 建立 child 監聽
    polGetIssLi.addEventListener('click', function() {
      param.issue = [];
      appIssues = document.querySelectorAll('.issue');
      if(this.classList.contains("innerHighlight")) {
        this.classList.remove("innerHighlight");
        param.issue = [];
      } else {
        appIssues.forEach(r => r.classList.remove("innerHighlight"));
        this.classList.add("innerHighlight");
      }

      appIssues.forEach(function(issue) {
        if(issue.classList.contains("innerHighlight")) {
          param.issue.push(issue.innerHTML);
        }
      });
      appSide.scrollTop = 0;
      if(strictMode === false) {
        getNews(param);
      } else {
        getNewsLess(param);
      }
      // issue filter 標題改
      if(param.issue.length === 0) {
        issueTitle.innerHTML = "議題";
        issueTitle.style.color = "#FFFFFF"
      } else {
        issueTitle.innerHTML = param.issue;
        issueTitle.style.color = "#FFD479"
      }
    });
    filIssues.appendChild(polGetIssLi);
    filterHL(param);
  }

}


// 移除子項目
function removeData(item) {
  let child = item.lastElementChild;
  while(child) {
    item.removeChild(child);
    child = item.lastElementChild;
  }
}

// 點擊 tag 更新 filter HL
function addHLByTag(item, className) {
  const polClasses = document.getElementsByClassName(className),
      results = [];
  for(var i = 0; i < polClasses.length; i++) {
    const content = polClasses[i].innerText;
    if (content.indexOf(item) != -1) {
      results.push(polClasses[i]);
      polClasses[i].classList.add("innerHighlight")
    }
  }
}

// filter tag refresh
function filterHL(param) {
  const partyClasses = document.getElementsByClassName("party");

  people = document.querySelectorAll('.person');
  issues = document.querySelectorAll('.issue');

  people.forEach(r => r.classList.remove("innerHighlight"));
  issues.forEach(r => r.classList.remove("innerHighlight"));

  for(let i = 0; i < people.length; i++) {
    const polContent = people[i].innerText;
    if (polContent.indexOf(param.politician[0]) != -1) {
      people[i].classList.add("innerHighlight");
    }
  }
  for(let i = 0; i < issues.length; i++) {
    const issueContent = issues[i].innerText;
    if (issueContent.indexOf(param.issue[0]) != -1) {
      issues[i].classList.add("innerHighlight");
    }
  }
}

// 標籤顯示處理 -> CSS??
function tagShow() {

  const tagJudge = document.getElementsByClassName("content")[0].offsetWidth;
  const tagsShow = document.querySelectorAll(".newsTags");
  const renderTagsShow = document.querySelectorAll(".renderTags");

  if(document.querySelectorAll(".newsTags") && tagJudge > 1150) {
    tagsShow.forEach(tagShow => tagShow.style.display = "flex");
  } else if (document.querySelectorAll(".newsTags") && tagJudge < 1151) {
    tagsShow.forEach(tagShow => tagShow.style.display = "none");
  }
  if(document.querySelectorAll(".renderTags") && tagJudge > 1150) {
    renderTagsShow.forEach(tagShow => tagShow.style.display = "flex");
  } else if (document.querySelectorAll(".renderTags") && tagJudge < 1151) {
    renderTagsShow.forEach(tagShow => tagShow.style.display = "none");
  }
}

// 展開
function readMore() {
  const parentTarget = event.currentTarget.childNodes[0];
  if(parentTarget.classList.contains("openFlag")) {
    parentTarget.classList.remove("openFlag");
    parentTarget.childNodes[3].classList.remove("hidden");
    parentTarget.childNodes[4].classList.add("hidden");
    parentTarget.childNodes[5].classList.add("hidden");
  } else {
    parentTarget.classList.add("openFlag");
    parentTarget.childNodes[3].classList.add("hidden");
    parentTarget.childNodes[4].classList.remove("hidden");
    parentTarget.childNodes[5].classList.remove("hidden");
  }
  // 取得當下點開的是第幾子元素
  let child = event.currentTarget.parentNode
  let h = 0; // 第幾個子元素
  let k = 0; // 前面有幾個展開
  let height = 0;
  while((child = child.previousSibling) != null) {
    h++;
  }
  for(let i = 1; i < h; i++) {
    if(event.currentTarget.parentNode.parentNode.childNodes[i].childNodes[1].childNodes[0].classList.contains("openFlag")) { // 有展開的項目
      height += event.currentTarget.parentNode.parentNode.childNodes[i].childNodes[1].offsetHeight + 20 // 20(margin)
    } else { // 無展開的項目
      k++;
    }
  }
  // for appendNews & oncomingNews
  appSide.scrollTop = height + (k * 185) + 16; // 16(頂端 padding)
  onSide.scrollTop = height + (k * 185) + 16; // 16(頂端 padding)
}

// paging
let page = 0;
let next_paging = 0;
let scrollStatus = true;

const onSide = document.querySelector("#oncomingNews");
const appSide = document.querySelector("#appendNews");
function paging(cond) {
  if(scrollStatus === false) { // waiting for next page
    return;
  }
  let x = appSide.scrollHeight - appSide.scrollTop;
  if(cond === "index" || cond === "hots") {
    param.politician = getQueryStringValue("politician") ? [getQueryStringValue("politician")] : [];
    param.issue = getQueryStringValue("issue") ? [getQueryStringValue("issue")] : [];
  }
  if(cond === "oncoming" || cond === "index" || cond === "hots") {
    x = onSide.scrollHeight - onSide.scrollTop;
  }
  if(x < 1100 && next_paging !== undefined) {
    page++;
    if(strictMode === false) {
      getNewsPage(param, page, cond);
    } else {
      getNewsLessPage(param, page, cond);
    }
  }
}

// get query string
function getQueryStringValue(key) {
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}
