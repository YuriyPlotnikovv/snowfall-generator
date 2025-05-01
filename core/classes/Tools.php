<?php
class Tools
{
    public static function includeFile(string $fileName): void
    {
        $filePath = $_SERVER['DOCUMENT_ROOT'] . '/include/' . $fileName . '.php';

        if (file_exists($filePath)) {
            include $filePath;
        } else {
            error_log('File not found: ' . $filePath, 3, $_SERVER['DOCUMENT_ROOT'] . '/errors.log');
        }
    }

    public static function addTimestampToFile($filePath) {
        if (file_exists($_SERVER['DOCUMENT_ROOT'] . $filePath)) {
            $timestamp = filemtime($_SERVER['DOCUMENT_ROOT'] . $filePath);
            return $filePath . '?v=' . $timestamp;
        } else {
            return $filePath;
        }
    }

    public static function toggleLanguage($url): string
    {
        $parsedUrl = parse_url($url);
        $path = $parsedUrl['path'] ?? '';
        $segments = explode('/', trim($path, '/'));

        if (isset($segments[0]) && $segments[0] === 'en') {
            array_shift($segments);
        } else {
            array_unshift($segments, 'en');
        }

        $newPath = '/' . implode('/', $segments);

        if (!str_ends_with($newPath, '/')) {
            $newPath .= '/';
        }

        return (isset($parsedUrl['scheme']) ? $parsedUrl['scheme'] . '://' : '') .
            ($parsedUrl['host'] ?? '') .
            $newPath .
            (isset($parsedUrl['query']) ? '?' . $parsedUrl['query'] : '') .
            (isset($parsedUrl['fragment']) ? '#' . $parsedUrl['fragment'] : '');
    }

    public static function getCurrentUrl()
    {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'];
        $requestUri = $_SERVER['REQUEST_URI'];

        return $protocol . $host . $requestUri;
    }

    public static function getHrefLang(): string {
        $url = self::getCurrentUrl();
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'];
        $server = $protocol . $host;

        $parsedUrl = parse_url($url);
        $path = $parsedUrl['path'] ?? '';
        $segments = explode('/', trim($path, '/'));

        if (isset($segments[0]) && $segments[0] === 'en') {
            array_shift($segments);
        }

        $newPath = '/' . implode('/', $segments);

        if (!str_ends_with($newPath, '/')) {
            $newPath .= '/';
        }

        $hrefLangTags = [
            '<link rel="alternate" hreflang="x-default" href="' . htmlspecialchars($server) . '/" />',
            '<link rel="alternate" hreflang="ru" href="' . htmlspecialchars($server . $newPath) . '" />',
            '<link rel="alternate" hreflang="en" href="' . htmlspecialchars($server . '/en' . $newPath) . '" />'
        ];

        return implode("\n", $hrefLangTags) . "\n";
    }

    public static function getOpenGraphMetaTags($pageTitle, $pageDescription): string {
        global $LANG;

        $title = htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8');
        $description = htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8');
        $locale = mb_strtolower($LANG) . '_' . mb_strtoupper($LANG);
        $currentUrl = htmlspecialchars(self::getCurrentUrl(), ENT_QUOTES, 'UTF-8');
        $host = htmlspecialchars($_SERVER['HTTP_HOST'], ENT_QUOTES, 'UTF-8');

        $metaTags = [
            '<meta property="og:type" content="website" />',
            '<meta property="og:title" content="' . $title . '" />',
            '<meta property="og:description" content="' . $description . '" />',
            '<meta property="og:url" content="' . $currentUrl . '" />',
            '<meta property="og:locale" content="' . $locale . '" />',
            '<meta property="og:site_name" content="' . $title . '" />',
            '<meta property="og:image" content="https://' . $host . '/public/img/og-image.png" />',
            '<meta property="og:image:type" content="image/png" />',
            '<meta property="og:image:width" content="1200" />',
            '<meta property="og:image:height" content="630" />',
        ];

        return implode("\n", $metaTags) . "\n";
    }

    public static function getSchemaOrgTags(string $name, string $description): string {
        $currentUrl = htmlspecialchars(self::getCurrentUrl(), ENT_QUOTES, 'UTF-8');

        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'WebApplication',
            'name' => $name,
            'url' => $currentUrl,
            'description' => $description,
            'applicationCategory' => 'UtilitiesApplication',
            'operatingSystem' => 'All',
            'browserRequirements' => 'Modern browser with JavaScript support',
            'creator' => [
                '@type' => 'Person',
                'name' => 'Yuriy Plotnikov',
                'url' => 'https://yuriyplotnikovv.ru/',
            ],
        ];

        $json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        return "<script type=\"application/ld+json\">\n" . $json . "\n</script>\n";
    }
}