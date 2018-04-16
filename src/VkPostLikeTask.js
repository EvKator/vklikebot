import Task from './task';
const request = require('request-promise');
const cheerio = require('cheerio');
const decode = require('urldecode');

class VkPostLikeTask extends Task{
    
    constructor(url, required, author_id){
        const type = 'vk_post_like_task';
        let taskname = VkPostLikeTask.getUrlData(url)[1];
        const cost = VkPostLikeTask.cost;
        super(taskname, type, url, required, required, cost, author_id);
    }

    static async check(user, url){
        let likersLink = VkPostLikeTask.getLikersLink(url);
        let result  = false;
        try {
            let respHtml = await  request(likersLink);
            let $ = cheerio.load(respHtml);
            let likers = ($('a.inline_item')).toArray();
            result = likers.some((el)=>{
                console.log(el.attribs.href);
                return el.attribs.href.slice(1) === user.vk_acc.uname;
            });
            console.log(user.vk_acc.username);
        }
        catch (err){
            console.log('err');
            console.log(err.stack);
            return false;
        }
        return result;
    }

    static getLikersLink(url){
        let urldata = VkPostLikeTask.getUrlData(url);
        let likersUrl = "https://m.vk.com/like?act=members&object=" + urldata[1];
        console.log(likersUrl);
        return likersUrl;
    }

    static getUrlData(url){

        console.log(url);
        url = decode(url);
        const pattern = /(wall\d+_\d+)/g;
        if(url.search(pattern) < 0)
            throw ("Я не нашел по твоей ссылке пост из ВК. Пожалуйста, поверь ее или обратись в техподдержку, мы поможем");
        let urldata = pattern.exec(url);
        return urldata;
    }

    static toString(task){
        let msg = "Задание: " + String(task.required) + " лайков на [пост](" + task.url + ") \n" +
            "лайкнуло: " + String(Number(task.required) - Number(task.remain)) + "\n" +
            "затрачено: " + String(Number(task.cost) * Number(task.required)) + " руб\n" +
            "---------";
        return msg;
    }

}

VkPostLikeTask.cost = 0.2;

export default VkPostLikeTask;