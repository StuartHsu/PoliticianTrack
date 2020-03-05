const promiseSql = require("../util/promiseSql.js");

module.exports =
{
  getIntentNewsIds: function(param, rawNewsId)
  {
    return new Promise(async function(resolve, reject)
    {
      let data;
      let intent =
      [
        "表示","認為","說","覺得","痛批","批","嗆","嗆爆","一句話","呼籲","表態",
        "自爆","稱","聲稱","反稱","估","籲","呼籲","轟","砲轟","酸","酸爆","回",
        ":","：","喊話","感慨","重申","下令","令","拍板","駁斥"
      ];
      let intentModel = [];
      let polStatus = true;

      if (param.politician.length === 0)
      {
        param.politician = [""];
        polStatus = false;
      }

      for (let i = 0; i < param.politician.length; i++) // 生成比對 model
      {
        for (let j = 0; j < intent.length; j++)
        {
          intentModel.push(param.politician[i]+intent[j])
        }
      }

      try
      {
        if (polStatus == false && param.issue.length === 0) // All
        {
          data = getAllNewsIds(intentModel);

          resolve(data);
        }
        else // 人、人題、題
        {
          data = await getOtherCondNewsIds(intentModel, rawNewsId);

          resolve(data);
        }
      }
      catch(error)
      {
        reject(error);
      }
    });
  }
}

function getAllNewsIds(intentModel)
{
  return new Promise(async function(resolve, reject)
  {
    let data = [];
    let sql = "SELECT * FROM news";

    try
    {
      let results = await promiseSql.query(sql, null);

      for (let i = 0; i < results.length; i++)
      {
        for (let j = 0; j < intentModel.length; j++)
        {
          if (results[i].title.indexOf(intentModel[j]) !== -1)
          {
            data.push(results[i].id);
            j = intentModel.length;
          }
        }
      }
      resolve(data);
    }
    catch(error)
    {
      reject(error);
    }
  });
}


function getOtherCondNewsIds(intentModel, rawNewsId)
{
  return new Promise(async function(resolve, reject)
  {
    let data = [];
    sql = `SELECT * FROM news WHERE id IN (?) ORDER BY pubTime DESC;`

    try
    {
      if (rawNewsId.length > 0)
      {

        let results = await promiseSql.query(sql, [rawNewsId]);

        if (results.length > 0)
        {
          for (let i = 0; i < results.length; i++)
          {
            for (let j = 0; j < intentModel.length; j++)
            {
              if (results[i].title.indexOf(intentModel[j]) !== -1)
              {
                data.push(results[i].id);
                j = intentModel.length;
              }
            }
          }
          resolve(data);
        }
      }
      else
      {
        resolve(data);
      }
    }
    catch(error)
    {
      reject(error);
    }
  });
}
