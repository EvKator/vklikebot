import Task from './task';
const request = require('request-promise');
const cheerio = require('cheerio');
const decode = require('urldecode');

class VkPhotoLikeTask extends Task{
    
    constructor(url, required, author_id){
        const type = 'vk_photo_like_task';
        let taskname = VkPhotoLikeTask.getUrlData(url)[1];
        const cost = VkPhotoLikeTask.cost;
        super(taskname, type, url, required, required, cost, author_id);
    }

    static async check(user, url){
        let likersLink = VkPhotoLikeTask.getLikersLink(url);
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
        let urldata = VkPhotoLikeTask.getUrlData(url);
        let likersUrl = "https://m.vk.com/like?act=members&object=" + urldata[1] + "&from=" + urldata[1] + "?list=" + urldata[2];
        console.log(likersUrl);
        return likersUrl;
    }

    static getUrlData(url){
        console.log(url);
        url = decode(url);
        const pattern = /((photo[^\/]+)_[^\/]+)/g;
        if(url.search(pattern) < 0)
            throw ("Я не нашел по твоей ссылке фотографий из ВК. Пожалуйста, поверь ее или обратись в техподдержку, мы поможем");
        let urldata = pattern.exec(url);
        return urldata;
    }

    static toString(task){
        let msg = "Задание: " + String(task.required) + " лайков на [фотографию](" + task.url + ") \n" +
            "лайкнуло: " + String(Number(task.required) - Number(task.remain)) + "\n" +
            "затрачено: " + String(Number(task.cost) * Number(task.required)) + " руб\n" +
            "---------";
        return msg;
    }

}

VkPhotoLikeTask.cost = 0.2;

export default VkPhotoLikeTask;