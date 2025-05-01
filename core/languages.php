<?php
global $MESS, $PATH, $LANG;

$allowed_languages = ['en', 'ru'];

function getLangFromUrl($uri, $allowed_languages)
{
    $path = parse_url($uri, PHP_URL_PATH);
    $segments = explode('/', trim($path, '/'));

    if (isset($segments[0]) && preg_match('/^[a-zA-Z]{2}$/', $segments[0]) && in_array($segments[0], $allowed_languages)) {
        return $segments[0];
    } else {
        return 'ru';
    }
}

$langFromUrl = getLangFromUrl($_SERVER['REQUEST_URI'], $allowed_languages);
$lang = $langFromUrl;

$LANG = $lang;
$PATH = $lang === 'ru' ? '/' : '/' . $lang . '/';
$MESS = include $_SERVER['DOCUMENT_ROOT'] . "/lang/{$lang}.php";
