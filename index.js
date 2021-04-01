// imports
const http_request = require('./src/request.js');
const params = require('./src/params.json');
const cheerio = require('cheerio');
const fs = require('fs').promises;

// setup
const conn = 'https';
const options = {
    hostname: 'arztsuchehessen.de',
    port: 443,
    path: '/arztsuche/arztsuche.php',
    method: 'GET'
};

const filename = `exports.csv`;
createExportFile(filename);

// main program
search();

async function search () {
    console.log('Searching ...');

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
    console.log('Scraping content ...');
    links.forEach(scrapeProfile);
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
async function scrapeProfile (link) {
    // request site
    options.path = '/arztsuche/' + link;
    const html = await requestHtml(options);

    // extract info
    const $ = cheerio.load(html);
    const entry = {
        name: setName($),
        address: setAddress($),
        email: setEmail($),
        phone: setPhone($),
        info: setInfo($),
        officeHours: setOfficeHours($)
    };

    let str = '';
    const keys = Object.keys(entry);
    keys.forEach((key, index) => {
        str += entry[key];
        if (index < keys.length - 1) {
            str += '; ';
        };
    });
    writeToCSV(`${str}\n`);
}

function setName ($) {
    try {
        return $('div .Arzt').html().replace(/\s\s+/g, ' ').trim();
    } catch (err) {
        return '';
    }
}

function setAddress ($) {
    try {
        return $('div .Arzt_links').filter(function() {
            return $(this).text().trim() === 'Adresse:';
          }).next().text().replace(/(\n)|(\t)|(<br>)/g, '').trim();
    } catch (err) {
        return '';
    }
}

function setPhone ($) {
    try {
        return $('div .Arzt_links').filter(function() {
            return $(this).text().trim() === 'Telefon:';
          }).next().text().replace(/\//g, '').replace(/\s\s+/g, ' ').trim();
    } catch (err) {
        return '';
    }
}

function setEmail ($) {
    try {
        return $('a[class=maillink]').attr('href').split(':', 2)[1];
    } catch (err) {
        return '';
    }
}

function setInfo ($) {
    try {
        return $('div .Arzt_links').filter(function() {
            return $(this).text().trim() === 'Weitere Merkmale:';
          }).next().text().replace(/\//g, '').replace(/\s\s+/g, ' ').replace(/(\n\n)|(\n\n\n)/g, '\n').trim();
    } catch (err) {
        return '';
    }
}

function setOfficeHours ($) {
    try {
        return $('div .Sprechzeit').html().replace(/<br>/g, ' ').replace(/\s\s+/g, ' ').trim()
    } catch (err) {
        return '';
    }
}

// write to file
function createExportFile (name) {
    try {
        fs.writeFile(`./${name}`, 'Name; Adresse; E-Mail; Telefon; Information; Telefonische Erreichbarkeit und Sprechstunde\n');
    } catch (err) {
        console.error(`Error creating file: ${err}`);
    }
}

function writeToCSV (data) {
    try {
        fs.appendFile(filename, data);
    } catch (err) {
        console.error(`Error writing to file: ${err}`);
    }
}