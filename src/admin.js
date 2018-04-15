import nMenu from './nmenu';
import User from './user';
const MongoClient = require('mongodb').MongoClient;
const db_url = 'mongodb://localhost:27017/vklikebot';
const db_name = 'vklikebot';
export default class Admin{
    static async SendToAll(text, parse_mode = 'HTML'){
        //sendTextMessage(user, text, reply_markup, parse_mode)

        let client = await MongoClient.connect(db_url);
        const db = client.db(db_name);
        const collection = db.collection('users');
        let cursor = await collection.find();
        cursor.forEach((doc) =>{
            let user = User.fromJSON(doc);
            nMenu.sendTextMessage(user, text, null, parse_mode);
        });
    }

    static async PayTo(user, salary){
        user.Pay(salary);
        nMenu.sendTextMessage(user, "Вам подарок: " + salary + " руб");
    }

    static async SendTo(user, text, parse_mode = 'HTML'){
        //sendTextMessage(user, text, reply_markup, parse_mode)

        nMenu.sendTextMessage(user, text, null, parse_mode);
    }

    static async checkAllTasks(){

    }
}