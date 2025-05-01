<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/languages.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/classes/Tools.php';

spl_autoload_register(function ($class) {
    $file = $_SERVER['DOCUMENT_ROOT'] . '/core/classes/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});