export default class VkAcc{
    constructor(uname, id){
        this._uname = uname;
        this._id = id;
    }
    set uname(uname){
        this._uname = uname;
    }
    set id(id){
        this._id = id;
    }
    get uname(){
        return this._uname;
    }
    get id(){
        return this._id;
    }
    
    toJSON(){
        return {
            uname: this._uname,
            id: this._id
        };
    }
}