var mongoose=require('mongoose');

var chezhuSchema=mongoose.Schema({
	id:{
		type:String,
		unique:true,
		required:true
	},
	userName:String,
	sex:String,
	avatar:String,
	signature:String,
	content:String,
	createtime:String,
	street:String,
	picKey:[String],
	reply:[String],
	voiceKey:String,
	voiceLen:String,
	videoKey:String,
	videoLen:String,
	praise_count:String,
	reward_count:String

});

var chezhu=module.exports=mongoose.model('chezhu',chezhuSchema);

//get chezhu
module.exports.getChezhu=function(limit,callback){
	chezhu.find(callback).sort({'id':-1}).limit(limit);
};

//create chezhu
module.exports.addChezhu=function(chezhuInfo,callback){
	chezhu.create(chezhuInfo,callback);
};

//get chezhu by id
module.exports.getChezhuByID=function(id,callback){
	//chezhu.find({'id':id}).count();
};

//findOneAndUpdate
module.exports.updateChezhu=function(chezhuInfo,callback){
	chezhu.findOneAndUpdate({'id':chezhuInfo.id},chezhuInfo,callback);
};
