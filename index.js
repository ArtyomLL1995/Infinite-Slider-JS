const initialImgWidth = 60 // Frame width in rem
const initialImgHeight = 22 // Frame height in rem
const amountOfPicturesInSlide = 4 // Number of visible pictures in frame
const amountOfSlidesPerSlide = 2 // Amount of scrolled pictures per one slide. (amountOfPicturesInSlide + amountOfSlidesPerSlide*2) should not be greater than the whole number of images
const speed = 400 // Scroll speed in ms
const prev = document.querySelector('.prev')
const next = document.querySelector('.next')
const sliderTrack = document.querySelector('.slider-track')
const transitionTimingFunction = 'cubic-bezier(0, 0, 0.58, 1.0)'
const numberOfInitialDrownSlides = amountOfPicturesInSlide + (amountOfSlidesPerSlide * 2)
const imgWidth = initialImgWidth / amountOfPicturesInSlide
const images = [
    './numbers/1.png',
    './numbers/2.png',
    './numbers/3.png', 
    './numbers/4.png', 
    './numbers/5.png', 
    './numbers/6.png', 
    './numbers/7.png', 
    './numbers/8.png',
    './numbers/9.png',
    './numbers/10.png'
]
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
let indexNext = images.length - amountOfSlidesPerSlide
let indexPrev = amountOfPicturesInSlide + amountOfSlidesPerSlide
let slideSwitcher = true
sliderTrack.style.width = initialImgWidth + 'rem'

const displayedImages = []

function drawInitialImages() {
    let index = indexNext
    for (let i = 0; i < numberOfInitialDrownSlides; i++) {
        if (index === images.length) index = 0
        const img = drawNewImg(index)
        if (i === 0) img.style.marginLeft = -(imgWidth * amountOfSlidesPerSlide) + 'rem'
        displayedImages.push(img)
        sliderTrack.append(img)
        index++
    }
}

function slideNext() {
    if (slideSwitcher) {
        changeFirstImageStyle('0rem')
        setTimeout(() => {
            for (let i = 0; i < amountOfSlidesPerSlide; i++) {
                indexNext -= 1
                indexPrev -= 1
                if (indexNext < 0) indexNext = images.length - 1
                if (indexPrev < 0) indexPrev = images.length - 1
                displayedImages[displayedImages.length-1].remove()
                const img = drawNewImg(indexNext)
                displayedImages.unshift(img)
                displayedImages.pop()
                sliderTrack.prepend(img)
            }
            finishAnimation()
        }, speed)
    } else {
        return
    }
}

function slidePrev() {
    if (slideSwitcher) {
        changeFirstImageStyle(-imgWidth * (2 * amountOfSlidesPerSlide) + 'rem')
        setTimeout(() => {
            for (let i = 0; i < amountOfSlidesPerSlide; i++) {
                indexPrev += 1
                indexNext += 1
                if (indexPrev > images.length - 1) indexPrev = 0
                if (indexNext > images.length - 1) indexNext = 0
                displayedImages[0].remove() 
                const img = drawNewImg(indexPrev)
                displayedImages.push(img)
                displayedImages.shift()
                sliderTrack.append(img)
            }
            finishAnimation()
        }, speed)
    } else {
        return
    }
}

function changeFirstImageStyle(left) {
    slideSwitcher = false
    displayedImages[0].style.transition = speed + 'ms'
    displayedImages[0].style.transitionTimingFunction = transitionTimingFunction;
    displayedImages[0].style.marginLeft = left
}

function finishAnimation() {
    displayedImages[0].style.transition = 0 + 's'
    displayedImages[0].style.marginLeft = -imgWidth * amountOfSlidesPerSlide + 'rem'
    slideSwitcher = true
}

function handleMouseDown(event) {
    if (slideSwitcher) {
        event.preventDefault();
        event.stopPropagation();
        touchStartTime = Date.parse(new Date)
        displayedImages[0].style.transition = 0 + 'ms'
        initialCoords.x = event.pageX
        const style = displayedImages[0].currentStyle || window.getComputedStyle(displayedImages[0]);
        marginLeft = style.marginLeft
        mouseClickedOnTheElement = true
    }
}

function handleMouseMove(event) {
    if (slideSwitcher) {
        event.preventDefault();
        event.stopPropagation();
        if (mouseClickedOnTheElement) {
            currentCoords.x = event.pageX
            mouseRelativePosition = parseInt(currentCoords.x) - parseInt(initialCoords.x)
            displayedImages[0].style.marginLeft = (parseInt(marginLeft) + mouseRelativePosition) + 'px'
        }
    }
}

function handleMouseUp(event) {
    if (slideSwitcher) {
        event.preventDefault();
        event.stopPropagation();
        touchEndTime = Date.parse(new Date)
        if (mouseClickedOnTheElement) {
            if (mouseRelativePosition > 0) {
                handleSlide(slideNext)
            } else {
                handleSlide(slidePrev)
            }
            mouseRelativePosition = 0
            mouseClickedOnTheElement = false
        } 
    }
}

function drawNewImg(index) {
    const img = document.createElement('img')
    img.src = images[index]
    img.style.width = imgWidth + 'rem'
    img.style.height = initialImgHeight + 'rem'
    return img
}

function handleSlide(callback) {
    if (Math.abs(mouseRelativePosition) > 10 && Math.abs(mouseRelativePosition) > Math.abs(parseInt(marginLeft)/2)) {
        callback()
    } else {
        if (Math.abs(mouseRelativePosition) > 10 && touchEndTime - touchStartTime < 200) {
            callback()
        } else {
            displayedImages[0].style.transition = speed + 'ms'
            displayedImages[0].style.marginLeft = parseInt(marginLeft) + 'px'
        }
    }
}

function handleKeyPress(event) {
    if (event.key === 'ArrowRight') {
        slideNext()
    } else if (event.key === 'ArrowLeft') {
        slidePrev()
    }
}

drawInitialImages()
next.addEventListener('click', slideNext)
prev.addEventListener('click', slidePrev)
sliderTrack.addEventListener('mousedown', handleMouseDown)
sliderTrack.addEventListener('mousemove', handleMouseMove)
window.addEventListener('mouseup', handleMouseUp)
window.addEventListener('keydown', handleKeyPress)

// add touch event handling