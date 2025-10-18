<?php
global $MESS;
?>

<h1 class="visually-hidden"><?= $MESS['MAIN_TITLE'] ?></h1>

<div class="page__wrapper">
    <transition name="fade" mode="out-in">
        <section class="page__content" v-if="!isGenerated && !isSettings && !isLoading">
            <p class="page__title"><?= $MESS['WELCOME_TITLE'] ?></p>

            <p class="page__text">
                <?= $MESS['WELCOME_TEXT'] ?>
            </p>

            <button class="page__button button button--default"
                    id="button-start"
                    type="button"
                    @click="showSettings"
            >
                <?= $MESS['BUTTON_START'] ?>
            </button>
        </section>
    </transition>

    <transition name="fade" mode="out-in">
        <section class="page__content" v-if="!isGenerated && isSettings && !isLoading">
            <h2 class="page__title"><?= $MESS['SETTINGS_TITLE'] ?></h2>

            <p class="page__text"><?= $MESS['SETTINGS_SUBTITLE'] ?></p>

            <form class="page__form form" @submit.prevent="submitSettings">

                <fieldset class="form__fieldset form__fieldset--row" id="snowflake-type">
                    <legend class="form__legend"><?= $MESS['FIELDSET_SNOWFLAKE_TYPE'] ?></legend>

                    <label class="form__label form__label--radio"
                           v-for="(svg, key) in snowflakesSVGList"
                           :key="key"
                    >
                        <input class="form__input"
                               type="radio"
                               name="snowflakes-type"
                               :value="key"
                               v-model="settings.snowflakeType"
                        >

                        <span class="form__svg" v-html="svg"></span>
                    </label>

                    <label class="form__label form__label--radio">
                        <input class="form__input"
                               type="radio"
                               name="snowflakes-type"
                               value="custom"
                               v-model="settings.snowflakeType"
                        >

                        <span class="form__svg" v-if="customSnowflakeSVG" v-html="customSnowflakeSVG"></span>

                        <input class="form__input form__input--file"
                               type="file"
                               accept=".svg"
                               @change="onCustomSVGUpload"
                               ref="fileInput"
                        >

                        <button type="button" class="button button--default" @click="$refs.fileInput.click()">
                            <span v-if="selectedFileName">{{ selectedFileName }}</span>
                            <span v-if="!selectedFileName"><?= $MESS['BUTTON_UPLOAD_FILE'] ?></span>
                        </button>
                    </label>
                </fieldset>

                <fieldset class="form__fieldset" id="snowflake-parameters">
                    <legend class="form__legend"><?= $MESS['FIELDSET_SNOWFLAKE_PARAMETERS'] ?></legend>

                    <label class="form__label form__label--range">
                        <span class="form__label-text"><?= $MESS['LABEL_SNOWFLAKE_SIZE'] ?></span>

                        <vue-slider
                            v-model="settings.snowflakesSize"
                            :min="ranges.snowflakesSize.min"
                            :max="ranges.snowflakesSize.max"
                            :interval="5"
                            :tooltip="'always'"
                            :lazy="true"
                            :enable-cross="false"
                            :dot-size="16"
                            :height="6"
                            :contained="true"
                            :range="true"
                            class="form__input form__input--range"
                        />
                    </label>

                    <label class="form__label form__label--range">
                        <span class="form__label-text"><?= $MESS['LABEL_SNOWFLAKE_VISIBILITY'] ?></span>

                        <vue-slider
                            v-model="settings.snowflakesVisibility"
                            :min="ranges.snowflakesVisibility.min"
                            :max="ranges.snowflakesVisibility.max"
                            :interval="0.1"
                            :tooltip="'always'"
                            :lazy="true"
                            :enable-cross="false"
                            :dot-size="16"
                            :height="6"
                            :contained="true"
                            :range="true"
                            class="form__input form__input--range"
                        />
                    </label>
                </fieldset>

                <fieldset class="form__fieldset" id="snowfall">
                    <legend class="form__legend"><?= $MESS['FIELDSET_SNOWFALL'] ?></legend>

                    <label class="form__label form__label--range">
                        <span class="form__label-text"><?= $MESS['LABEL_SNOWFLAKES_COUNT'] ?></span>

                        <vue-slider
                            v-model="settings.snowflakesCount"
                            :min="ranges.snowflakesCount.min"
                            :max="ranges.snowflakesCount.max"
                            :interval="10"
                            :tooltip="'always'"
                            :lazy="true"
                            :dot-size="16"
                            :height="6"
                            :contained="true"
                            :range="false"
                            class="form__input form__input--range"
                        />
                    </label>

                    <label class="form__label form__label--range">
                        <span class="form__label-text"><?= $MESS['LABEL_SNOWFALL_SPEED'] ?></span>

                        <vue-slider
                            v-model="settings.snowfallSpeed"
                            :min="ranges.snowfallSpeed.min"
                            :max="ranges.snowfallSpeed.max"
                            :interval="10"
                            :tooltip="'always'"
                            :lazy="true"
                            :enable-cross="false"
                            :dot-size="16"
                            :height="6"
                            :contained="true"
                            :range="true"
                            class="form__input form__input--range"
                        />
                    </label>
                </fieldset>

                <fieldset class="form__fieldset" id="sway">
                    <legend class="form__legend"><?= $MESS['FIELDSET_SWAY'] ?></legend>

                    <label class="form__label form__label--checkbox">
                        <input class="form__input"
                               type="checkbox"
                               name="snowflakes-sway"
                               v-model="settings.swayEnabled"
                        >

                        <span class="form__label-text"><?= $MESS['LABEL_SWAY_ENABLED'] ?></span>
                    </label>

                    <transition name="fade-no-delay" mode="out-in">
                        <div class="form__group" v-show="settings.swayEnabled">
                            <label class="form__label form__label--range">
                                <span class="form__label-text"><?= $MESS['LABEL_SWAY_AMPLITUDE'] ?></span>

                                <vue-slider
                                    v-model="settings.swayAmplitude"
                                    :min="ranges.swayAmplitude.min"
                                    :max="ranges.swayAmplitude.max"
                                    :interval="5"
                                    :tooltip="'always'"
                                    :lazy="true"
                                    :enable-cross="false"
                                    :dot-size="16"
                                    :height="6"
                                    :contained="true"
                                    :range="true"
                                    class="form__input form__input--range"
                                />
                            </label>

                            <label class="form__label form__label--range">
                                <span class="form__label-text"><?= $MESS['LABEL_SWAY_FREQUENCY'] ?></span>

                                <vue-slider
                                    v-model="settings.swayFrequency"
                                    :min="ranges.swayFrequency.min"
                                    :max="ranges.swayFrequency.max"
                                    :interval="0.1"
                                    :tooltip="'always'"
                                    :lazy="true"
                                    :enable-cross="false"
                                    :dot-size="16"
                                    :height="6"
                                    :contained="true"
                                    :range="true"
                                    class="form__input form__input--range"
                                />
                            </label>
                        </div>
                    </transition>
                </fieldset>

                <fieldset class="form__fieldset" id="rotation">
                    <legend class="form__legend"><?= $MESS['FIELDSET_ROTATION'] ?></legend>

                    <label class="form__label form__label--checkbox">
                        <input class="form__input"
                               type="checkbox"
                               name="snowflakes-rotation"
                               v-model="settings.rotationEnabled"
                        >

                        <span class="form__label-text"><?= $MESS['LABEL_ROTATION_ENABLED'] ?></span>
                    </label>

                    <transition name="fade-no-delay" mode="out-in">
                        <div class="form__group" v-show="settings.rotationEnabled">
                            <label class="form__label form__label--range">
                                <span class="form__label-text"><?= $MESS['LABEL_ROTATION_SPEED'] ?></span>

                                <vue-slider
                                    v-model="settings.rotationSpeed"
                                    :min="ranges.rotationSpeed.min"
                                    :max="ranges.rotationSpeed.max"
                                    :interval="5"
                                    :tooltip="'always'"
                                    :lazy="true"
                                    :enable-cross="false"
                                    :dot-size="16"
                                    :height="6"
                                    :contained="true"
                                    :range="true"
                                    class="form__input form__input--range"
                                />
                            </label>
                        </div>
                    </transition>
                </fieldset>

                <fieldset class="form__fieldset" id="wind">
                    <legend class="form__legend"><?= $MESS['FIELDSET_WIND'] ?></legend>

                    <label class="form__label form__label--checkbox">
                        <input class="form__input"
                               type="checkbox"
                               name="snowflakes-wind"
                               v-model="settings.windEnabled"
                        >

                        <span class="form__label-text"><?= $MESS['LABEL_WIND_ENABLED'] ?></span>
                    </label>

                    <transition name="fade-no-delay" mode="out-in">
                        <div class="form__group" v-show="settings.windEnabled">
                            <div class="form__wrapper">
                                <span class="form__caption"><?= $MESS['LABEL_WIND_DIRECTION'] ?></span>

                                <label class="form__label form__label--radio">
                                    <input class="form__input"
                                           type="radio"
                                           name="wind-type"
                                           value="left"
                                           v-model="settings.windType"
                                           checked
                                    >

                                    <span class="form__label-text"><?= $MESS['LABEL_WIND_LEFT_TO_RIGHT'] ?></span>
                                </label>

                                <label class="form__label form__label--radio">
                                    <input class="form__input"
                                           type="radio"
                                           name="wind-type"
                                           value="right"
                                           v-model="settings.windType"
                                    >

                                    <span class="form__label-text"><?= $MESS['LABEL_WIND_RIGHT_TO_LEFT'] ?></span>
                                </label>
                            </div>

                            <label class="form__label form__label--range">
                                <span class="form__label-text"><?= $MESS['LABEL_WIND_SPEED'] ?></span>

                                <vue-slider
                                    v-model="settings.windSpeed"
                                    :min="ranges.windSpeed.min"
                                    :max="ranges.windSpeed.max"
                                    :interval="10"
                                    :tooltip="'always'"
                                    :lazy="true"
                                    :dot-size="16"
                                    :height="6"
                                    :contained="true"
                                    :range="false"
                                    class="form__input form__input--range"
                                />
                            </label>
                        </div>
                    </transition>
                </fieldset>

                <button class="page__button button button--default" id="button-next" type="submit">
                    <?= $MESS['BUTTON_NEXT'] ?>
                </button>
            </form>
        </section>
    </transition>

    <transition name="fade" mode="out-in">
        <section class="page__content" v-if="isLoading">
            <p class="page__title"><?= $MESS['LOADING_TEXT'] ?></p>
        </section>
    </transition>

    <transition name="fade" mode="out-in">
        <section class="page__content" v-if="isGenerated">
            <h2 class="page__title"><?= $MESS['RESULT_TITLE'] ?></h2>

            <p class="page__text">
                <?= $MESS['RESULT_TEXT'] ?>
            </p>

            <a class="page__button button button--default"
               href="https://yoomoney.ru/fundraise/<?= YOOMONEY_CODE ?>"
               target="_blank"
            >
                <?= $MESS['SUPPORT_THE_AUTHOR'] ?>
            </a>

            <button class="page__button button button--default"
                    id="button-download"
                    :disabled="!isGenerated || !generatedScriptUrl"
                    @click="downloadScript"
            >
                <?= $MESS['BUTTON_DOWNLOAD'] ?>
            </button>

            <button class="page__button button button--accent"
                    type="reset"
                    id="button-reset"
                    @click="createNewScript"
            >
                <?= $MESS['BUTTON_RESET'] ?>
            </button>
        </section>
    </transition>
</div>
