const gulp = require('gulp'), // Подключаем Gulp
	browserSync = require('browser-sync').create(),
	watch = require('gulp-watch'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	fileinclude = require('gulp-file-include'); // Для подключения файлов друг в друга

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
	watch: {
		html: `${build}/*.html`,
		css: `${build}/css/**/*.css`,
		scss: `${src}/scss/**/*.scss`,
		html_src: `${src}/html/**/*.html`
	}
};

// Таск для сборки HTML и шаблонов
gulp.task('html', function (callback) {
	return gulp.src(path.html.src) // './app/html/*.html'
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
		.pipe( gulp.dest(path.html.build) ) // './app/'
	callback();
});

// Таск для компиляции SCSS в CSS
gulp.task('scss', function (callback) {
	return gulp.src(path.css.src) // './app/scss/main.scss'
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
		.pipe( sass() )
		.pipe( autoprefixer({
			overrideBrowserslist: ['last 4 versions']
		}) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest(path.css.build) ) // './app/css/'
	callback();
});

// Слежение за HTML и CSS и обновление браузера
gulp.task('watch', function() {
	// Слежение за HTML и CSS и обновление браузера
	watch([path.watch.html, path.watch.css], gulp.parallel( browserSync.reload )); // './app/*.html', './app/css/**/*.css'

	// Слежение за SCSS и компиляция в CSS - обычный способ
	// watch('./app/scss/**/*.scss', gulp.parallel('scss'));

	// Запуск слежения и компиляции SCSS с задержкой, для жестких дисков HDD
	watch(path.watch.scss, function() { // './app/scss/**/*.scss'
		setTimeout( gulp.parallel('scss'), 1000 )
	});

	// Слежение за HTML и сборка страниц и шаблонов
	watch(path.watch.html_src, gulp.parallel('html')); // './app/html/**/*.html'

});

// Задача для старта сервера из папки app
gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: `${build}` // "./app/"
		}
	})
});

// Дефолтный таск (задача по умолчанию)
// Запускаем одновременно задачи server и watch
gulp.task('default', gulp.parallel('server', 'watch', 'scss', 'html'));
