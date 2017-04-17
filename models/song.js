var mongoose=require('mongoose');

var songSchema=mongoose.Schema({
	albumID:{
		type:String,
		required:true
	},
	albumName:{
		type:String,
		required:true
	},
	time:{
		type:String,
		required:true
	},
	songName:{
		type:String,
		required:true
	},
	singer:{
		type:String,
		required:true
	},
	index:{
		type:String,
		required:true
	}
});

var song=module.exports=mongoose.model('song',songSchema);

//get songs
module.exports.getSongs=function(callback,limit){
	song.find(callback).limit(limit);
};

//get songs by ablumID
module.exports.getSongsByAlbumID=function(albumID,callback){
	song.find({'albumID':albumID},callback);
};

//search songs by keyword
module.exports.getSongsByKeyword=function(keyword,callback){
	//var arrKey=keyword.split(" ",3);
	//for (i=0;i<arrKey.length;i++)
	//{
	//	console.log(arrKey[i]);
	//}
	/*if (arrKey.length==1)
	{
		song.find({$or:[{'albumName':{$regex:keyword}},{'songName':{$regex:keyword}},{'singer':{$regex:keyword}}]},callback);
	}
	if (arrKey.length==2)
	{
		var k1=arrKey[0];
		var k2=arrKey[1];
		song.find({
			$and:[
				{$or:[{'albumName':{$regex:k1}},{'songName':{$regex:k1}},{'singer':{$regex:k1}}]},
				{$or:[{'albumName':{$regex:k2}},{'songName':{$regex:k2}},{'singer':{$regex:k2}}]},
			]
		},callback);
	}
	if (arrKey.length==3)
	{
		var k1=arrKey[0];
		var k2=arrKey[1];
		var k3=arrKey[2];
		song.find({
			$and:[
				{$or:[{'albumName':{$regex:k1}},{'songName':{$regex:k1}},{'singer':{$regex:k1}}]},
				{$or:[{'albumName':{$regex:k2}},{'songName':{$regex:k2}},{'singer':{$regex:k2}}]},
				{$or:[{'albumName':{$regex:k3}},{'songName':{$regex:k3}},{'singer':{$regex:k3}}]},
			]
		},callback);
	}*/
	song.find({$or:[{'albumName':{$regex:keyword}},{'songName':{$regex:keyword}},{'singer':{$regex:keyword}}]},callback);
};
