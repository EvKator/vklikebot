const MongoClient = require('mongodb').MongoClient;
const db_url = "DBURL"
const db_name = 'DBNAME';

export default class DB
{
    static async UpdateUser(user){
        let jsonU = user.toJSON();
        let client = await MongoClient.connect(db_url);
        const db = client.db(db_name);
        await db.collection('users').update({id : user.id}, jsonU);
        await client.close();
    }

    static async GetUsersCollection(){
        let client = await MongoClient.connect(db_url);
        const db = client.db(db_name);
        return db.collection('users');
    }

    static async InsertUser(user){
        const jsonU = user.toJSON();
        let client = await MongoClient.connect(db_url);
        const db = client.db(db_name);
        await db.collection('users').insertOne(jsonU);
        await client.close();
    }

    static async GetUser(id){
        const collection = await DB.GetUsersCollection();
        return res = await collection.findOne({id: id}, { });
    }

    static async FindUserByVk(vk_uname){
        const collection = await DB.GetUsersCollection();
        return await collection.findOne({'vk_acc.uname':vk_uname});
    }

    ////////////TASK///////////////////

    static async GetTasksCollection(){
        const client = await MongoClient.connect(db_url);
        const db = client.db(db_name);
        const collection = db.collection('tasks');
        return collection;
    }
    
    static async GetTask(taskname, tasktype){
        const collection = await DB.GetTasksCollection();
        if(tasktype)
            return await collection.findOne({taskname: taskname}, {type: tasktype});
        else
            return  await collection.findOne({taskname: taskname}, { });
    }

    static async GetTasksOfUser(user){
        const collection = await DB.GetTasksCollection();
        return await collection.find({author_id:user.id});
    }

    static async GetTaskForUser(user, type){
        const collection = await DB.GetTasksCollection();
        let res = await collection.find({workers: {$not: {$elemMatch : {user_id:user.id}}}, 
            author_id:{$ne: user.id}, type: type, status : {$ne : 'done'}});
        
    }

    static async InsertTask(task){
        let jsonT = task.toJSON();
        let client = await MongoClient.connect(db_url);
        const db = client.db(db_name);
        await db.collection('tasks').insertOne(jsonT);
        client.close();
    }

    static async UpdateTask(task){
        const jsonT = task.toJSON();
        const client = await MongoClient.connect(db_url);
        const db = client.db(db_name);
        await db.collection('tasks').update({taskname : this.taskname}, this.toJSON());
        client.close();
    }
}

