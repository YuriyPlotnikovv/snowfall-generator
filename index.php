<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/init.php';
global $LANG;

$allowed_languages = ['en', 'ru'];

$uri = $_SERVER['REQUEST_URI'];
$trimmedUri = trim($uri, '/');
$segments = $trimmedUri === '' ? [] : explode('/', $trimmedUri);

if (isset($segments[0]) && preg_match('/^[a-zA-Z]{2}$/', $segments[0]) && in_array($segments[0], $allowed_languages)) {
    $language = array_shift($segments);
} else {
    $language = $LANG;
}

$redirectLang = $language === 'ru' ? '' : $language . '/';

switch (count($segments)) {
    case 0:
        $filePath = $_SERVER['DOCUMENT_ROOT'] . '/' . $language . '/index.php';
        break;

    case 1:
        if ($segments[0] === '404') {
            $filePath = $_SERVER['DOCUMENT_ROOT'] . '/' . $language . '/404.php';
        } elseif ($segments[0] === $language) {
            $filePath = $_SERVER['DOCUMENT_ROOT'] . '/' . $segments[0] . '/index.php';
        } else {
            header("Location: /{$redirectLang}404/");
            exit;
        }
        break;

    default:
        header("Location: /{$redirectLang}404/");
        exit;
}

if (file_exists($filePath)) {
    include $filePath;
} else {
    header("Location: /{$redirectLang}404/");
    exit;
}
