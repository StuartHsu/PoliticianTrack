# PolsTrack

### A Politician Opinion Tracking Website
- Displays the views of politicians on various topics
- Compares politicians’ views on specific issues
- Shows the most popular politicians and issues recently

Website URL: https://polstrack.com

## Table of Contents

- [Technologies](#Technologies)
- [Architecture](#Architecture)
- [Database Schema](#Database-Schema)
- [Data Pipeline](#Data-Pipeline)
- [Main Features](#Main-Features)
- [Demonstration](#Demonstration)
    - [Home page](#Home-page)
    - [News page](#News-page)
    - [Compare page](#Compare-page)
    - [Hots page](#Hots-page)
- [Contact](#Contact)

## Technologies

### Backend
- Node.js / Express.js
- RESTful API
- NGINX

### Front-End
- HTML
- CSS
- JavaScript
- EJS
- AJAX

### Cloud Service (AWS)
- Compute: EC2
- Storage: S3
- Database: RDS
- Network: CloudFront, ELB

### Database
- MySQL
- Redis (Cache)

### Tools
- Version Control: Git, GitHub
- CI / CD: Jenkins, Docker
- Test: Jest, Artillery
- Agile: Trello (Scrum)

### Others
- Design Pattern: MVC, DAO
- NLP: Jieba, NLP.js
- Web Crawler: cheerio

## Architecture

![](https://i.imgur.com/I0J0hwS.png)
- Redirects 443 port requests by **NGINX** after receiving request from clients
- Scraped news content through **Web Crawler**
- Segmented news content by **Jieba** and verified news with politicians' intention by **NLP.js**
- Optimized data loading efficiency through in-memory cache mechanism by **Redis**

## Database Schema

![](https://i.imgur.com/EfkXKD5.png)

## Data Pipeline

![](https://i.imgur.com/FBwiK3T.png)
- Content Segmentation
    - 『國民黨立委江啟臣今天就任國民黨主席，他以「世代合作、內造化、數位化」三大方向發表演說，但全文未提「九二共識」，加上中共總書記習近平也未循例拍發賀電，引發矚目。』
    → 「國民黨」、「立委」、「江啟臣」、「黨主席」、「九二共識」、「中共」、「總書記」、「習近平」
- Title Intention Analysis
    - 『江啟臣就職國民黨主席 致詞未提九二共識』
    → 人物對特定議題表達立場
- Get Specific Tag
    - 「國民黨」、「江啟臣」、「九二共識」、「習近平」

## Main Features

- Categorize news
    - Displays the views of politicians on various topics
- Opinion Compare
    - Compares politicians' views on specific issues
- Most popular
    - Shows the most popular politicians and issues recently

## Demonstration

### Home page

![](https://i.imgur.com/N1eO6T9.gif)
- Shows politicians and issues by popularity

### News page

![](https://i.imgur.com/iaAGBQI.gif)
- Displays the views of politicians on various topics

### Compare page

![](https://i.imgur.com/lqDaAVQ.gif)
- Compares politicians’ views on specific issues

### Hots page

![](https://i.imgur.com/aRUuGED.gif)
- Shows the most popular politicians and issues recently

## Contact

Email: yopahsu@gmail.com
