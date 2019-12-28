const gulp = require('gulp'), // Подключаем Gulp
	browserSync = require('browser-sync').create(),
	watch = require('gulp-watch'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	fileinclude = require('gulp-file-include'), // Для подключения файлов друг в друга
	rimraf = require('rimraf'), // удаление файлов
	pug = require('gulp-pug'),
	fs = require('fs');

const build = './build',
	src = './src';

const path = {
	json: `${src}/data/html-data.json`,
	pug: {
		build: `${build}/`,
		src: `${src}/pug/pages/**/*.pug`
	},
	css: {
		build: `${build}/css/`,
		src: `${src}/scss/main.scss`
	},
	js: {
		build: `${build}/js/`,
		src: `${src}/js/**/*.js`
	},
	img: {
		build: `${build}/img/`,
		src: `${src}/img/**/*.*`
	},
	watch: {
		js: `${build}/js/**/*.js`,
		img: `${build}/img/**/*.*`,
		scss: `${src}/scss/**/*.scss`,
		pug: `${src}/pug/**/*.pug`,
		json: `${src}/data/html-data.json`
	},
	clean: `${build}`
};

// Таск для очистки папки build
gulp.task('clean:build', function (callback) {
	rimraf(path.clean, callback);
});

// Таск для сборки Pug файлов
gulp.task('pug', function (callback) {
	return gulp.src(path.pug.src)
		.pipe( plumber({
			errorHandler: notify.onError(function (err) {
				return {
					title: 'Pug',
					sound: false,
					message: err.message
				}
			})
		}))
		.pipe( pug({
			pretty: true,
			locals: {
				jsonData: JSON.parse(fs.readFileSync(path.json, 'utf8'))
			}
		}) )
		.pipe( gulp.dest(path.pug.build) )
		.pipe( browserSync.stream() )
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
		.pipe( browserSync.stream() )
	callback();
});

// Таск для копирования картинок
gulp.task('copy:img', function (callback) {
	return gulp.src(path.img.src)
		.pipe(gulp.dest(path.img.build))
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
	// Следим за картинками и скриптами и обновляем браузер
	watch([path.watch.js, path.watch.img], gulp.parallel( browserSync.reload ));

	// Запуск слежения и компиляции SCSS с задержкой, для жестких дисков HDD
	watch(path.watch.scss, function() {
		setTimeout( gulp.parallel('scss'), 1000 )
	});

	// Слежение за PUG и сборка
	watch([path.watch.pug, path.watch.json], gulp.parallel('pug'));

	// Следим за картинками и скриптами, и копируем их в build
	watch(path.img.src, gulp.parallel('copy:img'));
	watch(path.js.src, gulp.parallel('copy:js'));
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
	gulp.parallel('clean:build'),
	gulp.parallel('scss', 'pug', 'copy:img', 'copy:js'),
	gulp.parallel('server', 'watch')
));
