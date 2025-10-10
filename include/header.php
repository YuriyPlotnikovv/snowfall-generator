<?php
global $MESS, $LANG, $PATH;
$badgeLabel = urlencode($MESS['SUPPORT_THE_AUTHOR']);
?>

<!DOCTYPE html>
<html class="page" lang="<?= $LANG ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title><?= $MESS['PAGE_TITLE'] ?></title>
    <meta name="description" content="<?= $MESS['PAGE_DESCRIPTION'] ?>">
    <meta name="keywords" content="<?= $MESS['PAGE_KEYWORDS'] ?>">

    <?= Tools::getHrefLang() ?>
    <?= Tools::getOpenGraphMetaTags($MESS['PAGE_TITLE'], $MESS['PAGE_DESCRIPTION']) ?>
    <?= Tools::getSchemaOrgTags($MESS['PAGE_TITLE'], $MESS['PAGE_DESCRIPTION']) ?>

    <link rel="preload" href="/public/fonts/Jost-Variable.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="preload" href="/public/fonts/Jost-Italic-Variable.woff2" as="font" type="font/woff2"
          crossorigin="anonymous">

    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon.ico">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="application-name" content="<?= $MESS['PAGE_TITLE'] ?>">

    <link href="/public/css/vendor/vue-slider-component.min.css" rel="stylesheet">
    <link href="<?= Tools::addTimestampToFile('/public/css/style.min.css') ?>" rel="stylesheet">
</head>

<body class="page__body">
<div id="app">
    <header class="page__header header">
        <div class="header__wrapper">
            <div class="header__logo">
                <a href="<?= $PATH ?>" class="header__logo-link link" title="<?= $MESS['MAIN'] ?>">
                    <svg class="header__logo-image" xmlns="http://www.w3.org/2000/svg">
                        <use xlink:href="/public/img/sprite.svg#logo"/>
                    </svg>

                    <span class="header__logo-text"><?= $MESS['LOGO_TEXT'] ?></span>
                </a>
            </div>

            <a class="header__badge" href="https://yoomoney.ru/fundraise/1DA99C0NRL2.251010" target="_blank">
                <img src="https://img.shields.io/badge/YooMoney-32CD32?style=for-the-badge&label=<?= $badgeLabel ?>" alt="<?= $MESS['SUPPORT_THE_AUTHOR'] ?>"/>
            </a>

            <?php Tools::includeFile('lang-switcher'); ?>
        </div>
    </header>

    <main class="page__main main">