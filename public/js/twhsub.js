const ADMIN_PASSWORD = prompt("請輸入密碼");
if (ADMIN_PASSWORD !== "9527")
{
  window.location.href = "/";
}


const execBtn = document.getElementById("execBtn");
const queryBtn = document.getElementById("queryBtn");
const updateBtn = document.getElementById("updateBtn");
const tagCountBtn = document.getElementById("tagCountBtn");
const tagCountAllBtn = document.getElementById("tagCountAllBtn");
const nlpTrainBtn = document.getElementById("nlpTrainBtn");
const nlpProcessBtn = document.getElementById("nlpProcessBtn");
const getTagBtn = document.getElementById("getTagBtn");
const manAddTagBtn = document.getElementById("manAddTagBtn");
const synonymsBtn =  document.getElementById("synonymsBtn");

const date_start = document.getElementById("date_start");
const date_end = document.getElementById("date_end");
const date_start_nlpT = document.getElementById("date_start_nlpT");
const date_end_nlpT = document.getElementById("date_end_nlpT");
const date_start_nlpP = document.getElementById("date_start_nlpP");
const date_end_nlpP = document.getElementById("date_end_nlpP");
const valueOfinputTagName = document.getElementById("inputTagName");
const valueOfinputTagType = document.getElementById("inputTagType");
const valueOfparentTag = document.getElementById("parentTag");
const valueOfchildTag = document.getElementById("childTag");

const resultSeg = document.getElementById("resultSeg");
const resultTag = document.getElementById("resultTag");
const resultTagC = document.getElementById("resultTagC");
const resultNlpT = document.getElementById("resultNlpT");
const resultNlpP = document.getElementById("resultNlpP");
const resultGetTag = document.getElementById("resultGetTag");
const resultSynTag = document.getElementById("resultSynTag");



const segResults = document.getElementById("segResults");


// 1. 執行新聞斷詞
execBtn.addEventListener('click', function(event) {
  resultSeg.innerHTML = "斷詞中...";
  resultSeg.style.color = "red";
  resultSeg.style.display = "block";
  let data = {
    start: date_start.value,
    end: date_end.value,
  }
  segNews(data);
});

// 2. 撈出未處理標籤
queryBtn.addEventListener('click', function(event) {
  removeData();
  querySegs();
})

// 3. 更新標籤 & 字典
updateBtn.addEventListener('click', function(event) {
  const tagNames = document.querySelectorAll(".tagName");
  const inputTags = document.querySelectorAll(".inputTag");

  let data = [];
  for(let i = 0; i < tagNames.length; i ++) {
    let body = {
      tagName: tagNames[i].innerText,
      inputTag: inputTags[i].value
    }
    data.push(body);
  }
  resultTag.innerHTML = "標籤更新中";
  resultTag.style.color = "red";
  resultTag.style.display = "block";
  updateTagStatus(data);
});

// 4-1. Tag count refresh (DB: filterCount)
tagCountBtn.addEventListener('click', function(event) {
  resultTagC.innerHTML = "Tag counting...";
  resultTagC.style.color = "red";
  resultTagC.style.display = "block";
  tagCount();
});
// 4-2. Tag count refresh (DB: filterCount) - ALL
tagCountAllBtn.addEventListener('click', function(event) {
  resultTagC.innerHTML = "Tag counting...";
  resultTagC.style.color = "red";
  resultTagC.style.display = "block";
  tagCountAll();
});

// 5. NLP training
nlpTrainBtn.addEventListener('click', function(event) {
  resultNlpT.innerHTML = "NLP model in training...";
  resultNlpT.style.color = "red";
  resultNlpT.style.display = "block";
  let data = {
    start: date_start_nlpT.value,
    end: date_end_nlpT.value,
  }
  nlpTrain(data);
});

// 6. NLP process
nlpProcessBtn.addEventListener('click', function(event) {
  resultNlpP.innerHTML = "NLP model in processing...";
  resultNlpP.style.color = "red";
  resultNlpP.style.display = "block";
  let data = {
    start: date_start_nlpP.value,
    end: date_end_nlpP.value,
  }
  nlpProcess(data);
});

// 7. News get tag
getTagBtn.addEventListener('click', function(event) {
  resultGetTag.innerHTML = "Get tag in processing...";
  resultGetTag.style.color = "red";
  resultGetTag.style.display = "block";
  getTag();
});

// x-1. Save tag to DB/Dict by manually
manAddTagBtn.addEventListener('click', function(event) {
  let inputTagName = valueOfinputTagName.value;
  let inputTagType = valueOfinputTagType.value;
  let data = [];
  let body = {
    tagName: inputTagName,
    inputTag: inputTagType
  }
  data.push(body);
  updateTagStatus(data);
  valueOfinputTagName.value = "";
  valueOfinputTagType.value = "";
});

// x-2. Set synonyms
synonymsBtn.addEventListener('click', function(event) {
  let data = {
    parentTag: valueOfparentTag.value,
    childTag: valueOfchildTag.value
  }
  setSynonyms(data);
  valueOfparentTag.value = "";
  valueOfchildTag.value = "";
});


// 1. 執行新聞斷詞
function segNews(data) {
  console.log(data);
  $.ajax({
    url: "admin/segmentation",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8", // 送給 server 的格式
    success: function(resp) {
      console.log(resp);
      resultSeg.innerHTML = "斷詞處理完成";
      resultSeg.style.color = "blue";
      resultSeg.style.display = "block";
    }
  });
}

// 2. 撈出未處理標籤
function querySegs() {
  $.ajax({
    url: "admin/getPendingTags",
    type: "GET",
    success: function(resp) {
      listForm(resp);
    }
  });
}

// 3. 更新標籤 & 字典
function updateTagStatus(data) {
  $.ajax({
    url: "admin/updateDB",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8", // 送給 server 的格式
    success: function(resp) {
      console.log(resp);
      removeData();
      resultTag.innerHTML = "標籤更新完成";
      resultTag.style.color = "blue";
      resultTag.style.display = "block";
    }
  });
}

// 4-1. Tag count refresh (DB: filterCount)
function tagCount() {
  $.ajax({
    url: "admin/tagfreq",
    type: "GET",
    success: function(resp) {
      console.log(resp);
      resultTagC.innerHTML = "Done";
      resultTagC.style.color = "blue";
      resultTagC.style.display = "block";
    }
  });
}

// 4-2. Tag count refresh (DB: filterCount) All
function tagCountAll() {
  $.ajax({
    url: "admin/tagfreqall",
    type: "GET",
    success: function(resp) {
      console.log(resp);
      resultTagC.innerHTML = "Done";
      resultTagC.style.color = "blue";
      resultTagC.style.display = "block";
    }
  });
}

// 5. NLP training
function nlpTrain(data) {
  $.ajax({
    url: "admin/nlp/train",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8", // 送給 server 的格式
    success: function(resp) {
      console.log(resp);
      resultNlpT.innerHTML = "Done";
      resultNlpT.style.color = "blue";
      resultNlpT.style.display = "block";
    }
  });
}

// 6. NLP process
function nlpProcess(data) {
  $.ajax({
    url: "admin/nlp/process",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8", // 送給 server 的格式
    success: function(resp) {
      console.log(resp);
      resultNlpP.innerHTML = "Done";
      resultNlpP.style.color = "blue";
      resultNlpP.style.display = "block";
    }
  });
}

// 7. News get tag
function getTag() {
  $.ajax({
    url: "admin/gettag",
    type: "GET",
    success: function(resp) {
      console.log(resp);
      resultGetTag.innerHTML = "Done";
      resultGetTag.style.color = "blue";
      resultGetTag.style.display = "block";
    }
  });
}

// x-2. Set synonyms
function setSynonyms(data) {
  $.ajax({
    url: "admin/synonyms",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8", // 送給 server 的格式
    success: function(resp) {
      console.log(resp);
      resultSynTag.innerHTML = "Done";
      resultSynTag.style.color = "blue";
      resultSynTag.style.display = "block";
    }
  });
}

function listForm(results) {

  for(let i = 0; i < results.data.length; i++) {
    var segListDiv = document.createElement("div");
    segListDiv.className = "segList";

    var tagNameDiv = document.createElement("div");
    tagNameDiv.className = "tagName";
    tagNameDiv.innerHTML = results.data[i].tagName;

    var countDiv = document.createElement("div");
    countDiv.className = "count";
    countDiv.innerHTML = results.data[i].count;

    var inputTag = document.createElement("input");
    inputTag.className = "inputTag";
    inputTag.setAttribute("type", "text");

    segListDiv.appendChild(tagNameDiv);
    segListDiv.appendChild(countDiv);
    segListDiv.appendChild(inputTag);

    segResults.appendChild(segListDiv);
  }
}

function removeData() {
  var child = segResults.lastElementChild;
  while(child) {
    segResults.removeChild(child);
    child = segResults.lastElementChild;
  }
}
