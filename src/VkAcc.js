export default class VkAcc{
    constructor(uname, id){
        this._uname = uname;
        this._id = id;
    }
    set uname(uname){
        this._uname = uname;
    }
    set link(link){
        this._link = link;
    }
    get uname(){
        return this._uname;
    }
    get link(){
        return this._link;
    }
    toJSON(){
        return {
            uname: this._uname,
            link: this._link
        };
    }
}