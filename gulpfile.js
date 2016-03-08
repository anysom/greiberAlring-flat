//general tasks
gulp = require('gulp');
var browserSync = require('browser-sync');
var styleguide = require('sc5-styleguide');
var fs = require('fs');
var reload = browserSync.reload;
var rename = require('gulp-rename');
var notify = require('gulp-notify'); //when on Windows 7 it falls back to Growl, so this should be installed for best experience.
var gutil = require('gulp-util');
var path = require('path');
//JS Specific tasks
var jshint = require('gulp-jshint');
var eslint = require('gulp-eslint');
var exorcist   = require('exorcist');
//var browserify = require('gulp-browserify');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

//CSS Specific tasks
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var preprocessor = null;



/********************************************************/
/* Settings */
var settings = {
    localhost:          '',
    baseDir:            'website/',
    scriptsDir:         'scripts/',
    appStartFile:       'app.js',
    siteScriptsDir:     'source/',
    mainStyleFile:      'main',
    stylesDir:          'styles/',
    componentsDir:      'components/',
    projectName:        'Greiber Alring',
    styleguideDir:      'styleguide',
    preprocesser:       'sass'
};



/********************************************************/
/* Helper functions */
settings = function initializeSettings() {
    //convert directories to absolute paths
    settings.scriptsDir = settings.baseDir + settings.scriptsDir;
    settings.siteScriptsDir = settings.scriptsDir + settings.siteScriptsDir;
    settings.stylesDir = settings.baseDir + settings.stylesDir;
    settings.componentsDir = settings.baseDir + settings.componentsDir;
    settings.styleguideDir = settings.baseDir + settings.styleguideDir;

    //set preprocessor settings
    if (settings.preprocesser === 'sass') {
      preprocessor = sass;
      settings.preprocesserExtension = 'scss';
    } else if (settings.preprocesser === 'less') {
      preprocessor = less;
      settings.preprocesserExtension = 'less';
    }
    settings.mainStyleFile = settings.mainStyleFile + '.' + settings.preprocesserExtension;

    return settings;
}();

function handleError(error) {
    console.log('test', error.toString());
    gulp.src('').pipe(notify(error));
    this.emit('end');
}

function readJSONFile(path) {
    var file = fs.readFileSync(path, 'utf8');
    var str = file.toString();
    while (str.charCodeAt(0) == 65279) {
        str = str.substr(1);
    }
    return JSON.parse(str);
}

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


/********************************************************/
/* Sub Tasks */

gulp.task('browser-sync', function() {
    /*There are two ways to setup BrowserSync. Either Proxy-mode or Server-mode.
      Proxy-mode is for the case where your website is already hosted, in the IIS for instance.
      The Server-mode is when you are working with static html files, and you need browserSync to
      start a server for you.
    */

    //Proxy Mode
    //This mode alo requires that you paste a snippet of javascript to you html files that you want
    //synced with BrowserSync.
    /*browserSync({
        proxy: settings.localhost
    });*/

    //Server mode
    browserSync({
        server: {
            baseDir: settings.baseDir
        }
      //proxy: 'http://localhost:57989/'
    });
});


gulp.task('views:updated', function() {
    console.log('running: views-updated');
    gulp.src(settings.baseDir+'views/**/*.cshtml')
        .pipe(reload({stream:true}))
        .pipe(notify('Views updated'));
});


//__________________JAVASCRIPT______________________//
gulp.task('js', ['javascript:main']);

gulp.task('javascript:main', function() {
    console.log('running: javascript-updated');

    //Run linting tools on all site scripts (not vendor scripts)
    console.log('Checking for linting at:', settings.siteScriptsDir + '**/*.js');
    gulp.src(settings.siteScriptsDir + '**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failOnError())
      .on('error', handleError);

    //Bundle up application with Browserify
    /*gulp.src(settings.siteScriptsFolder + '/' + settings.appStartFile)
    .pipe(browserify({
      baseDir: settings.scriptsDir,
      transform: ['uglifyify'],
      debug: true//!gulp.env.production //true/false value - will add sourcemaps if true

    }))
    //.pipe(exorcist('test.js.map'))
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest(settings.scriptsDir));*/

    var files = settings.siteScriptsDir + settings.appStartFile;
    var b = browserify({
      //baseDir: settings.scriptsDir
      entries: [files],
      //transform: ['uglifyify'],
      debug: true
    });

    return b.bundle()
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(rename('main.min.js'))
      .pipe(gulp.dest(settings.scriptsDir));
  /*
  Jeg skal finde ud af hvordan:
      -jeg kan lave flere forskellige bundles
      -jeg kan gemme Source Map i en ekstern fil så jeg kan bruge den samme byggede main.min.js både i prod og dev
  */
});


//I split up my vendor JS into a seperate task, since there is no need that
//all the vendor code should be checked by my linting tools every time i change something
//in my own javascript.
/*
gulp.task('javascript:vendor', function() {
    var mapJSON = readJSONFile(settings.scriptsDir+'libs-map.json');

    //I don't obfuscate the libs, since i expect them to be already
    gulp.src(mapJSON)
        .pipe(concat('libs.min.js'))
        .pipe(gulp.dest(settings.scriptsDir))
        .pipe(reload({ stream: true }))
});
*/

//__________________STYLESHEETS______________________//
gulp.task('style-build', function () {
    gulp.src(settings.stylesDir + settings.mainStyleFile)
        .pipe(preprocessor())
        .on('error', handleError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .on('error', handleError)
        .pipe(minifyCSS())
        //.pipe(styleguide.applyStyles())
        //.pipe(gulp.dest(settings.styleguideDir))
        .on('error', handleError)
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(settings.stylesDir))
        .pipe(reload({stream: true}));
});


//__________________STYLEGUIDE______________________//

//this task only initializes the styleguide. During the style-build task the styleguide is updated with components and styles.
gulp.task('styleguide', function() {
  return gulp.src(settings.stylesDir + '/**/*.' + settings.preprocesserExtension)
    .pipe(styleguide.generate({
        title: settings.projectName + ' Styleguide',
        commonClass: ['sgwa-body'],
        server: true,
        rootPath: settings.styleguideDir,
        port: 5000
      }))
    .on('error', handleError)
    .pipe(gulp.dest(settings.styleguideDir));
});

/********************************************************/
/* Gulp Tasks */

gulp.task('default', ['js','style-build','browser-sync'], function() {
    console.log('default Gulp task started');

    gulp.watch(settings.baseDir+'views/Master.cshtml', ['views:updated']);
    gulp.watch(settings.siteScriptsDir+'**/*.js', ['javascript:main']);
    gulp.watch(settings.stylesDir+'**/*.'  + settings.preprocesserExtension, ['style-build']);
});
