<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'/>
        <title id='document-title'>X3 Universe Map</title>
        <style>
        *{font-family: Helvetica, Tahoma, Arial}
        .table-fill {
          background: white;
          border-radius:3px;
          border-collapse: collapse;
          height: 320px;
          margin: auto;
          padding:5px;
          width: 100%;
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
        }

        th {
          color:#D5DDE5;;
          background:#1b1e24;
          border-bottom:4px solid #9ea7af;
          border-right: 1px solid #343a45;
          font-size:23px;
          font-weight: 100;
          padding:24px;
          text-align:left;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
          vertical-align:middle;
        }

        th:first-child {
          border-top-left-radius:3px;
        }

        th:last-child {
          border-top-right-radius:3px;
          border-right:none;
        }

        tr {
          border-top: 1px solid #C1C3D1;
          border-bottom-: 1px solid #C1C3D1;
          color:#666B85;
          font-size:16px;
          font-weight:normal;
          text-shadow: 0 1px 1px rgba(256, 256, 256, 0.1);
        }

        tr:hover td {
          background:#AEB0C6;
          color:#FFFFFF;
          border-top: 1px solid #22262e;
          border-bottom: 1px solid #22262e;
        }

        tr:first-child {
          border-top:none;
        }

        tr:last-child {
          border-bottom:none;
        }

        tr:nth-child(odd) td {
          background:#EBEBEB;
        }

        tr:nth-child(odd):hover td {
          background:#AEB0C6;
        }

        tr:last-child td:first-child {
          border-bottom-left-radius:3px;
        }

        tr:last-child td:last-child {
          border-bottom-right-radius:3px;
        }

        td {
          background:#FFFFFF;
          padding:20px;
          text-align:left;
          vertical-align:middle;
          font-weight:300;
          font-size:18px;
          text-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);
          border-right: 1px solid #C1C3D1;
        }

        td:last-child {
          border-right: 0px;
        }

        </style>
    </head>
    <body>
    	<div id='container'>
    		<table class='table-fill'>

    		<?php foreach ($config as $map => $mapConfig): ?>
    			<tr><th><?=$mapConfig['title'];?></th>
    			<?php foreach (Parser::$languageMap as $code => $languageName): ?>
	    			<td><a href='universe.html?lang=<?=$code;?>&map=<?=$map;?>'><?=$languageName;?></a></td>
	    		<?php endforeach;?>
	    		</tr>
    		<?php endforeach;?>
    		</table>
		</div>
	</body>
</html>