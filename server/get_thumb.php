<?php
include_once("pass.php");
$before = microtime(true);
$href = PasswordSingleton::getInstance()->getPassword();

$server=isset($_GET['s'])?htmlspecialchars($_GET["s"]):0;
$name=isset($_GET['n'])?htmlspecialchars($_GET["n"]):'img';
$img=isset($_GET['i'])?htmlspecialchars($_GET["i"]):NULL;
$href="http://www.".$href.($server>0?$server:'').".com";
$ending = "1.jpg";
$folder = "thumbs";
$server_folder = "server$server";
$link = "../$folder/$server_folder/$name/$name$ending";

header("Content-type: image/jpeg");
$context = NULL;

$data = NULL;
if(file_exists($link) && @getimagesize($link)){
	header("Folder: true");
	readfile($link);
}else{
	$proxy = PasswordSingleton::getInstance()->getProxy();
	if($proxy){
		$context = stream_context_create(array('http'=>array('method'=>"GET",'proxy' => $proxy)));
	}
	header("Internet: true");
	$data = file_get_contents("$href/".($img?$img:$name)."$ending",false, $context);
	if(!is_dir("../$folder/$server_folder/$name")) mkdir("../$folder/$server_folder/$name", 0777, true);
	if($data){
		file_put_contents($link, $data);
		$after = microtime(true) - $before;
		header('Duration: '.$after);
		echo $data;
	}
}
?>