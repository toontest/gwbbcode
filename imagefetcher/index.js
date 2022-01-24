const request = require("request");
const cheerio = require("cheerio");
const url = require("url");
const path = require("path");
const baseURL = "https://wiki.guildwars.com/";
const { DownloaderHelper } = require("node-downloader-helper");

const skillLinks = [
  baseURL + "wiki/Guild_Wars_Wiki:Game_integration/Skills/1-500",
  baseURL + "wiki/Guild_Wars_Wiki:Game_integration/Skills/501-1000",
  baseURL + "wiki/Guild_Wars_Wiki:Game_integration/Skills/1001-1500",
  baseURL + "wiki/Guild_Wars_Wiki:Game_integration/Skills/1501-2000",
  baseURL + "wiki/Guild_Wars_Wiki:Game_integration/Skills/2001-2500",
  baseURL + "wiki/Guild_Wars_Wiki:Game_integration/Skills/2501-3000",
  baseURL + "wiki/Guild_Wars_Wiki:Game_integration/Skills/3001-3500",
];

//https://wiki.guildwars.com/images/thumb/3/32/%22Charge%21%22.jpg/50px-%22Charge%21%22.jpg

skillLinks.forEach(function (skillLink) {
  request(skillLink, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      let $ = cheerio.load(html);
      $(".plainlinks ul li").each(function (i, listItem) {
        let skillDetailLinks = $(listItem).children("a");
        let skillId = $(skillDetailLinks[0]).text().replace("Skill ", "");
        request(
          baseURL + $(skillDetailLinks[1]).attr("href"),
          async function (error, response, html) {
            if (!error && response.statusCode == 200) {
              let $child = cheerio.load(html);
              let imageSrc = $child(".skill-image img").attr("src");
              if (!imageSrc) {
                imageSrc = $child(".image img").attr("src");
              }

              if (!imageSrc) {
                return;
              }

              let baseName = path.basename(imageSrc);

              let finalPath =
                imageSrc.replace("/images/", "/images/thumb/") +
                "/50px-" +
                baseName;

              const dl = new DownloaderHelper(
                baseURL + finalPath,
                "../compiler/skills/images/",
                {
                    fileName:  skillId + ".jpg"
                }
              );

              dl.on('error', err => console.error(baseURL + finalPath, err));
              dl.start();
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        );
      });
    }
  });
});
