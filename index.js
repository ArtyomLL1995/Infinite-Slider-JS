const prev = document.querySelector('.prev')
const next = document.querySelector('.next')
const sliderTrack = document.querySelector('.slider-track')

let slideSwitcher = true

const displayedImages = []

function drawInitialImages() {
    let index = indexNext
    for (let i = 0; i < numberOfInitialDrownSlides; i++) {
        if (ENDLESS_SLIDER) {
            if (index === images.length) {
                index = 0
            } 
            const img = drawNewImg(index)
            if (i === 0) {
                img.style.marginLeft = -(imgWidth * amountOfSlidesPerSlide) + UNIT
            } 
            displayedImages.push(img)
            sliderTrack.append(img)
            index++
        } else {
            const img = drawNewImg(i)
            displayedImages.push(img)
            sliderTrack.append(img)
        }
    }
}

function slideNext() {
    if (slideSwitcher) {
        if (ENDLESS_SLIDER) {
            changeFirstImageStyle('0' + UNIT)
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
            if (Math.floor(currentMarginLeftOffset) < 0) {
                changeFirstImageStyle((currentMarginLeftOffset + (imgWidth * amountOfSlidesPerSlide)) + UNIT)
                currentMarginLeftOffset += imgWidth * amountOfSlidesPerSlide
            } else if (Math.floor(currentMarginLeftOffset) === 0) {
                changeFirstImageStyle(0 + UNIT)
            }
            setTimeout(() => {
                slideSwitcher = true
            }, speed)
        }
    }
}

function slidePrev() {
    if (slideSwitcher) {
        if (ENDLESS_SLIDER) {
            changeFirstImageStyle(-imgWidth * (2 * amountOfSlidesPerSlide) + UNIT)
            setTimeout(() => {
                for (let i = 0; i < amountOfSlidesPerSlide; i++) {
                    if (indexPrev > images.length - 1) indexPrev = 0
                    if (indexNext > images.length - 1) indexNext = 0
                    displayedImages[0].remove() 
                    const img = drawNewImg(indexPrev)
                    displayedImages.push(img)
                    displayedImages.shift()
                    sliderTrack.append(img)
                    indexPrev += 1
                    indexNext += 1
                }
                finishAnimation()
            }, speed)
        } else {
            if (Math.floor(currentMarginLeftOffset) <= 0 && Math.abs(currentMarginLeftOffset) < Math.abs(imgWidth * images.length) - Math.abs(imgWidth * amountOfPicturesInSlide)) {

                changeFirstImageStyle((currentMarginLeftOffset - (imgWidth * amountOfSlidesPerSlide)) + UNIT)

                currentMarginLeftOffset -= imgWidth * amountOfSlidesPerSlide

                const newImages = []
                for (let i = displayedImages.length; i < displayedImages.length + amountOfSlidesPerSlide; i++) {
                    if (images[i]) {
                        const img = drawNewImg(i)
                        newImages.push(img)
                    }
                }
                newImages.forEach(image => {
                    displayedImages.push(image)
                    sliderTrack.append(image)
                })
            } else {
                changeFirstImageStyle(currentMarginLeftOffset + UNIT)
            }
            setTimeout(() => {
                slideSwitcher = true
            }, speed)
        }
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
    displayedImages[0].style.marginLeft = -imgWidth * amountOfSlidesPerSlide + UNIT
    slideSwitcher = true
}

function handleMouseDown(event) {
    if (slideSwitcher) {
        event.preventDefault();
        event.stopPropagation();
        touchStartTime = Date.parse(new Date)
        displayedImages[0].style.transition = 0 + 'ms'
        initialCoords.x = event.changedTouches ? event.changedTouches[0].pageX : event.pageX
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
            currentCoords.x = event.changedTouches ? event.changedTouches[0].pageX : event.pageX
            mouseRelativePosition = parseInt(currentCoords.x) - parseInt(initialCoords.x)
            if (Math.abs(mouseRelativePosition) < sliderTrack.offsetWidth / 2) {
                displayedImages[0].style.marginLeft = (parseInt(marginLeft) + mouseRelativePosition) + 'px'
            }
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
    img.style.width = imgWidth + UNIT
    img.style.height = initialImgHeight + HEIGHT_UNIT
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
        slidePrev()
    } else if (event.key === 'ArrowLeft') {
        slideNext()
    }
}

next.addEventListener('click', slidePrev)
prev.addEventListener('click', slideNext)
sliderTrack.addEventListener('mousedown', handleMouseDown)
sliderTrack.addEventListener('mousemove', handleMouseMove)
sliderTrack.addEventListener('touchstart', handleMouseDown)
sliderTrack.addEventListener('touchmove', handleMouseMove)
window.addEventListener('mouseup', handleMouseUp)
window.addEventListener('touchend', handleMouseUp)
window.addEventListener('keydown', handleKeyPress)

// add touch event handling