const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const gulpttf2woff = require('gulp-ttf2woff');
const gulpttf2woff2 = require('gulp-ttf2woff2');
const htmlmin = require('gulp-htmlmin');
const less=require('gulp-less');
const fonter=require('gulp-fonter');
const gulpPug =require('gulp-pug');



/////////// ФУНКЦИЯ browser() КОТОРАЯ ИНИЦИАЛЬЗИРУЕТСЯ ПЕРЕМЕННОЙ  browserSync
/////////// И СЛЕДИТ ЗА ИЗМЕНЕНИЯМИ В ПАПКЕ app

function browser() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

///////////////////ПРЕПРОЦЕССОР SCSS
function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
        .pipe(dest('dist/css/'))
        .pipe(browserSync.stream())
}

///////////////////ПРЕПРОЦЕССОР lESS
// function styles() {
//     return src('app/less/style.less')
//         .pipe(less({ outputStyle: 'compressed' }))
//         .pipe(concat('style.min.css'))
//         .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
//         .pipe(dest('dist/css/'))
//         .pipe(browserSync.stream())
// }


//////////// ФУНКЦИЯ scripts() ПОДКЛЮЧАЕТ СПЕРВА ФАЙЛ jquery.js ПОСЛЕ ПОДКЛЮЧАЕТ main.js
///////////  СОЕДИНЯЕТ ФАЙЛЫ jquery.js И main.js В ОДИН И НАЗЫВАЕТ ЕГО main.min.js
///////////  КОТОРЫЙ В ДАЛЬНЕЙШЕМ ПОДКЛЮЧАЕМ В html ФАЙЛ ДАЛЕЕ  СЖИМАЕМ ФАЙЛ main.min.js
///////////  ИСПОЛЬЗУЯ ПЛАГИН uglify ДАЛЕЕ ВЫГРУЖАЕМ ГОТОВЫЙ ФАЙЛ В ПАПКУ app/js/
///////////  И ПЕРЕЗАПУСКАЕМ БРАУЗЕР browserSync.stream()

function scripts() {
    return src([ // Берем файлы из источников
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js', // Пример подключения библиотеки,
        'app/js/main.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
    ])
        .pipe(concat('main.min.js')) // Конкатенируем в один файл
        .pipe(uglify()) // Сжимаем JavaScript
        .pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

//////////// ФУНКЦИЯ htmlWatching() ПЕРЕКИДІВАЕТ ИЗ ПАПКИ app В ПАПКУ dist ВСЕ html ФАЙЛЫ

function htmlWatching(){
    return src('app/*.html')
        .pipe(dest('dist/'))
}

//////////// ФУНКЦИЯ images() МИНИФИЦИРУЕТ ИЗОБРАЖЕНИЯ ИЗ ПАПКИ app/images/* 
///////////  И ВЫКИДЫВАЕТ МИНИФИЦИРОВАННЫЕ ИЗОБРАЖЕНИЯ В ПАПКУ  dist/images/

function images() {
    return src('app/images/*')
        .pipe(imagemin())
        .pipe(dest('dist/images'))
}

////////////////// Функция watching следит за изменениями в файле ////////////////////////////////////////
function watching() {
    watch(['app/js/main.js'], scripts);
    watch(['app/scss/**/*.scss'], styles);
    // watch(['app/less/**/*.less'], styles);
    watch(['app/*.html'],htmlWatching);
    
}

/////////ФУНКЦИЯ build() СОБИРАЕТ ВЕСЬ ГОТОВЫЙ ПРОЕКТ В ПАПКУ dist
function build() {
    return src([ // Выбираем нужные файлы
        'app/css/**/*.min.css',
        'app/js/**/*.min.js',
        'app/images/dest/**/*',
        'app/**/*.html',
    ], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
        .pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}


//////////Функция delite() УДАЛЯЕТ ВСЕ images В ПАПКЕ app ПОСЛЕ МИНИФИКАЦИИ КАРТИНОК В ПАПКУ dist/images/
function delite() {
    return del('app/images/')
}



//////////////////////КОНВЕРТИРОВАНИЕ ШРИФТОВ

////////////////ФУНКЦИЯ КОТОРАЯ КОНВЕРТИРУЕТ ШРИФТЫ ИЗ ФОРМАТА ttf в woff
function ttf2woff() {
    return src('app/fonts/*.ttf')
        .pipe(gulpttf2woff())
        .pipe(dest('dist/fonts/'));
}

////////////////ФУНКЦИЯ КОТОРАЯ КОНВЕРТИРУЕТ ШРИФТЫ ИЗ ФОРМАТА ttf в woff2
function ttf2woff2() {
    return src('app/fonts/*.ttf')
        .pipe(gulpttf2woff2())
        .pipe(dest('dist/fonts/'));
}

//////////////// ФУНКЦИЯ КОТОРАЯ КОНВЕРТИРУЕТ ШРИФТЫ ИЗ ФОРМАТА otf в ttf после чего запускается метод
/////////////// exports.fonts = series(ttf2woff, ttf2woff2); который конвертирует шрифты из формата
//////////////  ttf в woff и woff2

function otf(){
    return src('app/fonts/*')
    .pipe(fonter({
        formats: ['ttf']
      }))
    .pipe(dest('dist/fonts/'))
}




//////////////////////////ФУНКЦИЯ ДЛЯ МИНИФИКАЦИИ ИЛИ ЖЕ СЖАТИЯ html КОДА
function html() {
    return src('app/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('dist/'));
}

////////////////////////ПРЕПРОЦЕССОР html (PUG)

function pug(){
    return src('app/*.pug')
    .pipe(gulpPug())
    .pipe(dest('dist/'))
}


/////////////////////////Копирование css из dist в app

function copy(){
    return src('dist/css/style.min.css')
    .pipe(dest('app/css/'));
}


/////////////////Чтобы отменить функцию watching нужно прописать в консоли CTRL C //////////////////////
exports.styles = styles;
exports.watching = watching;
exports.browser = browser;
exports.scripts = scripts;
exports.build = build;
exports.images = images;
exports.delite = delite;
exports.ttf2woff = ttf2woff;
exports.ttf2woff2 = ttf2woff2;
exports.htmlWatching=htmlWatching;
exports.html=html;
exports.less=less;
exports.otf=otf;
exports.pug=pug;
exports.copy=copy;

//////////// ИСПОЛЬЗОВАНИЕ ФУНКЦИЙ parallel(ДЛЯ ПАРАЛЕЛЬНОГО ЗАПУСКА ФУНКЦИЯ) И 
//////////// series(ДЛЯ ПОСЛЕДОВАТЕЛЬНОГО ЗАПУСКА ФУНКЦИЙ)

exports.html=parallel(watching,html);
exports.default = parallel(scripts, styles,watching, browser,htmlWatching,copy);
exports.del = series(images, delite, browser);
exports.fonts = series(ttf2woff, ttf2woff2);//ШРИФТЫ КОНВЕРТИРУЮТСЯ ИСПОЛЬЗУЯ ФУНКЦИЮ SERIES ТОЛЬКО ПОСЛЕДОВАТЕЛЬНО