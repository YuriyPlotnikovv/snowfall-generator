<?php
global $MESS;
?>

<section class="page__not-found not-found">
    <div class="not-found__text-wrapper">
        <h1 class="not-found__title">404</h1>

        <p class="not-found__text"><?= $MESS['NOT_FOUND'] ?></p>
    </div>

    <div class="not-found__window-wrapper">
        <div class="not-found__window">
            <div class="not-found__stars">
                <?php for ($i = 1; $i <= 100; $i++) : ?>
                    <div class="not-found__star"></div>
                <?php endfor; ?>
            </div>
        </div>
    </div>
</section>
