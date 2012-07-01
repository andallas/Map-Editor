<?php
$map_Name = $_POST['mapName'];
$myFile = "Maps/" . $map_Name . ".txt";
$curMap = "Maps/cur_map.txt";
$contents = file_get_contents($myFile);
$fh = fopen($curMap, 'w');
fwrite($fh, $contents);
fclose($fh);
header('Location: http://www.blackmodulestudio.com/RPG/mapEditor.php');
exit;
?>