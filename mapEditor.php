<?php
$contents = file_get_contents('Maps/cur_map.txt');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Blackmodule's Map Editor</title>
</head>
<body>
<script src="Game.js"></script>
<div align="center">
    <canvas id="canvas" width="800" height="640">
        Your browser does not support the canvas element, sorry.
    </canvas>
    <script type="text/javascript">
        var play = new Game();
        var contents = "<?php echo $contents;?>";
        play.Init(contents);
        play.Run();
    </script>
</div>

</body>
</html>