const request = require('request-promise');
const cheerio = require('cheerio');
const decode = require('urldecode');

export default class Check{
    static async hasLiked(url, vk_id){
        url = decode(url);

        const pattern1 = "((video[^\/]+)_[^\/]+)";
        const pattern = "((photo[^\/]+)_[^\/]+)";
        let reg = new RegExp(pattern, 'g');
        let u = reg.exec(url);
        let likersUrl = "https://m.vk.com/like?act=members&object=" + u[1] + "&from=" + u[1] + "?list=" + u[2];
        let result = false;
        try {
            let respHtml = await  request(likersUrl);
            let $ = cheerio.load(respHtml);
            let likers = ($('a.inline_item')).toArray();

            result = likers.some((el)=>{
                return el.attribs.href.slice(1) === vk_id;
            });
        }
        catch (err){
            console.log('err');
            console.log(err.stack);
        }
        return result;
    }
}