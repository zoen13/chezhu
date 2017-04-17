var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var mongoose=require('mongoose');
var path = require('path');
var rp = require('request-promise');

chezhu = require('./models/chezhu');

mongoose.connect('mongodb://localhost:30000/chezhu');
var db=mongoose.connection;

//将public目录下的所有内容作为可静态访问和下载的内容
app.use(express.static(path.join(__dirname, 'public')));
//以下两句是为了能让程序解析出post上来的数据
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/',function(req,res){
	var rp = require('request-promise');
    var options= {
        method:'post',
        uri:"http://api.v2-3.kaiba315.com:81/broadcast/index",
        qs:{from:'1031',siteId:11,source:37010},
        headers:{
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    
    rp(options).then(function(data){
        var datastring = JSON.stringify(data);
        var arr1 = datastring.split('"data":');
        var arr2 = arr1[1].split(',"totalPage"');
        var datas = JSON.parse(arr2[0]);

        for (var o in datas)
        {
            var chezhuInfo = new Object();
            var picArr = new Array();       //定义图片数组
            var replyArr = new Array();     //定义回复数组

            chezhuInfo.id = datas[o].id;
            
            //console.log("昵称："+datas[o].userInfo.userName);    //用户昵称
            chezhuInfo.userName = datas[o].userInfo.userName;
            
            //console.log("头像："+datas[o].userInfo.avatar);      //拼接用户头像文件
            chezhuInfo.avatar = datas[o].userInfo.avatar;
            
            //console.log("性别："+datas[o].userInfo.sex);         //用户性别1男2女
            chezhuInfo.sex = datas[o].userInfo.sex;

            //console.log("内容："+datas[o].content);              //发帖内容
            chezhuInfo.content = datas[o].content;

            //console.log("时间："+datas[o].createtime);           //发帖时间
            chezhuInfo.createtime = datas[o].createtime;

            //console.log("地址："+datas[o].street);               //发帖地址信息
            chezhuInfo.street = datas[o].street;

            //console.log("签名："+datas[o].userInfo.signature);      //用户签名
            chezhuInfo.signature = datas[o].signature;

            if (datas[o].praise_count>0){
                //console.log("点赞数："+datas[o].praise_count);         //点赞用户数
                chezhuInfo.praise_count = datas[o].praise_count;
            }
            
            if (datas[o].reward_count>0){
                //console.log("打赏额："+datas[o].reward_count);         //打赏总额
                chezhuInfo.reward_count = datas[o].reward_count;
            }
            
            for (var p in datas[o].pic){
                //console.log("图片："+datas[o].pic[p].url);          //拼接图片地址
                picArr.push(datas[o].pic[p].url);
            }
            chezhuInfo.picKey=picArr; 
            
            for (var r in datas[o].reply){
                var replyDetail = new Object();
                replyDetail.id = datas[o].reply[r].id;
                replyDetail.content = datas[o].reply[r].content;
                replyDetail.createtime = datas[o].reply[r].createtime;
                replyDetail.userName = datas[o].reply[r].userInfo.userName;
                replyArr.push(JSON.stringify(replyDetail));
                //console.log("回复："+replyDetail.id+" 内容："+replyDetail.content+" 昵称："+replyDetail.userName+" 时间："+replyDetail.createtime);
                
            }
            chezhuInfo.reply = replyArr;
                   
            if (typeof(datas[o].audio) != "undefined"){
                //console.log("音频："+datas[o].audio.voiceKey);       //拼接音频下载地址
                //console.log("时长："+datas[o].audio.voiceLen);       //音频时长
                chezhuInfo.voiceKey = datas[o].audio.voiceKey;
                chezhuInfo.voiceLen = datas[o].audio.voiceLen;
            }
            if (typeof(datas[o].video) != "undefined"){
                //console.log("视频："+datas[o].video.videoKey);       //拼接视频下载地址
                //console.log("时长："+datas[o].video.videoLen);       //视频时长
                //console.log("缩略图："+datas[o].video.videoThumbKey);  //拼接视频缩略图地址
                chezhuInfo.videoKey = datas[o].video.videoKey;
                chezhuInfo.videoLen = datas[o].video.videoLen;
            }

            chezhu.updateChezhu(chezhuInfo,function(err,chezhuInfo){
                if (err){
                    throw err;
                }
            });

            chezhu.addChezhu(chezhuInfo,function(err,chezhuInfo){
                if (err){
                    throw err;
                }
                res.json(chezhuInfo);
            });
        }
    });
});


app.get('/api/qblist.do',function(req,res){

    chezhu.getChezhu(300,function(err,chezhus){
        if(err){
            throw err;
        }
        var node=new Array();
        for (var c=0; c<chezhus.length; c++){
            
            //定义序列化内容的拼接字串
            var cXML="";
            //定义materials数组
            var aMat=new Array();

            //将发帖时间转换成时间戳
            var stringTime="2017-"+chezhus[c].createtime+":00";
            var timeStamp=Date.parse(new Date(stringTime));

            var asex;//作者性别
            if (chezhus[c].sex=="1"){
                asex="男";
            }
            else{
                asex="女";
            }

            var auserName;//作者昵称
            auserName=chezhus[c].userName;

            var astreet;//作者地理位置
            astreet=chezhus[c].street;
            if (astreet==null){
                astreet="未知地址";
            }

            var pcount="";
            if (typeof(chezhus[c].praise_count)!="undefined"){
                pcount=" "+chezhus[c].praise_count+"个赞";
            }

            var aavatar_pic;//作者头像大图
            var aavatar_thumb;//作者头像小图
            aavatar_pic="http://media.kaiba315.com/get.php?id="+chezhus[c].avatar+"_jpeg";
            aavatar_thumb="http://media.kaiba315.com/get.php?id="+chezhus[c].avatar+"_thumb_jpeg";
            cXML=cXML+"<node t='P' serverid='1'>头像</node>";
            var oAvatar=new Object();
            oAvatar.infoid="1";
            oAvatar.title="头像";
            oAvatar.createtime="138122547140";
            oAvatar.type="0";
            oAvatar.fileid="1";
            var oAvatarDetails = new Object();
            oAvatarDetails._id="1";
            oAvatarDetails.url=aavatar_thumb;
            oAvatar.details=oAvatarDetails;
            aMat.push(oAvatar);

            var acontent;//发帖内容
            acontent="消息内容："+chezhus[c].content;

            var DHead="<node t='D' serverid='' preword=''><![CDATA[<!DOCTYPE HTML PUBLIC \\'-//W3C//DTD HTML 4.0//EN\\' \\'http://www.w3.org/TR/REC-html40/strict.dtd\\'><html><head><meta name=\\'qrichtext\\' content=\\'1\\' /><style type=\\'text/css\\'>p, li { white-space: pre-wrap; }</style></head><body style=\\' font-family:'Microsoft YaHei'; font-size:14pt; font-weight:400; font-style:normal;\\'>";
            var DFoot="</body></html>]]></node>";
            var pHead="<p style=\\' margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\\'>";
            var pFoot="</p>";
            cXML=cXML+DHead+pHead+acontent+pFoot;

            var reply;//回复
            reply=chezhus[c].reply;
            var rcount="";
            if (typeof(reply[0])!= "undefined"){
                rcount="  "+reply.length+"条评论";
                for (var i=0;i<reply.length;i++){
                    var rJson=JSON.parse(reply[i].replace('\\',''));
                    var rctime=new Date();
                    rctime.setTime(parseInt(rJson.createtime)*1000);
                    timeString=rctime.toString().split(' ');
                    cXML=cXML+pHead+" 评论"+rJson.id+" "+timeString[4]+"  "+rJson.userName+"  "+rJson.content+pFoot;
                }
                cXML=cXML+DFoot;
            }
            else{
                cXML=cXML+pHead+"(暂无评论)"+pFoot+DFoot;
            }

            //音频
            if (typeof(chezhus[c].voiceKey)!= "undefined"){
                //console.log(chezhus[c].voiceKey);
                cXML=cXML+"<node t='A' serverid='2'>音频</node>";
                //cMat=cMat+"{'infoid':'2','title':'audio_title','createtime':'1381225147140','type':'1','fileid':'2','details':{'_id':'2','playurl':'','url':'http://media.kaiba315.com/get.php?id="+chezhus[c].voiceKey+"','ineturl':'http://media.kaiba315.com/get.php?id="+chezhu[c].voiceKey+"','localurl':'http://media.kaiba315.com/get.php?id="+chezhus[c].voiceKey+"','duration':'"+chezhu[c].voiceLen+"','encoder': 'amr','bitrate':'128000','samplerate': '44100'}},";
                var oAudio = new Object();
                oAudio.infoid="2";
                oAudio.title="音频";
                oAudio.createtime="1381225147140";
                oAudio.type="1";
                oAudio.fileid="2";
                var oAudioDetails = new Object();
                oAudioDetails._id="2";
                oAudioDetails.url="http://media.kaiba315.com/get.php?id="+chezhus[c].voiceKey;
                oAudio.details=oAudioDetails;
                aMat.push(oAudio);
            }

            //视频
            if (typeof(chezhus[c].videoKey)!="undefined"){
                cXML=cXML+"<node t='V' serverid='3'>视频</node>";
                //cMat=cMat+"{'infoid':'3','title':'video_title','createtime':'1381225147140','type':'2','fileid':'3','details':{'_id':'3','playurl':'','url':'"+chezhus[c].videoKey+"','ineturl':'"+chezhus[c].videoKey+"','localurl':'"+chezhus[c].videoKey+"','duration':'"+chezhus[c].videoLen+"','encoder':'aac','bitrate':'128000','samplerate':'44100','thumb':''}},";
                var oVideo = new Object();
                oVideo.infoid="3";
                oVideo.title="视频";
                oVideo.createtime="1381225147140";
                oVideo.type="2";
                oVideo.fileid="3";
                var oVideoDetails = new Object();
                oVideoDetails._id="2";
                oVideoDetails.url=chezhus[c].videoKey;
                oVideo.details=oVideoDetails;
                aMat.push(oVideo);
            }

            
            var pic;//图片
            pic=chezhus[c].picKey;
            var piccount="";
            if (typeof(pic[0])!= "undefined"){
                piccount="  "+pic.length+"张贴图";
                for (var i=0;i<pic.length;i++){
                    cXML=cXML+"<node t='P' serverid='"+pic[i]+"'>图片</node>";
                    var oPic = new Object();
                    oPic.infoid=pic[i];
                    oPic.title="图像";
                    oPic.createtime="138122547140";
                    oPic.type="0";
                    oPic.fileid=pic[i];
                    var oPicDetails = new Object();
                    oPicDetails._id=pic[i];
                    oPicDetails.url="http://media.kaiba315.com/get.php?id="+pic[i]+"_jpeg"
                    oPic.details=oPicDetails;
                    aMat.push(oPic);
                }
            }

            node[c] ={
                "icon": aavatar_thumb,
                "status": "0",
                "fileSymble": "",
                "tag": "车主App互动消息",
                "refcount": 0,
                "userid": "",
                "appid": "aa3ee8fc-0364-45fd-80f7-85f8ff9e8738",
                "typetag": "车主App互动消息",
                "wordcount": "100",
                "type": "车主App互动消息",
                "ctime": timeStamp,
                "version": "1",
                "content": "<?xml version='1.0' ?><root>"+cXML+"</root>",
                "id": chezhus[c]._id,
                "author": auserName,
                "lastupdate": timeStamp,
                "filesize": "100",
                "title": auserName+"("+asex+")"+"("+astreet+")"+pcount+rcount+piccount,
                "category": "40",
                "source": "车主App互动消息",
                "describe": "车主App互动消息",
                "channel": "1",
                "materials": aMat
            };
        }
        
        var nodeString=JSON.stringify(node);
        var nodeContent=nodeString.substring(0,nodeString.length);
        var preString=JSON.stringify({"ret": 0,"result":0});
        res.send(preString.substring(0,18)+nodeContent+"}");
    });
    
});

app.listen(8888);
console.log('Running on port 8888...');
