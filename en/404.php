<?php
header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
global $MESS;
require_once $_SERVER['DOCUMENT_ROOT'] . '/include/header.php';
?>

<?php Tools::includeFile('/404'); ?>

<?php require_once $_SERVER['DOCUMENT_ROOT'] . '/include/footer.php'; ?>
