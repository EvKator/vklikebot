import nMenu from './nmenu';
import User from './user';

export default class Admin{
    static async SendToAll(text, parse_mode = 'HTML'){
        //sendTextMessage(user, text, reply_markup, parse_mode)

        
        
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