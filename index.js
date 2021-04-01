// imports
const http_request = require('./src/request.js');
const params = require('./src/params.json');
const cheerio = require('cheerio');

// setup
const conn = 'https';
const options = {
    hostname: 'arztsuchehessen.de',
    port: 443,
    path: '/arztsuche/arztsuche.php',
    method: 'GET'
};

// main program
search();

async function search() {
    // get SID cookie
    const cookies = await requestHtml(options, true);
    const sidCookie = cookies[0].split(';', 1)[0];

    // set full search path
    let path = options.path + '?';
    const keys = Object.keys(params);
    keys.forEach((key, index) => {
        path += `${key}=${params[key]}`;
        if (index < keys.length - 1) {
            path += '&';
        };
    });
    options.path = encodeURI(path);
    options.headers = {
        'Cookie': [sidCookie]
      }
    
    // get search result
    const searchResult = await requestHtml(options);

    // get nodes
    const $ = cheerio.load(searchResult);
    let links = [];
    $("a[title='zur Karteikarte']").each(function(index, elem) {
        links.push($(this).attr('href'));
    });

    // scrape profiles
    links.forEach(scrapeProfiles);
}


// request
async function requestHtml (options, returnCookie) {
    const response = await http_request(options, conn);

    if (returnCookie) {
        return response.cookie;
    } else {
        return response.data;
    }
}

// scrape profiles
async function scrapeProfiles(link) {
    console.log(link);


}