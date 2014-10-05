<?php
//header("HTTP/1.0 410 Gone"); exit;
header('Content-type: text/cache-manifest');

?>CACHE MANIFEST
<?php
echo '#V-'.strtoupper(dechex(getlastmod()))."\n";
?>

CACHE:
/
/index.html
/default.css
/crypto.js
/totp.js
/main.js