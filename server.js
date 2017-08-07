//引入express和multer处理框架
var express = require('express');
var multer  = require('multer');
var app = express();

//multer设置图片路径
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'album')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var http = require('http');
var fs = require('fs');

//引入mongodb数据库
var mongodb = require('mongodb');
var db = new mongodb.Db('mochi',new mongodb.Server('localhost','27017',{auto_connect:true}),{safe:true});

//设置静态资源路径
app.use(express.static('album'));

//获取页面文件
app.get('/index.html',function(req,res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/js.js',function(req,res){
	res.sendFile(__dirname + '/js.js');
});

//首页登陆加载数据
app.post('/index.html',function(req,res){
	db.open(function(err,db){
		if(err) 
		{
			res.send('error');
			console.log(err.toString());
		}
		else
		{
			db.collection('music',function(err,collection){
				//返回所有数据
				collection.find({}).toArray(function(err,docs){
					if(err) console.log(err);
					else
					{
						res.send(docs);
						db.close();
					}
				});
			});
		}
	});
});

//修改文件
var upload = multer({ storage: storage });
app.post('/index.html/edit',upload.single('image'),function(req,res,next){
	var obj = req.body;
	if(req.file)
	{obj.image = req.file.originalname;}	
	db.open(function(err,db){
		if(err) console.log(err.toString());
		else
		{
			db.collection('music',function(err,collection){
				collection.update({id:obj.id},obj,function(err,result){
					if(err) res.send('更新异常');
					else
					{
					 	res.send('修改成功。');
					}
				});
			});
		}
	});
});

//插入数据
app.post('/index.html/insert',upload.single('image'),function(req,res,next){
	var obj = req.body;
	//打开数据库
	db.open(function(err,db){
		if(err) console.log('数据库打开失败');
		else
		{
			db.collection('music',function(err,collection){
				//插入数据
				collection.insert({
					id:obj.id,
					title:obj.title,
					artist:obj.artist,
					date:obj.date,
					style:obj.style,
					album:obj.album,
					image:req.file.originalname						
				});
				res.send('数据插入成功。');
			},function(err){db.close();});
		}
	});

});

//删除数据
app.delete('/index.html',function(req,res){
	req.on('data',function(data){
		//console.log(data.toString());
		db.open(function(err,db){
			if(err) console.log('打开数据库失败。');
			else
			{
				db.collection('music',function(err,collection){
					collection.remove({id:data.toString()});
					res.send('已成功删除一条记录');
					db.close();
				});
			}
		});
	});
});

//查找数据
app.post('/index.html/search',function(req,res){
	req.on('data',function(data){
		var obj = JSON.parse(data);
		db.open(function(err,db){
			db.collection('music',function(err,collection){
				collection.find(obj).toArray(function(err,docs){
					if(err) res.send('error');
					else
					{
						res.send(docs);
						db.close();
					}
				});
			});
		});
	});
});

app.listen(1337,'127.0.0.1');