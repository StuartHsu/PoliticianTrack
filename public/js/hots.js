const tabsTitle = document.querySelectorAll(".tabTitle");
const mainLists = document.querySelectorAll(".mainList");

const oncomingLists = document.getElementById("oncomingHots");

const appendHots = document.getElementById("appendHots");

var preSublistId;

let tabCond = "politician"

tabsTitle.forEach(tabTitle => tabTitle.addEventListener('click', function(event) {
  preSublistId = "";
  removeData(oncomingLists); // 刪除預先載入的資料
  appendHots.style.display = "flex";
  if(this.nextElementSibling.classList.contains("toggle")) {
    tabsTitle.forEach(r => r.nextElementSibling.classList.add("toggle"));
    this.nextElementSibling.classList.remove("toggle");
  }
  tabCond = event.target.id;
  onSide.scrollTop = 0;
  appSide.scrollTop = 0;
  getData(event.target.id);
}));

// get politician sub Issue after click tabTitle
function subListCallIssue(politician_id, politician) {
  getSubData(tabCond, politician_id, politician);
}

// get Issue sub politician after click tabTitle
function subListCallPol(issue_id, issue) {
  getSubData(tabCond, issue_id, issue);
}

// DB 取資料
function getData(item) {
  getMax(item);
  $.ajax({
    url: `/api/gethots/${item}`,
    method: "GET",
    success: function(resp) {
      removeData(appendHots);
      document.getElementById('oncomingHots').style.display = "none";
      dataForm(resp.data.list, item);
      page = 0;
      next_paging = resp.data.next_paging;
    }
  });
}

// DB 取資料 - page
function getDataPage(item, page, cond) {
  scrollStatus = false;
  $.ajax({
    url: `/api/gethots/${item}?paging=${page}`,
    method: "GET",
    success: function(resp) {
      dataForm(resp.data.list, item, cond);
      next_paging = resp.data.next_paging;
      scrollStatus = true;
    }
  });
}

// DB 取資料 - subIssue
function getSubData(type, tag_id, name) {
  $.ajax({
    url: `/api/gethots/sub/${type}?id=${tag_id}`,
    method: "GET",
    success: function(resp) {
      if(preSublistId) {
        if(preSublistId != tag_id) { // 點擊展開外的
          let removeList = document.getElementById(preSublistId);
          removeData(removeList);
          subDataForm(tag_id, resp.data, type, name);
          preSublistId = tag_id;
        } else { // 點擊原本展開的
          removeList = document.getElementById(tag_id);
          removeData(removeList);
          preSublistId = "";
        }
      } else { // 什麼都沒展開
        subDataForm(tag_id, resp.data, type, name);
        preSublistId = tag_id;
      }
    }
  });
}

let maxCount;
function getMax(item) {
  $.ajax({
    url: `/api/gethots/${item}`,
    method: "GET",
    success: function(resp) {
      maxCount = resp.data.list[0].count;
    }
  });
}
getMax("politician");

function dataForm(data, type, cond) {

  let dataLength = data.length;

  for(let i = 0; i < dataLength; i++) {
    var listDiv = document.createElement("div");
    listDiv.className = "list";

    var mainListDiv = document.createElement("div");
    mainListDiv.className = "mainList";
    if(type === "politician") {
      mainListDiv.setAttribute("onclick", `subListCallIssue(${data[i].tag_id},'${data[i].name}')`);
    } else {
      mainListDiv.setAttribute("onclick", `subListCallPol(${data[i].tag_id},'${data[i].name}')`);
    }


    // pol name
    var nameDiv = document.createElement("div");
    nameDiv.className = "polName";
    nameDiv.innerHTML = data[i].name;

    // bar handle
    var barDiv = document.createElement("div");
    barDiv.className = "bar";
    var processDiv = document.createElement("div");
    processDiv.className = "process";

    let thisCount = data[i].count;
    let ratio = (thisCount / maxCount) * 100;
    processDiv.setAttribute("style", `width: ${ratio}%`)

    barDiv.appendChild(processDiv);

    // subLists
    var subListsDiv = document.createElement("div");
    subListsDiv.className = "subLists";
    subListsDiv.setAttribute("id", `${data[i].tag_id}`)

    mainListDiv.appendChild(nameDiv);
    mainListDiv.appendChild(barDiv);

    listDiv.appendChild(mainListDiv);
    listDiv.appendChild(subListsDiv);

    if(cond === "oncoming") {
      onSide.appendChild(listDiv);
    } else {
      appendHots.appendChild(listDiv);
    }
  }

}

function subDataForm(tag_id, data, type, name) {

  const subLists = document.getElementById(tag_id);
  const subListTitle = document.createElement("div");
  subListTitle.className = "subListTitle";

  const subListTitleName = document.createElement("div");
  const subListTitleCount = document.createElement("div");
  subListTitleCount.innerHTML = "新聞數"

  subListTitle.appendChild(subListTitleName);
  subListTitle.appendChild(subListTitleCount);
  subLists.appendChild(subListTitle);

  for(let i = 0; i < data.length; i++) {
    const subListA = document.createElement("a");
    subListA.className = "subList";
    if(type === "politician") {
      subListTitleName.innerHTML = "議題"
      subListA.setAttribute("href", `/politician?politician=${name}&issue=${data[i].name}`);
    } else {
      subListTitleName.innerHTML = "人物"
      subListA.setAttribute("href", `/politician?politician=${data[i].name}&issue=${name}`);
    }

    const nameDiv = document.createElement("div");
    nameDiv.className = "issueName";
    nameDiv.innerHTML = data[i].name;

    const countDiv = document.createElement("div");
    countDiv.className = "issueCount";
    countDiv.innerHTML = data[i].count;

    subListA.appendChild(nameDiv);
    subListA.appendChild(countDiv);


    subLists.appendChild(subListA);
  }
}

function removeData(element) {
  var child = element.lastElementChild;
  while(child) {
    element.removeChild(child);
    child = element.lastElementChild;
  }
}

let page = 0;
let next_paging = 0;
let scrollStatus = true;

let onSide = document.querySelector("#oncomingHots");
let appSide = document.querySelector("#appendHots");

function paging(cond) {
  if(scrollStatus === false) { // waiting for next page
    return;
  }
  let x = appSide.scrollHeight - appSide.scrollTop;
  if(cond === "oncoming") {
    x = onSide.scrollHeight - onSide.scrollTop;
  }
  if(x < 900 && next_paging !== undefined) {
    page++;
    getDataPage(tabCond, page, cond);
  }
}
