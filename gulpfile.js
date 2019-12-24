const gulp = require('gulp'), // Подключаем Gulp
	browserSync = require('browser-sync').create(),
	watch = require('gulp-watch'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	fileinclude = require('gulp-file-include'), // Для подключения файлов друг в друга
	rimraf = require('rimraf'); // удаление файлов

const build = './build',
	src = './src';

const path = {
	html: {
		build: `${build}/`,
		src: `${src}/html/*.html`
	},
	css: {
		build: `${build}/css/`,
		src: `${src}/scss/main.scss`
	},
	img: {
		build: `${build}/images/`,
		src: `${src}/images/**/*.*`
	},
	upload: {
		build: `${build}/upload/`,
		src: `${src}/upload/**/*.*`
	},
	js: {
		build: `${build}/js/`,
		src: `${src}/js/**/*.js`
	},
	watch: {
		html: `${build}/*.html`,
		css: `${build}/css/**/*.css`,
		scss: `${src}/scss/**/*.scss`,
		html_src: `${src}/html/**/*.html`,
		img: `${src}/images/**/*.*`,
		upload: `${src}/upload/**/*.*`,
		js: `${src}/js/**/*.js`
	},
	clean: `${build}`
};

// Таск для очистки папки build
gulp.task('clean', function (callback) {
	rimraf(path.clean, callback);
});

// Таск для сборки HTML и шаблонов
gulp.task('html', function (callback) {
	return gulp.src(path.html.src)
		.pipe( plumber({
			errorHandler: notify.onError(function (err) {
				return {
					title: 'HTML include',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe( fileinclude({ prefix: '@@' }) )
		.pipe( gulp.dest(path.html.build) )
	callback();
});

// Таск для компиляции SCSS в CSS
gulp.task('scss', function (callback) {
	return gulp.src(path.css.src)
		.pipe( plumber({
			errorHandler: notify.onError(function (err) {
				return {
					title: 'Styles',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe( sourcemaps.init() )
		.pipe( sass() ) // CSS
		.pipe( autoprefixer({
			overrideBrowserslist: ['last 4 versions']
		}) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest(path.css.build) )
	callback();
});

// Таск для копирования картинок
gulp.task('copy:img', function (callback) {
	return gulp.src(path.img.src)
		.pipe(gulp.dest(path.img.build))
	callback();
});

// Таск для копирования картинок Upload
gulp.task('copy:upload', function (callback) {
	return gulp.src(path.upload.src)
		.pipe(gulp.dest(path.upload.build))
	callback();
});

// Таск для копирования скриптов
gulp.task('copy:js', function (callback) {
	return gulp.src(path.js.src)
		.pipe(gulp.dest(path.js.build))
	callback();
});

// Слежение за HTML и CSS и обновление браузера
gulp.task('watch', function() {
	// Слежение за HTML и CSS и обновление браузера
	watch([path.watch.html, path.watch.css], gulp.parallel( browserSync.reload ));

	// Запуск слежения и компиляции SCSS с задержкой, для жестких дисков HDD
	watch(path.watch.scss, function() {
		setTimeout( gulp.parallel('scss'), 1000 )
	});

	// Слежение за HTML и сборка страниц и шаблонов
	watch(path.watch.html_src, gulp.parallel('html'));

	// Слежение и копирование статических файлов и скриптов
	watch(path.watch.img, gulp.parallel('copy:img'));
	watch(path.watch.upload, gulp.parallel('copy:upload'));
	watch(path.watch.js, gulp.parallel('copy:js'));
});

// Задача для старта сервера из папки app
gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: `${build}`
		}
	})
});

// Дефолтный таск (задача по умолчанию)
// Запускаем одновременно задачи server и watch
gulp.task('default', gulp.series(
	'clean',
	gulp.parallel('scss', 'html', 'copy:img', 'copy:upload', 'copy:js'),
	gulp.parallel('server', 'watch')
));
