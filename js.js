//获取页面要输入的信息的元素
var ip_id = document.getElementById('ip_id');
var ip_title = document.getElementById('ip_title');
var ip_artist = document.getElementById('ip_artist');
var ip_date = document.getElementById('ip_date');
var slt_style = document.getElementById('slt_style');

//获取页面基本元素
var tb_result = document.getElementById('result');
var sp_tip = document.getElementById('tip');

window.onload = function()
{
	backAll();
}

//打开页面时添加数据
function loadInfo(str)
{

	if(str=='error')
	{
		sp_tip.innerHTML = "数据库打开失败。";
		return;
	}

	var obj = JSON.parse(str);
	for(var j=0;j < obj.length;j++)
	{
		var newTr = document.createElement('tr');
		var html = '';
		html += '<td>'+ obj[j].id +'</td>';
		html += '<td>'+ obj[j].title +'</td>';
		html += '<td>'+ obj[j].artist +'</td>';
		html += '<td>'+ obj[j].date +'</td>';
		html += '<td>'+ obj[j].album +'</td>';
		html += '<td>'+ obj[j].style +'</td>';
		html += '<td><img src="./'+ obj[j].image +'" alt="'+obj[j].title+'"/></td>';

	newTr.innerHTML = html + '<td><input type="button" value="编辑" onclick="Update('+j+')"/></td><td><input type="button" value="删除" onclick="Delete('+j+')"/></td>';
	tb_result.appendChild(newTr);

	}
}

//向页面中添加新的列数
function appendInfo()
{
	var length = tb_result.getElementsByTagName('tr').length - 2;
	var newTr = document.createElement('tr');
	var html = '';

	var obj =
	{
		id:ip_id.value.trim(),
		title:ip_title.value.trim(),
		artist:ip_artist.value.trim(),
		date:ip_date.value,
		album:ip_album.value.trim(),
		style:slt_style.value,
	};

	for(var i in obj)
	{
		html += '<td>'+ obj[i] +'</td>';
	}

	html += '<td><img src="./'+ ip_image.value.split('\\')[ip_image.value.split('\\').length-1]+'" /></td>';
	newTr.innerHTML = html + '<td><input type="button" value="编辑" onclick="Update('+length+')"/></td><td><input type="button" value="删除" onclick="Delete('+length+')"/></td>';
	tb_result.appendChild(newTr);
}

//增加新纪录
function Add()
{
	if(ip_id.value.trim() == '')
	{
		sp_tip.innerHTML = 'ID不能为空。';
		return;
	}

	if(ip_title.value.trim() == '')
	{
		sp_tip.innerHTML = '歌曲标题不能为空。';
		return;
	}

	if(ip_artist.value.trim() == '')
	{
		sp_tip.innerHTML = '艺术家名不能为空。';
		return;
	}

	sp_tip.innerHTML = '表单填写正确，已提交。';

	//上传文件 
	var form = document.getElementById("form");
	var formData = new FormData(form);

	//定义ajax
	var xhr = new XMLHttpRequest();
	xhr.open('post','/index.html/insert',true);
	xhr.send(formData);

	xhr.onload = function(e){
		if(this.status == 200)
		{
			sp_tip.innerHTML = this.response;
			appendInfo();
			console.log('appendInfo');
		}
		else
		{
			sp_tip.innerHTML = '发生了错误，错误状态为'+this.status+'。';
		}
	}

}


//删除记录
function Delete(i)
{
	if(!confirm('您确定要删除吗？'))
	{
		return;
	}

	//链接数据库删除内容
	var tr = tb_result.getElementsByTagName('tr')[i+1];
	var id = tr.getElementsByTagName('td')[0];

	var xhr = new XMLHttpRequest();
	xhr.open('delete','index.html',true);
	xhr.send(id.innerHTML);
	xhr.onload = function(e)
	{
		if(this.status == 200)
		{
			sp_tip.innerHTML = this.response;
			tb_result.removeChild(tr);
		}
		else
		{
			sp_tip.innerHTML = '删除错误，错误状态为'+this.status+'。';			
		}
	}
}


//编辑记录
function Update(i)
{
	var tr = tb_result.getElementsByTagName('tr')[i+1];
	var td = tr.getElementsByTagName('td');
	var array = [['text','id'],['text','title'],['text','artist'],['date','date'],['text','album'],['',''],['file','image']];
	var info = [];

	info.push("'"+td[0].innerHTML+"'");

	for(var j=1;j<td.length-3;j++)
	{
		info.push("'"+td[j].innerHTML+"'");
		if(j == td.length-4)
		{
			td[j].innerHTML = '<select id="updateStyle" name="style"><option value="">请选择</option><option>流行</option><option>电音</option><option>摇滚</option><option>蓝调</option></select>';
			//document.getElementById('updateStyle').value = info[info.length-1];
			continue;
		}
		td[j].innerHTML = textToInput(array[j][0],array[j][1]) + 'value="'+td[j].innerHTML+'"/>';
	}

	info.push("'"+td[6].getElementsByTagName('img')[0].src+"'");

	td[6].innerHTML = '<input type="file" id="imageUpdate" name="image" value="'+ td[6].getElementsByTagName('img')[0].src+'" />';
	td[7].innerHTML = '<input type="button" value="保存" onclick="Save('+i+')"/>';
	td[8].innerHTML = '<input type="button" value="取消" onclick="Cancel('+i+',['+info+'])"/>';
	console.log(info);
}

function textToInput(str,name)
{
	return '<input type="'+str+'" id="'+name+'Update"'+' name="'+name+'"';
}

//保存修改
function Save(i)
{
	var form = document.getElementById("updateForm");
	var formData = new FormData(form);
	formData.append('id',tb_result.getElementsByTagName('tr')[i+1].getElementsByTagName('td')[0].innerHTML);

	var xhr = new XMLHttpRequest();
	xhr.open('post','/index.html/edit',true);
	xhr.send(formData);	
	xhr.onload = function(e){
		if(this.status == 200)
		{
			sp_tip.innerHTML = this.response;
		}
		else
		{
			console.log("保存更新出错啦！");
			return;
		}
	}

	var array=[];
	array.push(formData.get('id'));
	array.push(formData.get('title'));
	array.push(formData.get('artist'));
	array.push(formData.get('date'));
	array.push(formData.get('album'));
	array.push(formData.get('style'));
	array.push(formData.get('image').name);
	console.log(array);
	Cancel(i,array);
}

//取消修改记录
function Cancel(i,info)
{
	var tr = tb_result.getElementsByTagName('tr')[i+1];
	var td = tr.getElementsByTagName('td');

	//console.log(td.length);
	for(var j=0;j<td.length-3;j++)
	{
		td[j].innerHTML = info[j];
	}
	td[6].innerHTML = '<img src="'+ info[6] +'" alt="'+ info[1] +'"/>';
	td[7].innerHTML = '<input type="button" value="修改" onclick="Update('+i+')"/>';
	td[8].innerHTML = '<input type="button" value="删除" onclick="Delete('+i+')"/>';
}

//查找记录
function Find()
{
	if(!(ip_id.value||ip_title.value||ip_artist.value||ip_date.value||ip_album.value||slt_style.value))
	{
		sp_tip.innerHTML='请输入至少一个搜索条件。';
		return;
	}

	var obj = new Object();

	if(ip_id.value.trim())
	{
		obj.id = ip_id.value.trim();
	}

	if(ip_title.value.trim())
	{
		obj.title = ip_title.trim();
	}

	if(ip_artist.value.trim())
	{
		obj.artist = ip_artist.trim();
	}

	if(ip_date.value)
	{
		obj.date = ip_date.value;
	}

	if(slt_style.value)
	{
		obj.style = slt_style.value;
	}

	//增加返回全部记录按钮
	document.getElementById('h1_title').innerHTML = '检索结果<span onclick="backAll()">(返回全部收藏)</span>';
	tb_result.innerHTML = "<th>编号</th><th>标题</th><th>艺术家</th><th>发布日期</th><th>专辑</th><th>风格</th><th>封面</th><th>编辑</th><th>删除</th>";
	
	console.log(obj);
	//后台传输数据
	var xhr = new XMLHttpRequest();
	xhr.open('post','/index.html/search',true);
	xhr.send(JSON.stringify(obj));
	xhr.onload = function(e)
	{
		if(this.status == 200)
		{
			sp_tip.innerHTML = '查找成功。';
			loadInfo(this.response);
		}
		else
		{
			sp_tip.innerHTML = '查找出错误啦。';
		}
	}
}

function backAll()
{
	tb_result.innerHTML = "<th>编号</th><th>标题</th><th>艺术家</th><th>发布日期</th><th>专辑</th><th>风格</th><th>封面</th><th>编辑</th><th>删除</th>";
	document.getElementById('h1_title').innerHTML = '全部收藏';

	var xhr = new XMLHttpRequest();
	xhr.open('post','/index.html',true);
	xhr.send();
	xhr.onload = function()
	{
		if(this.status == 200)
		{
			loadInfo(this.response);
		}
		else
		{
			console.log('出问题啦！');
		}
	};	
}