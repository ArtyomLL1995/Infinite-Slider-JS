const SLIDER_SETTINGS = 'slider settings'
const wrapper = document.querySelector('.wrapper')
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

let HEIGHT_UNIT
let UNIT
let ENDLESS_SLIDER

// Frame width in UNIT
let initialImgWidth 

// Frame height in HEIGHT_UNIT
let initialImgHeight

// Number of visible pictures in frame
let amountOfPicturesInSlide

// Amount of scrolled pictures per one slide. 
// (amountOfPicturesInSlide + amountOfSlidesPerSlide*2) must not be greater than the whole number of images
let amountOfSlidesPerSlide

// Scroll speed in ms
let speed
let transitionTimingFunction = 'cubic-bezier(0, 0, 0.58, 1.0)'

let numberOfInitialDrownSlides

let imgWidth

const initialCoords = {
    x : 0
}
const currentCoords = {
    x : 0
}
let touchStartTime
let touchEndTime
let mouseRelativePosition = 0
let mouseClickedOnTheElement = false
let marginLeft
let indexNext
let indexPrev

const images = [
    './numbers/1.png',
    './numbers/2.png',
    './numbers/3.png', 
    './numbers/4.png', 
    './numbers/5.png', 
    './numbers/6.png', 
    './numbers/7.png',
    './numbers/8.png',
    './numbers/9.png'
]

let currentMarginLeftOffset = 0

let database

connectDB(SLIDER_SETTINGS)
.then(db => {
    database = db
    getSettingsFromTheDatabase()
})
.catch(error => {
    console.error('error getting database: ', error)
})


function connectDB(tableName) {
    return new Promise((resolve, reject) => {
        const dataBaseOpenRequest = indexedDB.open(tableName, 1);

        dataBaseOpenRequest.onerror = function(err) {
            reject(err);
        }

        dataBaseOpenRequest.onsuccess = function() {
            resolve(dataBaseOpenRequest.result);
        }

        dataBaseOpenRequest.onupgradeneeded = function(e) {
            e.currentTarget.result.createObjectStore(tableName, { keyPath: "key" });
            connectDB(tableName);
        }
    });
}

function getSettingsFromTheDatabase() {
    const transaction = database.transaction(SLIDER_SETTINGS, "readonly"); 
    const sliderSettings = transaction.objectStore(SLIDER_SETTINGS);
    const request = sliderSettings.get(1)
    request.onsuccess = function() {
        setInitialSettings(
            request.result?.loop, 
            request.result?.width, 
            request.result?.widthUnit, 
            request.result?.height, 
            request.result?.heightUnit, 
            request.result?.slidesInFrame, 
            request.result?.slidesPerSlide,
            request.result?.speed
        )
        drawInitialImages()
        setSettingsToInputs()
    };
    request.onerror = function() {
        console.error("Error gettings settings", request.error);
    };
}

function saveSettingsToTheDatabase(reload = true) {

    const transaction = database.transaction(SLIDER_SETTINGS, "readwrite")

    const sliderSettings = transaction.objectStore(SLIDER_SETTINGS)

    const settings = {
        key : 1,
        loop : document.getElementById('infinite').checked,
        width : document.getElementById('slider width').value,
        widthUnit : document.getElementById('width unit').value,
        height : document.getElementById('slider height').value,
        heightUnit : document.getElementById('height unit').value,
        slidesInFrame : document.getElementById('slides in frame').value,
        slidesPerSlide : document.getElementById('slides per slide').value,
        speed : document.getElementById('slider speed').value
    }

    const request = sliderSettings.put(settings)

    request.onsuccess = function() {
        if (reload) {
            window.location.reload()
        }
    }
    
    request.onerror = function() {
        alert('Error saving settins')
    }
}

function setInitialSettings(loop, width, widthUnit, height, heightUnit, slidesInFrame, slidesPerSlide, sp) {
    ENDLESS_SLIDER = loop !== undefined ? loop : true
    initialImgWidth = width !== undefined ? Number(width) : 70
    UNIT = widthUnit !== undefined ? widthUnit : '%'
    initialImgHeight = height !== undefined ? Number(height) : 30
    HEIGHT_UNIT = heightUnit !== undefined ? heightUnit : 'rem'
    amountOfPicturesInSlide = slidesInFrame !== undefined ? slidesInFrame : 3
    amountOfSlidesPerSlide = slidesPerSlide !== undefined ? slidesPerSlide : 2
    speed = sp !== undefined ? sp : 400

    numberOfInitialDrownSlides = amountOfPicturesInSlide + (amountOfSlidesPerSlide * 2)

    imgWidth = UNIT != '%' ? initialImgWidth / amountOfPicturesInSlide : 100 / amountOfPicturesInSlide

    indexNext = images.length - amountOfSlidesPerSlide

    indexPrev = amountOfPicturesInSlide + amountOfSlidesPerSlide

    wrapper.style.width = initialImgWidth + UNIT
}

function setSettingsToInputs() {
    document.getElementById('infinite').checked = ENDLESS_SLIDER
    document.getElementById('slider width').value = initialImgWidth
    document.getElementById('width unit').value = UNIT
    document.getElementById('slider height').value = initialImgHeight
    document.getElementById('height unit').value = HEIGHT_UNIT
    document.getElementById('slides in frame').value = amountOfPicturesInSlide
    document.getElementById('slides per slide').value = amountOfSlidesPerSlide
    document.getElementById('slider speed').value = speed
}

function refreshSettings() {
    saveSettingsToTheDatabase()
}
