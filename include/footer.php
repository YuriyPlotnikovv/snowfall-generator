<?php
global $MESS;
?>

</main>

<footer class="page__footer footer">
    <div class="footer__wrapper">
        <a class="footer__info link"
           href="https://github.com/YuriyPlotnikovv/snowfall-generator"
           target="_blank"
           rel="noopener noreferrer"
           title="<?= $MESS['FOOTER_GITHUB'] ?>"
        >
            <svg class="footer__info-icon" xmlns="http://www.w3.org/2000/svg">
                <use xlink:href="/public/img/sprite.svg#icon-github"/>
            </svg>

            <span class="footer__info-text"><?= $MESS['FOOTER_GITHUB'] ?></span>
        </a>

        <a class="footer__info link"
           href="https://yuriyplotnikovv.ru/"
           target="_blank"
           rel="noopener noreferrer"
           title="<?= $MESS['FOOTER_AUTHOR'] ?>"
        >
            <svg class="footer__info-icon" xmlns="http://www.w3.org/2000/svg">
                <use xlink:href="/public/img/sprite.svg#icon-developer"/>
            </svg>

            <span class="footer__info-text"><?= $MESS['FOOTER_AUTHOR'] ?></span>
        </a>
    </div>
</footer>
</div>

<script src="/public/js/vendor/vue.min.js"></script>
<script src="/public/js/vendor/vue-slider-component.min.js"></script>
<script src="<?= Tools::addTimestampToFile('/public/js/script.min.js') ?>"></script>
</body>
</html>