<?php
$map_Name = $_POST['mapName'];
$data = $_POST['mapData'];
$myFile = "Maps/" . $map_Name . ".txt";
$fh = fopen($myFile, 'w');
fwrite($fh, $data);
fclose($fh);
header('Location: http://www.blackmodulestudio.com/RPG/mapEditor.php');
exit;
?>